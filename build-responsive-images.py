#!/usr/bin/env python3
"""Generate 480/960/1600 WebP and JPEG copies for content photos and point pages at them."""

import json
import re
from pathlib import Path
from urllib.parse import quote, unquote

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
WIDTHS = (480, 960, 1600)
QUALITY = 80
SKIP_NAMES = {"ladies-mark.png", "favicon.svg", "favicon.ico"}
HTML_FILES = sorted(p for p in ROOT.glob("*.html"))

IMG_TAG = re.compile(r"<img\b[^>]*>", re.I)
TOKEN = re.compile(
    r"<!--.*?-->|<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>|</?[a-zA-Z][^>]*>",
    re.I | re.S,
)
ATTR = re.compile(
    r"""([:@\w.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?"""
)


def unquote_path(src):
    return unquote(src.split("?")[0].split("#")[0])


def quote_path(rel):
    return "/".join(quote(part) for part in Path(rel).as_posix().split("/"))


def is_content_src(src):
    if not src or src.startswith(("http://", "https://", "data:", "//")):
        return False
    path = unquote_path(src)
    name = Path(path).name.lower()
    if name in SKIP_NAMES or "ladies-mark" in name:
        return False
    return Path(path).suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}


def target_widths(original_width):
    widths = [w for w in WIDTHS if w <= original_width]
    if original_width not in widths:
        widths.append(original_width)
    return widths


def save_variants(src_rel, manifest):
    path = ROOT / unquote_path(src_rel)
    if not path.is_file():
        return None
    key = path.relative_to(ROOT).as_posix()
    if key in manifest:
        return manifest[key]
    with Image.open(path) as raw:
        img = ImageOps.exif_transpose(raw)
        width, height = img.size
        widths = target_widths(width)
        stem = path.with_suffix("")
        has_alpha = img.mode in {"RGBA", "LA"} or (img.mode == "P" and "transparency" in img.info)
        for w in widths:
            if w == width:
                resized = img
            else:
                h = max(1, round(height * (w / width)))
                resized = img.resize((w, h), Image.Resampling.LANCZOS)
            webp_path = Path(f"{stem}-{w}.webp")
            jpg_path = Path(f"{stem}-{w}.jpg")
            if not webp_path.exists():
                webp = resized if resized.mode in {"RGB", "RGBA"} else resized.convert("RGBA" if has_alpha else "RGB")
                webp.save(webp_path, "WEBP", quality=QUALITY, method=4)
            if not jpg_path.exists():
                flat = resized.convert("RGBA") if has_alpha or resized.mode == "P" else resized.convert("RGB")
                if flat.mode == "RGBA":
                    bg = Image.new("RGB", flat.size, (246, 240, 227))
                    bg.paste(flat, mask=flat.getchannel("A"))
                    flat = bg
                elif flat.mode != "RGB":
                    flat = flat.convert("RGB")
                flat.save(jpg_path, "JPEG", quality=QUALITY, optimize=True)
    info = {"w": width, "h": height, "widths": widths}
    manifest[key] = info
    return info


def parse_attrs(tag):
    body = tag[4:-1].strip()
    if body.endswith("/"):
        body = body[:-1].strip()
    attrs = []
    for match in ATTR.finditer(body):
        name = match.group(1)
        if name == "img":
            continue
        value = match.group(2)
        if value is None:
            value = match.group(3)
        if value is None:
            value = match.group(4)
        attrs.append((name, value))
    return attrs


def attr_map(attrs):
    return {name.lower(): value for name, value in attrs}


def render_attrs(attrs):
    parts = []
    for name, value in attrs:
        if value is None:
            parts.append(name)
        else:
            parts.append(f'{name}="{value}"')
    return " ".join(parts)


def fallback_width(widths):
    for w in widths:
        if w >= 960:
            return w
    return widths[-1]


def srcset_for(key, widths, ext):
    stem = Path(key).with_suffix("").as_posix()
    return ", ".join(f"{quote_path(stem)}-{w}.{ext} {w}w" for w in widths)


def sizes_for(classes, ancestors):
    blob = " ".join(ancestors + [classes])
    if "tile-fade" in blob or re.search(r"(?:^|\s)tile(?:\s|$)", blob):
        return "(min-width: 900px) 18rem, 46vw"
    if "hero-rotator" in blob:
        return "(min-width: 700px) 36rem, calc(100vw - 1.5rem)"
    if "view-fade" in blob or "home-sunrise" in blob:
        return "(min-width: 800px) 70rem, calc(100vw - 1.5rem)"
    if "slide-slot" in blob:
        return "(min-width: 700px) 15rem, 30vw"
    if "food-item" in blob:
        return "(min-width: 600px) 15rem, 46vw"
    if "photo-fade--tall" in blob:
        return "(min-width: 800px) 28rem, 70vw"
    if "photo-fade" in blob:
        return "(min-width: 800px) 46rem, calc(100vw - 1.5rem)"
    if "quote-photo" in classes:
        return "19rem"
    if "cerna-friend" in blob:
        return "13rem"
    if "groups-show" in blob:
        return "(min-width: 800px) 70rem, calc(100vw - 1.5rem)"
    if "article-scan" in blob or "article-card" in blob:
        return "(min-width: 800px) 40rem, calc(100vw - 1.5rem)"
    if "contact-photos" in blob:
        return "(min-width: 600px) 15rem, calc(100vw - 1.5rem)"
    if "story-photos" in blob:
        return "(min-width: 700px) 22rem, calc(100vw - 1.5rem)"
    if "hotel-fun" in blob:
        return "11rem"
    return "(min-width: 800px) 46rem, calc(100vw - 1.5rem)"


def below_fold(classes, ancestors, attrs):
    loading = (attr_map(attrs).get("loading") or "").lower()
    if loading == "eager":
        return False
    if "hero-rotator" in ancestors:
        return False
    if "groups-show" in ancestors and "is-shown" in classes.split():
        return False
    return True


def rewrite_img(tag, ancestors, manifest):
    attrs = parse_attrs(tag)
    amap = attr_map(attrs)
    src = amap.get("src")
    if not is_content_src(src or ""):
        return tag
    if "picture" in ancestors:
        return tag
    info = save_variants(src, manifest)
    if not info:
        return tag
    key = (ROOT / unquote_path(src)).relative_to(ROOT).as_posix()
    classes = amap.get("class") or ""
    sizes = sizes_for(classes, ancestors)
    widths = info["widths"]
    jpg_src = srcset_for(key, widths, "jpg")
    webp_src = srcset_for(key, widths, "webp")
    fallback = f"{quote_path(Path(key).with_suffix('').as_posix())}-{fallback_width(widths)}.jpg"
    new_attrs = []
    seen = set()
    for name, value in attrs:
        low = name.lower()
        if low in {"src", "srcset", "sizes", "width", "height"}:
            continue
        if low == "loading" and below_fold(classes, ancestors, attrs):
            continue
        new_attrs.append((name, value))
        seen.add(low)
    new_attrs.insert(0, ("src", fallback))
    # Keep src near the start, then the rest, then responsive hints at the end.
    # Reorder: original non-src attrs, then src/srcset/sizes/width/height/loading/decoding.
    kept = [(n, v) for n, v in new_attrs if n.lower() != "src"]
    final = [("src", fallback)] + kept
    final.append(("data-full", key))
    final.append(("srcset", jpg_src))
    final.append(("sizes", sizes))
    final.append(("width", str(info["w"])))
    final.append(("height", str(info["h"])))
    if below_fold(classes, ancestors, attrs):
        if "loading" not in seen:
            final.append(("loading", "lazy"))
        if "decoding" not in {n.lower() for n, _ in final}:
            final.append(("decoding", "async"))
    img = "<img " + render_attrs(final) + ">"
    source = f'<source type="image/webp" srcset="{webp_src}" sizes="{sizes}">'
    return "<picture>" + source + img + "</picture>"


def ancestor_names(stack):
    names = []
    for classes in stack:
        if classes:
            names.append(classes)
    return names


def transform_html(text, manifest):
    out = []
    pos = 0
    stack = []
    for match in TOKEN.finditer(text):
        out.append(text[pos:match.start()])
        token = match.group(0)
        pos = match.end()
        if token.startswith("<!--") or token.lower().startswith("<script") or token.lower().startswith("<style"):
            out.append(token)
            continue
        if token.startswith("</"):
            if stack:
                stack.pop()
            out.append(token)
            continue
        tag_name = re.match(r"<([a-zA-Z0-9:-]+)", token).group(1).lower()
        if tag_name == "img":
            out.append(rewrite_img(token, ancestor_names(stack), manifest))
        else:
            out.append(token)
        if token.endswith("/>") or tag_name in {"img", "source", "br", "meta", "link", "input", "hr"}:
            continue
        classes = ""
        class_match = re.search(r'\bclass\s*=\s*"([^"]*)"', token)
        if class_match:
            classes = class_match.group(1)
        stack.append(classes)
    out.append(text[pos:])
    return "".join(out)


def main():
    manifest = {}
    # Generate from every referenced content image first so slideshow paths exist
    # even when an image is only listed in data-images.
    ref_re = re.compile(r"images/[^\s\"']+\.(?:jpe?g|png|webp)", re.I)
    for html in HTML_FILES:
        text = html.read_text(encoding="utf-8")
        for src in ref_re.findall(text):
            if is_content_src(src):
                save_variants(src, manifest)
        updated = transform_html(text, manifest)
        if updated != text:
            html.write_text(updated, encoding="utf-8")
            print("updated", html.name)
    manifest_path = ROOT / "responsive-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    js_path = ROOT / "script.js"
    js = js_path.read_text(encoding="utf-8")
    payload = "window.RESPONSIVE_IMAGES = " + json.dumps(manifest, separators=(",", ":")) + ";\n"
    js = re.sub(r"window\.RESPONSIVE_IMAGES = \{.*?\};\n", "", js, count=1, flags=re.S)
    js_path.write_text(payload + js, encoding="utf-8")
    for html in HTML_FILES:
        text = html.read_text(encoding="utf-8")
        updated = text.replace("styles.css?v=20261017photos", "styles.css?v=20261017responsive")
        updated = updated.replace("script.js?v=2", "script.js?v=3")
        if updated != text:
            html.write_text(updated, encoding="utf-8")
    print("images", len(manifest))


if __name__ == "__main__":
    main()
