/* Keith: to change dates, edit OPEN and BUSY below, then save. */
const OPEN = [
];
const BUSY = [
  '2026-01-23',
  '2026-01-24',
  '2026-01-25',
  '2026-02-08',
  '2026-02-09',
  '2026-02-10',
  '2026-02-11',
  '2026-02-12',
  '2026-02-13',
  '2026-03-04',
  '2026-03-15',
  '2026-03-16',
  '2026-03-17',
  '2026-03-18',
  '2026-03-19',
  '2026-03-20',
  '2026-03-21',
  '2026-03-22',
  '2026-03-23',
  '2026-03-24',
  '2026-03-25',
  '2026-03-26',
  '2026-03-27',
  '2026-04-07',
  '2026-04-08',
  '2026-04-09',
  '2026-04-10',
  '2026-04-13',
  '2026-04-14',
  '2026-04-15',
  '2026-04-16',
  '2026-04-17',
  '2026-04-22',
  '2026-04-27',
  '2026-04-29',
  '2026-05-04',
  '2026-05-05',
  '2026-05-06',
  '2026-05-07',
  '2026-05-11',
  '2026-05-12',
  '2026-05-13',
  '2026-05-14',
  '2026-05-15',
  '2026-05-18',
  '2026-05-21',
  '2026-05-22',
  '2026-05-23',
  '2026-05-24',
  '2026-05-25',
  '2026-05-26',
  '2026-05-27',
  '2026-05-28',
  '2026-05-29',
  '2026-06-01',
  '2026-06-02',
  '2026-06-03',
  '2026-06-04',
  '2026-06-05',
  '2026-06-06',
  '2026-06-07',
  '2026-06-12',
  '2026-06-29',
  '2026-06-30',
  '2026-07-01',
  '2026-07-02',
  '2026-07-03',
  '2026-07-04',
  '2026-07-05',
  '2026-07-06',
  '2026-07-07',
  '2026-07-08',
  '2026-07-09',
  '2026-07-19',
  '2026-07-20',
  '2026-07-21',
  '2026-07-22',
  '2026-07-23',
  '2026-07-24',
  '2026-07-25',
  '2026-07-26',
  '2026-07-27',
  '2026-07-28',
  '2026-07-29',
  '2026-07-30',
  '2026-07-31',
  '2026-08-01',
  '2026-08-08',
  '2026-08-09',
  '2026-08-10',
  '2026-08-11',
  '2026-08-12',
  '2026-08-13',
  '2026-08-14',
  '2026-08-15',
  '2026-09-07',
  '2026-09-08',
  '2026-09-09',
  '2026-09-10',
  '2026-09-11',
  '2026-09-12',
  '2026-09-13',
  '2026-09-14',
  '2026-09-15',
  '2026-09-16',
  '2026-09-19',
  '2026-09-21',
  '2026-09-22',
  '2026-09-23',
  '2026-09-24',
  '2026-09-25',
  '2026-10-04',
  '2026-10-05',
  '2026-10-06',
  '2026-10-07',
  '2026-10-08',
  '2026-10-27',
  '2026-10-28',
  '2026-10-29',
  '2026-10-30',
  '2026-10-31',
  '2027-09-06',
  '2027-09-07',
  '2027-09-08',
  '2027-09-09',
  '2027-09-10',
  '2027-09-18',
  '2027-09-19',
  '2027-10-02',
  '2027-10-03',
  '2027-10-04',
  '2027-10-05',
  '2027-10-06',
  '2027-10-07',
  '2027-10-08',
  '2027-10-09',
  '2027-10-10',
];

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function pad(n) { return String(n).padStart(2, '0'); }
function daysInMonth(year, m) { return new Date(year, m + 1, 0).getDate(); }
function sundayOffset(year, m) { return new Date(year, m, 1).getDay(); }

function buildMonth(year, m) {
  const wrap = document.createElement('section');
  wrap.className = 'month';
  wrap.setAttribute('aria-label', MONTH_NAMES[m] + ' ' + year);
  const h = document.createElement('h3');
  h.textContent = MONTH_NAMES[m] + ' ' + year;
  wrap.appendChild(h);
  const dow = document.createElement('div');
  dow.className = 'dow';
  ['SU','MO','TU','WE','TH','FR','SA'].forEach(function (d) {
    const s = document.createElement('span'); s.textContent = d; dow.appendChild(s);
  });
  wrap.appendChild(dow);
  const grid = document.createElement('div');
  grid.className = 'days';
  for (let i = 0; i < sundayOffset(year, m); i++) {
    const e = document.createElement('span'); e.className = 'day empty'; e.setAttribute('aria-hidden','true'); grid.appendChild(e);
  }
  const last = daysInMonth(year, m);
  let hadOpen = false;
  for (let d = 1; d <= last; d++) {
    const cell = document.createElement('span');
    const iso = year + '-' + pad(m + 1) + '-' + pad(d);
    cell.className = 'day';
    cell.setAttribute('data-date', iso);
    cell.textContent = d;
    if (OPEN.indexOf(iso) !== -1) { cell.classList.add('open'); hadOpen = true; }
    if (BUSY.indexOf(iso) !== -1) cell.classList.add('busy');
    grid.appendChild(cell);
  }
  wrap.appendChild(grid);
  if (hadOpen) {
    const lab = document.createElement('span');
    lab.className = 'spaces-label';
    lab.textContent = 'spaces';
    wrap.appendChild(lab);
  }
  return wrap;
}

function drawYear(container) {
  const year = parseInt(container.getAttribute('data-year'), 10);
  container.innerHTML = '';
  for (let m = 0; m < 12; m++) container.appendChild(buildMonth(year, m));
}

function setupTabs() {
  const tabs = document.querySelectorAll('.year-tabs [role="tab"]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = t !== tab;
      });
    });
  });
}

function setupMailtoForm() {
  const form = document.getElementById('enquire-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const val = function (id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const lines = ['Name: ' + val('name'), 'Email: ' + val('email'), 'Preferred dates: ' + val('dates'), 'Tour length: ' + val('length'), 'Group size: ' + val('size'), '', val('message')];
    const subject = encodeURIComponent('Beading tour enquiry from ' + (val('name') || 'website'));
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = 'mailto:bananas4beading@icloud.com?subject=' + subject + '&body=' + body;
  });
}

function setupHeroRotator() {
  const box = document.querySelector('.hero-rotator');
  if (!box) return;
  const slides = box.querySelectorAll('img');
  if (slides.length < 2) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0;
  function show() {
    const two = window.matchMedia('(min-width: 700px)').matches;
    const count = two ? Math.min(2, slides.length) : 1;
    slides.forEach(function (img) { img.classList.remove('is-active'); });
    for (let n = 0; n < count; n++) {
      slides[(i + n) % slides.length].classList.add('is-active');
    }
  }
  show();
  if (reduce) return;
  setInterval(function () {
    i = (i + 1) % slides.length;
    show();
  }, 5000);
}




function setupTourSeasonAnalytics() {
  if (typeof gtag !== 'function') return;
  var path = (location.pathname || '').toLowerCase();
  var page = path.split('/').pop() || 'index.html';
  if (!page || page.indexOf('.') === -1) page = 'index.html';

  var pageEvents = {
    'pricing.html': 'view_pricing',
    'dates.html': 'view_dates',
    'tour-inspiration.html': 'view_tour_inspiration',
    'tours.html': 'view_tour_inspiration',
    'day-trips.html': 'view_day_trips',
    'contact.html': 'view_contact',
    'happy-customers.html': 'view_happy_customers'
  };
  if (pageEvents[page]) {
    gtag('event', pageEvents[page], {
      event_category: 'tour_season',
      page_path: location.pathname + location.search
    });
  }

  document.querySelectorAll('a.btn').forEach(function (a) {
    a.addEventListener('click', function () {
      var href = (a.getAttribute('href') || '').toLowerCase();
      var label = (a.textContent || '').trim().slice(0, 80);
      var name = 'cta_click';
      if (href.indexOf('contact') !== -1 || /enquir/i.test(label)) name = 'enquire_click';
      else if (href.indexOf('pricing') !== -1 || /price/i.test(label)) name = 'pricing_click';
      else if (href.indexOf('dates') !== -1) name = 'dates_click';
      else if (href.indexOf('tour') !== -1 || href.indexOf('tours') !== -1) name = 'tour_click';
      gtag('event', name, {
        event_category: 'tour_season',
        event_label: label,
        link_url: href
      });
    });
  });

  var form = document.getElementById('enquire-form');
  if (form) {
    form.addEventListener('submit', function () {
      gtag('event', 'enquire_submit', {
        event_category: 'tour_season',
        event_label: 'contact_form'
      });
    });
  }
}

function setupTourSlideshows() {
  const rows = document.querySelectorAll('[data-slideshow]');
  if (!rows.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  rows.forEach(function (row) {
    let images;
    try { images = JSON.parse(row.getAttribute('data-images') || '[]'); }
    catch (e) { return; }
    if (!images.length) return;
    const imgs = row.querySelectorAll('.slide-slot img');
    if (!imgs.length) return;
    let offset = 0;
    function paint() {
      imgs.forEach(function (img, slot) {
        const src = images[(offset + slot) % images.length];
        if (img.getAttribute('src') === src) return;
        img.classList.add('is-fading');
        window.setTimeout(function () {
          img.src = src;
          img.classList.remove('is-fading');
        }, 200);
      });
    }
    paint();
    if (reduce || images.length <= 3) return;
    // Advance by a full row so a photo never slides from one box into another
    window.setInterval(function () {
      offset = (offset + imgs.length) % images.length;
      paint();
    }, 4500);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.year-grid[data-year]').forEach(drawYear);
  setupTabs();
  setupMailtoForm();
  setupHeroRotator();
  setupTourSlideshows();
  setupTourSeasonAnalytics();
});
