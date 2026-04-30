/* ═══════════════════════════════════════════════════════════
   EDITEUR.JS — HELPDEV Éditeur Web
═══════════════════════════════════════════════════════════ */

let activeTab = 'html';
let autoRun   = false;
let autoTimer = null;
let nLog = 0, nWarn = 0, nErr = 0;

const DEFAULTS = {
  html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Mon projet</title>
</head>
<body>
  <h1>Bonjour HELPDEV !</h1>
  <p>Modifie ce code et clique sur <strong>▶ Exécuter</strong>.</p>
  <button id="btn">Clique-moi !</button>
</body>
</html>`,

  css: `body {
  font-family: "Segoe UI", sans-serif;
  background: #0f1117;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  gap: 20px;
}
h1 { font-size: 2rem; color: #2cff72; letter-spacing: -0.5px; }
p  { color: #94a3b8; }
button {
  padding: 12px 32px;
  background: #2cff72;
  color: #051108;
  border: none;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  letter-spacing: 1px;
  transition: opacity 0.2s;
}
button:hover { opacity: 0.8; }`,

  js: `const btn = document.getElementById('btn');
let count = 0;

btn.addEventListener('click', () => {
  count++;
  btn.textContent = 'Cliqué ' + count + ' fois !';
  console.log('Clic n°' + count);
});

console.log('Script chargé avec succès !');`
};

window.addEventListener('DOMContentLoaded', () => {
  const saved = loadStorage();
  ['html', 'css', 'js'].forEach(t => {
    document.getElementById('ed-' + t).value = saved[t] || DEFAULTS[t];
    updateLines(t);
  });
  runCode();
  startClock();
  initResize();
});

function switchTab(tab) {
  activeTab = tab;
  ['html', 'css', 'js'].forEach(t => {
    document.getElementById('panel-' + t).classList.toggle('active', t === tab);
    document.getElementById('tab-' + t).classList.toggle('active', t === tab);
  });
  document.getElementById('sb-tab').textContent = tab.toUpperCase();
  updateCursor();
}

function onInput(tab) {
  updateLines(tab);
  saveStorage();
  document.getElementById('charCount').textContent =
    document.getElementById('ed-' + activeTab).value.length + ' chars';
  if (autoRun) {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(runCode, 700);
  }
}

function updateLines(tab) {
  const ta    = document.getElementById('ed-' + tab);
  const count = ta.value.split('\n').length;
  document.getElementById('ln-' + tab).innerHTML =
    Array.from({ length: count }, (_, i) => i + 1).join('<br>');
  document.getElementById('meta-' + tab).textContent =
    count + ' ligne' + (count > 1 ? 's' : '');
}

function syncScroll(tab) {
  document.getElementById('ln-' + tab).scrollTop =
    document.getElementById('ed-' + tab).scrollTop;
}

function updateCursor() {
  const ta    = document.getElementById('ed-' + activeTab);
  const txt   = ta.value.substring(0, ta.selectionStart);
  const lines = txt.split('\n');
  const info  = 'Ln ' + lines.length + ', Col ' + (lines[lines.length - 1].length + 1);
  document.getElementById('cursorPos').textContent = info;
  document.getElementById('sb-cursor').textContent  = info;
}

function handleTab(e) {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  const ta = e.target;
  const s  = ta.selectionStart;
  ta.value = ta.value.substring(0, s) + '  ' + ta.value.substring(ta.selectionEnd);
  ta.selectionStart = ta.selectionEnd = s + 2;
  onInput(activeTab);
}

function runCode() {
  const t0   = performance.now();
  const html = document.getElementById('ed-html').value;
  const css  = document.getElementById('ed-css').value;
  const js   = document.getElementById('ed-js').value;

  const intercept = `<script>(function(){
    function send(lvl, args) {
      window.parent.postMessage({
        src: 'helpdev', lvl,
        msg: Array.from(args).map(a => {
          try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); }
          catch(e) { return String(a); }
        }).join(' ')
      }, '*');
    }
    console.log   = (...a) => send('log',  a);
    console.warn  = (...a) => send('warn', a);
    console.error = (...a) => send('err',  a);
    window.onerror = (msg, s, line) => {
      send('err', ['[JS ERROR] ' + msg + ' (ligne ' + line + ')']);
      return false;
    };
  })();<\/script>`;

  let doc = html;
  const styleBlock  = '<style>\n' + css + '\n</style>';
  const scriptBlock = intercept + '\n<script>\n' + js + '\n<\/script>';

  if (doc.includes('</head>')) doc = doc.replace('</head>', styleBlock + '\n</head>');
  else doc = styleBlock + '\n' + doc;

  if (doc.includes('</body>')) doc = doc.replace('</body>', scriptBlock + '\n</body>');
  else doc += '\n' + scriptBlock;

  document.getElementById('previewFrame').srcdoc = doc;

  const ms = Math.round(performance.now() - t0);
  document.getElementById('renderTime').textContent      = ms + 'ms';
  document.getElementById('previewStatus').textContent   = '● OK';
  document.getElementById('previewStatus').className     = 'preview-status preview-status--ok';
  document.getElementById('statusMsg').textContent       = '● RENDU OK';
  document.getElementById('statusMsg').className         = 'status-badge status-badge--ok';
  addLog('ok', '[RUN] Rendu effectué en ' + ms + 'ms');
}

window.addEventListener('message', e => {
  if (!e.data || e.data.src !== 'helpdev') return;
  addLog(e.data.lvl, e.data.msg);
});

function setLayout(mode) {
  const cp = document.getElementById('codePaneEl');
  const pp = document.getElementById('previewPaneEl');
  const rh = document.getElementById('resizeHandle');
  ['btnSplit', 'btnEditor', 'btnPreview'].forEach(id =>
    document.getElementById(id).classList.remove('layout-btn--active'));
  if (mode === 'split') {
    cp.style.display = 'flex'; cp.style.flex = '1';
    pp.style.display = 'flex'; pp.style.flex = '1';
    rh.style.display = 'block';
    document.getElementById('btnSplit').classList.add('layout-btn--active');
  } else if (mode === 'editor') {
    cp.style.display = 'flex'; cp.style.flex = '1';
    pp.style.display = 'none'; rh.style.display = 'none';
    document.getElementById('btnEditor').classList.add('layout-btn--active');
  } else {
    cp.style.display = 'none'; rh.style.display = 'none';
    pp.style.display = 'flex'; pp.style.flex = '1';
    document.getElementById('btnPreview').classList.add('layout-btn--active');
  }
}

function initResize() {
  const handle = document.getElementById('resizeHandle');
  const body   = document.getElementById('editorBody');
  let drag = false, startX = 0, startW = 0;
  handle.addEventListener('mousedown', e => {
    drag = true; startX = e.clientX;
    startW = document.getElementById('codePaneEl').offsetWidth;
    handle.classList.add('dragging');
    document.body.style.userSelect = 'none';
    document.body.style.cursor     = 'col-resize';
  });
  document.addEventListener('mousemove', e => {
    if (!drag) return;
    const total = body.offsetWidth;
    const newW  = Math.max(200, Math.min(total - 204, startW + (e.clientX - startX)));
    document.getElementById('codePaneEl').style.flex  = 'none';
    document.getElementById('codePaneEl').style.width = newW + 'px';
    document.getElementById('previewPaneEl').style.flex = '1';
  });
  document.addEventListener('mouseup', () => {
    if (!drag) return; drag = false;
    handle.classList.remove('dragging');
    document.body.style.userSelect = '';
    document.body.style.cursor     = '';
  });
}

function setDevice(w, btn) {
  const frame = document.getElementById('previewFrame');
  document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (w === 'full') {
    frame.style.width = '100%';
    frame.parentElement.style.overflowX = 'hidden';
  } else {
    frame.style.width = w;
    frame.parentElement.style.overflowX = 'auto';
  }
}

function toggleAuto() {
  autoRun = !autoRun;
  const btn = document.getElementById('btnAuto');
  btn.textContent       = autoRun ? 'ON' : 'OFF';
  btn.style.color       = autoRun ? 'var(--cyan)' : '';
  btn.style.borderColor = autoRun ? 'rgba(34,211,238,0.3)' : '';
  document.getElementById('sb-autorun').textContent = 'AUTO: ' + (autoRun ? 'ON' : 'OFF');
  document.getElementById('sb-autorun').style.color = autoRun ? 'var(--cyan)' : '#3d4450';
}

function resetCode() {
  if (!confirm('Réinitialiser tout le code ?')) return;
  ['html', 'css', 'js'].forEach(t => {
    document.getElementById('ed-' + t).value = DEFAULTS[t];
    updateLines(t);
  });
  saveStorage(); runCode();
  addLog('warn', '[RESET] Code réinitialisé aux valeurs par défaut.');
}

function exportCode() {
  const h = document.getElementById('ed-html').value;
  const c = document.getElementById('ed-css').value;
  const j = document.getElementById('ed-js').value;
  let out = h
    .replace('</head>', '<style>\n' + c + '\n</style>\n</head>')
    .replace('</body>', '<script>\n' + j + '\n<\/script>\n</body>');
  const a = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([out], { type: 'text/html' }));
  a.download = 'projet-helpdev.html';
  a.click();
  addLog('ok', '[EXPORT] projet-helpdev.html téléchargé.');
}

function addLog(level, msg) {
  const body = document.getElementById('consoleBody');
  const time = new Date().toLocaleTimeString('fr-FR');
  const div  = document.createElement('div');
  div.className   = 'log-' + (level === 'log' ? 'info' : level);
  div.textContent = '[' + time + '] ' + msg;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
  nLog++;
  document.getElementById('cntAll').textContent = nLog;
  if (level === 'warn') { nWarn++; const el = document.getElementById('cntWarn'); el.style.display = ''; el.textContent = nWarn + ' ⚠'; }
  if (level === 'err')  { nErr++;  const el = document.getElementById('cntErr');  el.style.display = ''; el.textContent = nErr  + ' ✕'; }
}

function clearConsole() {
  document.getElementById('consoleBody').innerHTML = '';
  nLog = nWarn = nErr = 0;
  document.getElementById('cntAll').textContent = '0';
  document.getElementById('cntWarn').style.display = 'none';
  document.getElementById('cntErr').style.display  = 'none';
}

function saveStorage() {
  try {
    ['html', 'css', 'js'].forEach(t =>
      localStorage.setItem('helpdev_ed_' + t, document.getElementById('ed-' + t).value));
  } catch(e) {}
}

function loadStorage() {
  try {
    return {
      html: localStorage.getItem('helpdev_ed_html'),
      css:  localStorage.getItem('helpdev_ed_css'),
      js:   localStorage.getItem('helpdev_ed_js'),
    };
  } catch(e) { return {}; }
}

function startClock() {
  const tick = () => {
    const n = new Date();
    document.getElementById('sb-clock').textContent =
      [n.getHours(), n.getMinutes(), n.getSeconds()]
        .map(v => String(v).padStart(2, '0')).join(':');
  };
  tick(); setInterval(tick, 1000);
}

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 's')     { e.preventDefault(); exportCode(); }
});