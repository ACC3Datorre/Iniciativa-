// ============ ESTADO GLOBAL ============
const STORAGE_KEY = 'novamed_experiment_v1';
const NIVELES = [
  { id: 'efecto', label: 'Efecto observado', class: 'efecto', color: 'coral' },
  { id: 'problema', label: 'Problema central', class: 'problema', color: 'purple' },
  { id: 'causa1', label: 'Causa raíz', class: 'causa1', color: 'amber' },
  { id: 'causa2', label: 'Causa subyacente', class: 'causa2', color: 'teal' }
];
const COLUMNAS = [
  { id: 'proceso', label: 'Proceso' },
  { id: 'personas', label: 'Personas' },
  { id: 'tecnologia', label: 'Tecnología' },
  { id: 'gobernanza', label: 'Gobernanza' }
];

let state = {
  brazo: 'none',
  equipo: null,
  modo: 'participante',
  nodes: [],
  recommendations: ['', '', ''],
  editingNodeId: null
};



// ============ ASIGNACIÓN AUTOMÁTICA DE EQUIPO ============
function asignarEquipo() {
  // Si ya tiene equipo asignado, no hacer nada
  if (state.equipo === 1 || state.equipo === 2) {
    return;
  }

  // Por URL param: ?equipo=1 o ?equipo=2 (preasignación del facilitador)
  const params = new URLSearchParams(window.location.search);
  const equipoUrl = params.get('equipo');
  if (equipoUrl === '1' || equipoUrl === '2') {
    state.equipo = parseInt(equipoUrl, 10);
    saveState();
    renderTeamBanner();
    return;
  }

  // Asignación automática alternando: usar un counter global en localStorage
  // (esto distribuye 50/50 entre navegadores que usen el mismo localStorage,
  // pero entre navegadores distintos es efectivamente aleatorio)
  let counter = parseInt(localStorage.getItem('novamed_team_counter') || '0', 10);
  const team = (counter % 2) + 1; // 1 o 2 alternando
  state.equipo = team;
  localStorage.setItem('novamed_team_counter', String(counter + 1));
  saveState();
  renderTeamBanner();
}

function renderTeamBanner() {
  const placeholder = document.getElementById('team-banner-placeholder');
  if (!placeholder) return;
  if (state.equipo === 1 || state.equipo === 2) {
    placeholder.innerHTML = `<div class="team-banner">
      <span class="team-badge">Equipo ${state.equipo}</span>
      <span class="team-text">Tu identificación de equipo. Sirve para que el facilitador identifique sus entregables.</span>
    </div>`;
  } else {
    placeholder.innerHTML = '';
  }
}

// ============ MODO PARTICIPANTE vs FACILITADOR ============
function detectarModo() {
  // Por URL param: ?modo=facilitador
  const params = new URLSearchParams(window.location.search);
  const modoUrl = params.get('modo');
  if (modoUrl === 'facilitador') {
    document.body.dataset.modo = 'facilitador';
    state.modo = 'facilitador';
    saveState();
    return;
  }
  // Por localStorage (guardado de sesión anterior)
  if (state.modo === 'facilitador') {
    document.body.dataset.modo = 'facilitador';
    return;
  }
  // Default: participante
  document.body.dataset.modo = 'participante';
  state.modo = 'participante';

  // Si está en modo participante, mostrar "caso" en vez de "diseno" al inicio
  const activa = document.querySelector('section.active');
  if (activa && ['diseno','asignacion','evaluacion'].includes(activa.id)) {
    setTimeout(() => showSection('caso'), 0);
  }
}

function toggleModoFacilitador() {
  if (state.modo === 'facilitador') {
    state.modo = 'participante';
  } else {
    state.modo = 'facilitador';
  }
  document.body.dataset.modo = state.modo;
  saveState();
  // Si pasa a participante y está en una sección oculta, redirigir
  if (state.modo === 'participante') {
    const activa = document.querySelector('section.active');
    if (activa && ['diseno','asignacion','evaluacion'].includes(activa.id)) {
      showSection('caso');
    }
  }
}

// ============ PERSISTENCIA ============
function saveState() {
  // Capturar recommendations actualizadas del DOM
  state.recommendations = [
    document.getElementById('rec-1')?.value || '',
    document.getElementById('rec-2')?.value || '',
    document.getElementById('rec-3')?.value || ''
  ];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch(e) {
    console.warn('No se pudo guardar en localStorage:', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...state, ...parsed, editingNodeId: null };
    }
  } catch(e) {
    console.warn('No se pudo cargar localStorage:', e);
  }
  applyBrazo();
  renderTree();
  if (state.recommendations) {
    const r1 = document.getElementById('rec-1');
    const r2 = document.getElementById('rec-2');
    const r3 = document.getElementById('rec-3');
    if (r1) r1.value = state.recommendations[0] || '';
    if (r2) r2.value = state.recommendations[1] || '';
    if (r3) r3.value = state.recommendations[2] || '';
  }
}

// ============ NAVEGACIÓN ============
function showSection(id) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const sec = document.getElementById(id);
  if (sec) sec.classList.add('active');
  const tab = document.getElementById('tab-' + id);
  if (tab) tab.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Mostrar banner si entra a sobres sin brazo
  const noBrazoBanner = document.getElementById('no-brazo-banner');
  if (noBrazoBanner && id === 'sobres') {
    noBrazoBanner.style.display = (state.brazo === 'none') ? 'flex' : 'none';
  }
}

// ============ ASIGNACIÓN DE BRAZO ============
function randomAssign() {
  const brazo = Math.random() < 0.5 ? 'A' : 'B';
  setBrazo(brazo);
}

function setBrazo(brazo) {
  state.brazo = brazo;
  saveState();
  applyBrazo();
}

function resetBrazo() {
  state.brazo = 'none';
  saveState();
  applyBrazo();
}

function applyBrazo() {
  document.body.dataset.brazo = state.brazo;
  const badge = document.getElementById('brazo-badge');
  const display = document.getElementById('assign-display');
  const detail = document.getElementById('assign-detail');

  if (badge) {
    badge.className = 'brazo-badge ' + (state.brazo === 'none' ? 'none' : state.brazo);
    if (state.brazo === 'A') badge.textContent = 'BRAZO A · CUANTI';
    else if (state.brazo === 'B') badge.textContent = 'BRAZO B · CUALI';
    else if (state.brazo === 'facilitador') badge.textContent = 'FACILITADOR';
    else badge.textContent = 'SIN ASIGNAR';
  }
  if (display) {
    display.className = 'assignment-result ' + (state.brazo === 'A' || state.brazo === 'B' ? state.brazo : '');
    if (state.brazo === 'A') display.innerHTML = 'Brazo A · <em>Cuantitativo</em>';
    else if (state.brazo === 'B') display.innerHTML = 'Brazo B · <em>Cualitativo</em>';
    else if (state.brazo === 'facilitador') display.innerHTML = '<em>Facilitador</em> (ve todo)';
    else display.innerHTML = '—';
  }
  if (detail) {
    if (state.brazo === 'A') detail.textContent = 'Tu equipo va a recibir evidencia numérica: tablas, ratios, métricas. Avanzá a la sección Sobres para ver tu material.';
    else if (state.brazo === 'B') detail.textContent = 'Tu equipo va a recibir evidencia narrativa: citas, entrevistas, observaciones. Avanzá a la sección Sobres para ver tu material.';
    else if (state.brazo === 'facilitador') detail.textContent = 'Como facilitador podés ver los sobres de ambos brazos para preparar la sesión y la retro.';
    else detail.textContent = 'Hacé click en el botón para que el sistema te asigne aleatoriamente al brazo cuantitativo (A) o cualitativo (B). La asignación se guarda en tu navegador.';
  }
}

// ============ ÁRBOL ============
function newNodeId() {
  return 'n_' + Math.random().toString(36).substr(2, 9);
}

function renderTree() {
  const area = document.getElementById('tree-content-area');
  if (!area) return;

  // Layout parámetros
  const NODE_WIDTH = 180;
  const NODE_HEIGHT = 88;
  const NODE_GAP_X = 24;
  const ROW_HEIGHT = 110;
  const ROW_PADDING_TOP = 20;

  // Agrupar nodos por nivel manteniendo orden
  const byLevel = {};
  NIVELES.forEach(n => { byLevel[n.id] = []; });
  state.nodes.forEach(n => {
    if (byLevel[n.nivel]) byLevel[n.nivel].push(n);
  });

  // Calcular ancho total necesario (basado en el nivel con más nodos)
  let maxNodesInRow = 1;
  NIVELES.forEach(nivel => {
    const count = byLevel[nivel.id].length;
    if (count > maxNodesInRow) maxNodesInRow = count;
  });
  const totalWidth = Math.max(720, maxNodesInRow * (NODE_WIDTH + NODE_GAP_X) + NODE_GAP_X);
  const totalHeight = NIVELES.length * ROW_HEIGHT + ROW_PADDING_TOP + 20;

  // Posicionar cada nodo: centrado horizontalmente en su fila
  const positions = {}; // id -> {x, y}
  NIVELES.forEach((nivel, rowIdx) => {
    const nodos = byLevel[nivel.id];
    const count = nodos.length;
    if (count === 0) return;
    const totalRowWidth = count * NODE_WIDTH + (count - 1) * NODE_GAP_X;
    const startX = (totalWidth - totalRowWidth) / 2;
    nodos.forEach((n, i) => {
      positions[n.id] = {
        x: startX + i * (NODE_WIDTH + NODE_GAP_X),
        y: ROW_PADDING_TOP + rowIdx * ROW_HEIGHT
      };
    });
  });

  // Construir SVG con las líneas de conexión
  let svgPaths = '';
  state.nodes.forEach(node => {
    const conns = node.conexiones || [];
    const fromPos = positions[node.id];
    if (!fromPos) return;
    conns.forEach(targetId => {
      const toPos = positions[targetId];
      if (!toPos) return;
      // Línea: desde el centro inferior del nodo origen al centro superior del nodo destino
      const x1 = fromPos.x + NODE_WIDTH / 2;
      const y1 = fromPos.y + NODE_HEIGHT;
      const x2 = toPos.x + NODE_WIDTH / 2;
      const y2 = toPos.y;
      // Curva bezier suave
      const midY = (y1 + y2) / 2;
      svgPaths += `<path d="M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}" />`;
    });
  });

  // Construir nodos HTML
  let nodesHtml = '';
  state.nodes.forEach(n => {
    const pos = positions[n.id];
    if (!pos) return;
    const colLabel = COLUMNAS.find(c => c.id === n.columna)?.label || n.columna;
    const levelLabel = NIVELES.find(l => l.id === n.nivel)?.label || n.nivel;
    nodesHtml += `<div class="tree-node-visual ${n.nivel}"
      style="left:${pos.x}px; top:${pos.y}px; width:${NODE_WIDTH}px; min-height:${NODE_HEIGHT}px;"
      onclick="openNode('${n.id}')"
      title="${escapeHtml(n.texto)}">
      <div class="tn-label">${levelLabel}</div>
      <div class="tn-text">${escapeHtml(n.texto)}</div>
      <div class="tn-column-tag">· ${escapeHtml(colLabel.toLowerCase())}</div>
    </div>`;
  });

  // Empty state
  let emptyHtml = '';
  if (state.nodes.length === 0) {
    emptyHtml = `<div class="tree-empty">
      <p>El árbol está vacío.</p>
      <p style="font-size:13px;">Empezá agregando un <em>Efecto observado</em> con el botón de arriba.</p>
    </div>`;
  }

  // Inyectar todo
  area.style.minHeight = totalHeight + 'px';
  area.innerHTML = `
    <svg class="tree-svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}" preserveAspectRatio="xMidYMin meet">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" fill="var(--border-strong)" />
        </marker>
      </defs>
      ${svgPaths}
    </svg>
    ${nodesHtml}
    ${emptyHtml}
  `;
  // Ajustar el ancho del inner para que respete el ancho del árbol
  const inner = document.getElementById('tree-canvas-inner');
  if (inner) inner.style.minWidth = (totalWidth + 130) + 'px';

  // Actualizar status
  const totalConn = state.nodes.reduce((sum, n) => sum + (n.conexiones?.length || 0), 0);
  const statusEl = document.getElementById('tree-status');
  if (statusEl) statusEl.textContent = `${state.nodes.length} nodos · ${totalConn} conexiones`;
}

function truncate(s, n) {
  if (!s) return '';
  if (s.length <= n) return s;
  return s.substr(0, n - 1) + '…';
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============ MODAL DE NODO ============
function openNode(id) {
  const node = state.nodes.find(n => n.id === id);
  if (!node) return;
  state.editingNodeId = id;
  document.getElementById('modal-title').textContent = 'Editar nodo';
  document.getElementById('modal-nivel').value = node.nivel;
  document.getElementById('modal-columna').value = node.columna;
  document.getElementById('modal-texto').value = node.texto || '';
  document.getElementById('modal-delete').style.display = 'inline-block';
  renderConnectionsUI(node);
  document.getElementById('modal').classList.add('show');
}

function addNodeAt(nivel, columna) {
  state.editingNodeId = null;
  document.getElementById('modal-title').textContent = 'Nuevo nodo';
  document.getElementById('modal-nivel').value = nivel;
  document.getElementById('modal-columna').value = columna;
  document.getElementById('modal-texto').value = '';
  document.getElementById('modal-delete').style.display = 'none';
  renderConnectionsUI({ nivel, conexiones: [] });
  document.getElementById('modal').classList.add('show');
  setTimeout(() => document.getElementById('modal-texto').focus(), 50);
}

function addQuickNode(nivel) {
  // toma la primera columna disponible o "proceso"
  addNodeAt(nivel, 'proceso');
}

function renderConnectionsUI(node) {
  const container = document.getElementById('modal-connections');
  const nivel = node.nivel || document.getElementById('modal-nivel').value;
  const idxActual = NIVELES.findIndex(n => n.id === nivel);

  // Las conexiones van hacia ABAJO (causas que explican este nodo): nodos del nivel inferior
  if (idxActual >= NIVELES.length - 1) {
    container.innerHTML = '<div style="font-size:11px;color:var(--muted);font-style:italic;">El nivel más bajo no tiene causas que lo expliquen.</div>';
    return;
  }
  const nivelInferior = NIVELES[idxActual + 1];
  const candidatos = state.nodes.filter(n => n.nivel === nivelInferior.id && n.id !== node.id);

  if (candidatos.length === 0) {
    container.innerHTML = `<div style="font-size:11px;color:var(--muted);font-style:italic;">Sin nodos en "${nivelInferior.label}" para conectar todavía.</div>`;
    return;
  }

  const conns = node.conexiones || [];
  container.innerHTML = candidatos.map(c => {
    const checked = conns.includes(c.id) ? 'checked' : '';
    return `<label style="display:flex;align-items:flex-start;gap:8px;padding:6px 8px;border:1px solid var(--border);border-radius:6px;cursor:pointer;font-size:12px;color:var(--text);">
      <input type="checkbox" data-conn="${c.id}" ${checked} style="margin-top:2px;flex-shrink:0;">
      <span>${escapeHtml(truncate(c.texto, 80))}</span>
    </label>`;
  }).join('');
}

// Re-renderizar conexiones cuando cambia el nivel
document.addEventListener('change', function(e) {
  if (e.target.id === 'modal-nivel') {
    const node = state.editingNodeId
      ? state.nodes.find(n => n.id === state.editingNodeId)
      : { nivel: e.target.value, conexiones: [] };
    if (node) {
      node.nivel = e.target.value;
      renderConnectionsUI(node);
    }
  }
});

function saveNode() {
  const nivel = document.getElementById('modal-nivel').value;
  const columna = document.getElementById('modal-columna').value;
  const texto = document.getElementById('modal-texto').value.trim();
  if (!texto) {
    alert('Escribí el texto del nodo antes de guardar.');
    return;
  }
  const conexiones = Array.from(document.querySelectorAll('#modal-connections input[type="checkbox"]:checked'))
    .map(cb => cb.dataset.conn);

  if (state.editingNodeId) {
    const node = state.nodes.find(n => n.id === state.editingNodeId);
    if (node) {
      node.nivel = nivel;
      node.columna = columna;
      node.texto = texto;
      node.conexiones = conexiones;
    }
  } else {
    state.nodes.push({
      id: newNodeId(),
      nivel, columna, texto, conexiones
    });
  }
  saveState();
  renderTree();
  closeModal();
}

function deleteNode() {
  if (!state.editingNodeId) return;
  if (!confirm('¿Eliminar este nodo? Se eliminarán también sus conexiones desde otros nodos.')) return;
  state.nodes = state.nodes.filter(n => n.id !== state.editingNodeId);
  // Limpiar conexiones huérfanas
  state.nodes.forEach(n => {
    if (n.conexiones) n.conexiones = n.conexiones.filter(c => c !== state.editingNodeId);
  });
  saveState();
  renderTree();
  closeModal();
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
  state.editingNodeId = null;
}

// ============ EXPORT / IMPORT ============
function exportTree() {
  // Estructura inspirada en el formato del usuario: columnas + nodos con conexiones
  const data = {
    meta: {
      experimento: 'NovaMed v1',
      brazo: state.brazo,
      timestamp: new Date().toISOString(),
      n_nodos: state.nodes.length,
      n_conexiones: state.nodes.reduce((s, n) => s + (n.conexiones?.length || 0), 0)
    },
    columnas: COLUMNAS.map(c => c.label),
    niveles: NIVELES.map(n => n.label),
    nodos: state.nodes.map(n => ({
      id: n.id,
      texto: n.texto,
      nivel: n.nivel,
      columna: n.columna,
      explicado_por: n.conexiones || []
    })),
    recomendaciones: [
      { plazo: 'inmediato (esta semana)', texto: state.recommendations[0] || '' },
      { plazo: 'corto (2 semanas)', texto: state.recommendations[1] || '' },
      { plazo: 'estructural', texto: state.recommendations[2] || '' }
    ]
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fname = `arbol_novamed_${state.brazo}_${new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')}.json`;
  a.href = url;
  a.download = fname;
  a.click();
  URL.revokeObjectURL(url);
}

function importTreeDialog() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.nodos || !Array.isArray(data.nodos)) throw new Error('Estructura inválida');
        if (!confirm(`Importar ${data.nodos.length} nodos? Se reemplaza el árbol actual.`)) return;
        state.nodes = data.nodos.map(n => ({
          id: n.id || newNodeId(),
          texto: n.texto || '',
          nivel: n.nivel || 'causa1',
          columna: n.columna || 'proceso',
          conexiones: n.explicado_por || n.conexiones || []
        }));
        if (data.recomendaciones && Array.isArray(data.recomendaciones)) {
          state.recommendations = data.recomendaciones.map(r => r.texto || r);
        }
        saveState();
        loadState();
      } catch(err) {
        alert('Error al importar: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function clearTree() {
  if (!confirm('¿Limpiar todo el árbol y las recomendaciones?')) return;
  state.nodes = [];
  state.recommendations = ['', '', ''];
  saveState();
  loadState();
}



// ============ CRONÓMETRO ============
const TIMER_TOTAL_SECONDS = 45 * 60; // 45 minutos
const TIMER_KEY = 'novamed_timer_v1';
let timerInterval = null;

function loadTimer() {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (raw) {
      const t = JSON.parse(raw);
      // Reconstruir estado
      if (t.startedAt) {
        const now = Date.now();
        const elapsed = Math.floor((now - t.startedAt) / 1000);
        const remaining = TIMER_TOTAL_SECONDS - elapsed - (t.penaltySeconds || 0);
        return { ...t, remaining: Math.max(0, remaining) };
      }
      return t;
    }
  } catch(e) {}
  return { startedAt: null, penaltySeconds: 0, remaining: TIMER_TOTAL_SECONDS };
}

function saveTimer(t) {
  try {
    localStorage.setItem(TIMER_KEY, JSON.stringify(t));
  } catch(e) {}
}

function formatTime(seconds) {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return {
    min: String(m).padStart(2, '0'),
    sec: String(s).padStart(2, '0')
  };
}

function updateTimerDisplay() {
  const t = loadTimer();
  const remaining = t.remaining !== undefined ? t.remaining : TIMER_TOTAL_SECONDS;
  const f = formatTime(remaining);
  const minEl = document.getElementById('timer-min');
  const secEl = document.getElementById('timer-sec');
  if (minEl) minEl.textContent = f.min;
  if (secEl) secEl.textContent = f.sec;

  const bar = document.getElementById('timer-bar');
  if (bar) {
    bar.classList.toggle('urgent', remaining > 0 && remaining <= 300);
    bar.classList.toggle('expired', remaining <= 0);
  }
  document.body.classList.toggle('time-expired', remaining <= 0 && t.startedAt !== null);

  // Ocultar botón iniciar si ya arrancó
  const startBtn = document.getElementById('timer-start-btn');
  if (startBtn) {
    startBtn.style.display = t.startedAt ? 'none' : '';
  }
}

function startTimer() {
  const t = loadTimer();
  if (t.startedAt) return; // ya iniciado
  const newState = {
    startedAt: Date.now(),
    penaltySeconds: 0,
    remaining: TIMER_TOTAL_SECONDS
  };
  saveTimer(newState);
  // Iniciar interval
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimerDisplay, 1000);
  updateTimerDisplay();
}

function resetTimer() {
  if (!confirm('¿Reiniciar el cronómetro y los sobres? (solo facilitador)')) return;
  if (timerInterval) clearInterval(timerInterval);
  localStorage.removeItem(TIMER_KEY);
  localStorage.removeItem('novamed_sobre_log');
  // Cerrar todos los sobres también
  document.querySelectorAll('.sobre').forEach(s => s.classList.add('closed'));
  document.body.classList.remove('time-expired');
  updateTimerDisplay();
}

function addMinutes(min) {
  const t = loadTimer();
  if (!t.startedAt) return;
  // "Agregar" minutos = restar segundos a penaltySeconds
  t.penaltySeconds = Math.max(0, (t.penaltySeconds || 0) - (min * 60));
  saveTimer(t);
  updateTimerDisplay();
}

function applyPenalty(seconds, label) {
  const t = loadTimer();
  if (!t.startedAt) return;
  t.penaltySeconds = (t.penaltySeconds || 0) + seconds;
  saveTimer(t);
  // Flash visual
  showPenaltyFlash(`−${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')} · ${label}`);
  updateTimerDisplay();
}

function showPenaltyFlash(text) {
  // Remover anterior si existe
  const existing = document.querySelector('.timer-penalty-flash');
  if (existing) existing.remove();
  const flash = document.createElement('div');
  flash.className = 'timer-penalty-flash';
  flash.textContent = text;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1900);
}

// Iniciar el interval si el timer ya estaba corriendo
function resumeTimerIfRunning() {
  const t = loadTimer();
  if (t.startedAt && t.remaining > 0) {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimerDisplay, 1000);
  }
  updateTimerDisplay();
}

// ============ SOBRES (cerrar/abrir) ============
function toggleSobre(elem, event) {
  // Verificar que el tiempo no se haya agotado
  if (document.body.classList.contains('time-expired')) {
    return;
  }

  if (elem.classList.contains('closed')) {
    // Verificar que el cronómetro esté corriendo (excepto para el primer sobre que es gratis y arranca el timer)
    const cost = parseInt(elem.dataset.cost || '0', 10);
    const timer = loadTimer();

    // Si el cronómetro no arrancó todavía y este es el primer sobre (gratis), arrancarlo
    if (!timer.startedAt && cost === 0) {
      startTimer();
    } else if (!timer.startedAt && cost > 0) {
      // El equipo intenta abrir un sobre pago sin haber iniciado el cronómetro
      if (!confirm('El cronómetro todavía no arrancó. Si abrís este sobre, se va a iniciar el cronómetro y descontar ' + Math.floor(cost/60) + ':' + String(cost%60).padStart(2,'0') + ' del tiempo. ¿Continuar?')) {
        return;
      }
      startTimer();
    }

    // Aplicar penalización si corresponde
    if (cost > 0) {
      const label = elem.querySelector('.sobre-label')?.textContent?.split('·')[1]?.trim() || 'Sobre';
      applyPenalty(cost, label);
    }

    elem.classList.remove('closed');

    // Registrar evento
    const sobreId = elem.id || 'unknown';
    const ts = new Date().toISOString();
    try {
      const log = JSON.parse(localStorage.getItem('novamed_sobre_log') || '[]');
      log.push({
        sobre: sobreId,
        abierto_en: ts,
        equipo: state.equipo,
        costo_segundos: cost
      });
      localStorage.setItem('novamed_sobre_log', JSON.stringify(log));
    } catch(e) {}
  }
}

function closeSobre(event, btn) {
  event.stopPropagation();
  const sobre = btn.closest('.sobre');
  if (sobre) sobre.classList.add('closed');
}

// ============ COPIAR PROMPT AL PORTAPAPELES ============
function copyPrompt(btn) {
  const card = btn.closest('.prompt-card');
  const text = card.querySelector('.prompt-text').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.textContent;
    btn.textContent = '✓ copiado';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 1500);
  }).catch(err => {
    alert('No se pudo copiar. Seleccioná el texto manualmente.');
  });
}

// ============ INICIALIZACIÓN ============
loadState();
detectarModo();
asignarEquipo();
applyBrazo();
renderTree();
resumeTimerIfRunning();

// Listener para tecla F para alternar modo facilitador (oculto, solo facilitadores saben)
document.addEventListener('keydown', function(e) {
  if (e.key === 'F' && e.shiftKey && e.ctrlKey) {
    toggleModoFacilitador();
    alert('Modo: ' + state.modo);
  }
});
