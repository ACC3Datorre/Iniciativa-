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
  nodes: [],
  recommendations: ['', '', ''],
  editingNodeId: null
};

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
  const container = document.getElementById('tree-grid-container');
  if (!container) return;

  // Construir la grilla
  let html = '<div class="tree-grid" style="grid-template-columns: 160px repeat(' + COLUMNAS.length + ', 1fr);">';

  // Header (esquina + columnas)
  html += '<div class="tree-header-row" style="grid-column: 1;"></div>';
  COLUMNAS.forEach(c => {
    html += `<div class="tree-header-row">${c.label}</div>`;
  });

  // Filas por nivel
  NIVELES.forEach(nivel => {
    html += `<div class="tree-level-label ${nivel.class}">${nivel.label}</div>`;
    COLUMNAS.forEach(col => {
      const cellNodes = state.nodes.filter(n => n.nivel === nivel.id && n.columna === col.id);
      html += `<div class="tree-cell" data-nivel="${nivel.id}" data-columna="${col.id}">`;
      cellNodes.forEach(n => {
        const conns = n.conexiones && n.conexiones.length ? `<div class="tree-node-connections">→ ${n.conexiones.length} conex.</div>` : '';
        html += `<div class="tree-node-card ${nivel.class}" onclick="openNode('${n.id}')" title="${escapeHtml(n.texto)}">
          ${escapeHtml(truncate(n.texto, 80))}
          ${conns}
        </div>`;
      });
      html += `<button class="tree-add" onclick="addNodeAt('${nivel.id}', '${col.id}')">+ nodo</button>`;
      html += '</div>';
    });
  });

  html += '</div>';
  container.innerHTML = html;

  // Actualizar status
  const totalConn = state.nodes.reduce((sum, n) => sum + (n.conexiones?.length || 0), 0);
  document.getElementById('tree-status').textContent = `${state.nodes.length} nodos · ${totalConn} conexiones`;
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

// ============ INICIALIZACIÓN ============
loadState();
