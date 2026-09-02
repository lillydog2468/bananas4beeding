/* Keith: to change dates, edit OPEN and BUSY below, then save. */
const OPEN = [];
const BUSY = [
  '2026-01-23','2026-01-24','2026-01-25','2026-02-08','2026-02-09','2026-02-10',
  '2026-02-11','2026-02-12','2026-02-13','2026-03-04','2026-03-15','2026-03-16',
  '2026-03-17','2026-03-18','2026-03-19','2026-03-20','2026-03-21','2026-03-22',
  '2026-03-23','2026-03-24','2026-03-25','2026-03-26','2026-03-27','2026-04-07',
  '2026-04-08','2026-04-09','2026-04-10','2026-04-13','2026-04-14','2026-04-15',
  '2026-04-16','2026-04-17','2026-04-22','2026-04-27','2026-04-29','2026-05-04',
  '2026-05-05','2026-05-06','2026-05-07','2026-05-11','2026-05-12','2026-05-13',
  '2026-05-14','2026-05-15','2026-05-18','2026-05-21','2026-05-22','2026-05-23',
  '2026-05-24','2026-05-25','2026-05-26','2026-05-27','2026-05-28','2026-05-29',
  '2026-06-01','2026-06-02','2026-06-03','2026-06-04','2026-06-05','2026-06-06',
  '2026-06-07','2026-06-12','2026-06-29','2026-06-30','2026-07-01','2026-07-02',
  '2026-07-03','2026-07-04','2026-07-05','2026-07-06','2026-07-07','2026-07-08',
  '2026-07-09','2026-07-19','2026-07-20','2026-07-21','2026-07-22','2026-07-23',
  '2026-07-24','2026-07-25','2026-07-26','2026-07-27','2026-07-28','2026-07-29',
  '2026-07-30','2026-07-31','2026-08-01','2026-08-08','2026-08-09','2026-08-10',
  '2026-08-11','2026-08-12','2026-08-13','2026-08-14','2026-08-15','2026-09-07',
  '2026-09-08','2026-09-09','2026-09-10','2026-09-11','2026-09-12','2026-09-13',
  '2026-09-14','2026-09-15','2026-09-16','2026-09-19','2026-09-21','2026-09-22',
  '2026-09-23','2026-09-24','2026-09-25','2026-10-04','2026-10-05','2026-10-06',
  '2026-10-07','2026-10-08','2026-10-27','2026-10-28','2026-10-29','2026-10-30',
  '2026-10-31','2027-09-06','2027-09-07','2027-09-08','2027-09-09','2027-09-10',
  '2027-10-02','2027-10-03','2027-10-04','2027-10-05','2027-10-06','2027-10-07',
  '2027-10-08','2027-10-09','2027-10-10'
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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let i = 0;
  setInterval(function () {
    slides[i].classList.remove('is-active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('is-active');
  }, 5000);
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.year-grid[data-year]').forEach(drawYear);
  setupTabs();
  setupMailtoForm();
  setupHeroRotator();
});
