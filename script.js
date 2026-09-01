/* Keith: to change dates, edit OPEN and BUSY below, then save. */
const OPEN = [
  '2026-04-07','2026-04-08','2026-04-09','2026-04-10','2026-04-11',
  '2026-06-02','2026-06-03','2026-06-04','2026-06-05','2026-06-06'
];
const BUSY = []; // add 'YYYY-MM-DD' when you have booked weeks

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

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.year-grid[data-year]').forEach(drawYear);
  setupTabs();
  setupMailtoForm();
});
