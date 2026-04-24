// recoleccion.js

const apiReco = '/api/recolecciones';
const apiRutas = '/api/rutas';
let mapReco, markers = [], polyLines = [], chart;

// Inicializar mapa
function initMapReco() {
  mapReco = L.map('mapReco').setView([18.4861, -69.9312], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapReco);
}

// Cargar rutas para el select
async function loadRutasSelect() {
  try {
    const res = await fetch(apiRutas);
    const rutas = await res.json();
    const sel = document.getElementById('selectRuta');
    sel.innerHTML = '<option value="">-- Seleccione ruta (opcional) --</option>';
    rutas.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.nombre || r.id;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.error('Error cargando rutas', err);
  }
}

// Obtener recolecciones con filtros
async function fetchRecolecciones() {
  const tipo = document.getElementById('filterTipo').value;
  const desde = document.getElementById('desde').value;
  const hasta = document.getElementById('hasta').value;
  const q = document.getElementById('searchReco').value.trim().toLowerCase();

  const params = new URLSearchParams();
  if (tipo) params.append('tipo', tipo);
  if (desde) params.append('desde', new Date(desde).toISOString());
  if (hasta) {
    // incluir todo el día hasta 23:59
    const h = new Date(hasta);
    h.setHours(23,59,59,999);
    params.append('hasta', h.toISOString());
  }

  const url = apiReco + (params.toString() ? ('?' + params.toString()) : '');
  const res = await fetch(url);
  const list = await res.json();

  // aplicar búsqueda local por ruta/nombre
  const filtered = list.filter(r => {
    if (!q) return true;
    return (r.nombreRuta && r.nombreRuta.toLowerCase().includes(q)) ||
           (r.tipo && r.tipo.toLowerCase().includes(q));
  });

  return filtered;
}

// Render tabla
function renderTable(list) {
  const tbody = document.querySelector('#recoTable tbody');
  tbody.innerHTML = '';
  list.forEach(r => {
    const tr = document.createElement('tr');
    const date = new Date(r.fechaISO);
    tr.innerHTML = `
      <td>${date.toLocaleString()}</td>
      <td>${r.nombreRuta || '-'}</td>
      <td>${r.tipo}</td>
      <td>${Number(r.cantidadKg).toLocaleString()}</td>
      <td>
        <button class="btn small" onclick="zoomToReco(${r.id})">Ver</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Limpiar mapa
function clearMap() {
  markers.forEach(m => mapReco.removeLayer(m));
  polyLines.forEach(p => mapReco.removeLayer(p));
  markers = [];
  polyLines = [];
}

// Dibujar recolecciones en mapa (marcadores y polilíneas si coords array)
function drawOnMap(list) {
  clearMap();
  list.forEach(r => {
    if (Array.isArray(r.coords)) {
      // coords puede ser [lat,lng] o array de puntos [[lat,lng],...]
      if (Array.isArray(r.coords[0])) {
        // polilínea
        const poly = L.polyline(r.coords, { color: colorByTipo(r.tipo), weight: 5, opacity: 0.8 }).addTo(mapReco);
        polyLines.push(poly);
        // marcador en primer punto
        const m = L.marker(r.coords[0]).addTo(mapReco).bindPopup(`<strong>${r.nombreRuta}</strong><br>${r.tipo}<br>${r.cantidadKg} kg`);
        markers.push(m);
      } else {
        // solo punto
        const m = L.marker(r.coords).addTo(mapReco).bindPopup(`<strong>${r.nombreRuta}</strong><br>${r.tipo}<br>${r.cantidadKg} kg`);
        markers.push(m);
      }
    }
  });
  if (markers.length) {
    const group = L.featureGroup(markers.concat(polyLines)).addTo(mapReco);
    mapReco.fitBounds(group.getBounds().pad(0.2));
  }
}

// color por tipo
function colorByTipo(tipo) {
  if (!tipo) return '#2fa84f';
  if (tipo.toLowerCase().includes('org')) return '#2fa84f';
  if (tipo.toLowerCase().includes('plast')) return '#f0b429';
  if (tipo.toLowerCase().includes('vidrio')) return '#4c9aff';
  return '#9b59b6';
}

// Zoom a recolección por id
async function zoomToReco(id) {
  const res = await fetch(apiReco);
  const list = await res.json();
  const r = list.find(x => x.id === id);
  if (!r) return;
  if (r.coords) {
    const coords = Array.isArray(r.coords[0]) ? r.coords : [r.coords];
    mapReco.fitBounds(coords, { padding: [40,40] });
  }
  document.getElementById('recoDetail').innerHTML = `
    <strong>${r.nombreRuta || 'Sin ruta'}</strong>
    <p><strong>Tipo:</strong> ${r.tipo}</p>
    <p><strong>Cantidad:</strong> ${r.cantidadKg} kg</p>
    <p><strong>Fecha:</strong> ${new Date(r.fechaISO).toLocaleString()}</p>
  `;
}

// Actualizar tarjetas resumen (hoy)
async function updateSummary() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const res = await fetch(`${apiReco}?desde=${today.toISOString()}`);
  const list = await res.json();

  const totalKg = list.reduce((s, r) => s + Number(r.cantidadKg || 0), 0);
  const count = list.length;
  const byType = list.reduce((acc, cur) => {
    acc[cur.tipo] = (acc[cur.tipo] || 0) + Number(cur.cantidadKg || 0);
    return acc;
  }, {});

  document.getElementById('card-totalKg').querySelector('h3').textContent = `${totalKg.toLocaleString()} kg`;
  document.getElementById('card-count').querySelector('h3').textContent = `${count}`;
  document.getElementById('card-org').querySelector('h3').textContent = `${(byType['Orgánico']||0).toLocaleString()} kg`;
  document.getElementById('card-plast').querySelector('h3').textContent = `${(byType['Plástico']||0).toLocaleString()} kg`;
  document.getElementById('card-vidrio').querySelector('h3').textContent = `${(byType['Vidrio']||0).toLocaleString()} kg`;
}

// Gráfico semanal (últimos 7 días)
async function renderWeeklyChart() {
  const res = await fetch('/api/recolecciones/stats?period=weekly');
  const data = await res.json();
  const labels = data.daily.map(d => d.date);
  const totals = data.daily.map(d => d.totalKg);

  const ctx = document.getElementById('recoChart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'kg recolectados', data: totals, backgroundColor: '#2fa84f' }]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
}

// Cargar todo y renderizar
async function loadAll() {
  const list = await fetchRecolecciones();
  renderTable(list);
  drawOnMap(list);
  updateSummary();
  renderWeeklyChart();
}

// Manejo de filtros y formulario
document.addEventListener('DOMContentLoaded', async () => {
  initMapReco();
  await loadRutasSelect();
  await loadAll();

  document.getElementById('filterTipo').addEventListener('change', loadAll);
  document.getElementById('desde').addEventListener('change', loadAll);
  document.getElementById('hasta').addEventListener('change', loadAll);
  document.getElementById('searchReco').addEventListener('input', debounce(loadAll, 250));

  // Agregar recolección manual
  const form = document.getElementById('addRecoForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const rutaId = fd.get('rutaId') || null;
    const tipo = fd.get('tipo');
    const cantidadKg = Number(fd.get('cantidadKg'));
    const fechaISO = new Date(fd.get('fechaISO')).toISOString();
    const coordsRaw = fd.get('coords').trim();
    let coords = null;
    if (coordsRaw) {
      const parts = coordsRaw.split(',').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) coords = parts;
    }

    if (!tipo || !cantidadKg || !fechaISO) {
      alert('Completa tipo, cantidad y fecha');
      return;
    }

    // nombreRuta opcional: si rutaId seleccionado, buscar nombre
    let nombreRuta = '';
    if (rutaId) {
      try {
        const rres = await fetch(apiRutas);
        const rutas = await rres.json();
        const r = rutas.find(x => String(x.id) === String(rutaId));
        nombreRuta = r ? r.nombre : '';
      } catch (err) { console.warn(err); }
    }

    try {
      const res = await fetch(apiReco, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rutaId: rutaId ? Number(rutaId) : null, nombreRuta, tipo, cantidadKg, fechaISO, coords })
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Error: ' + (err.error || res.statusText));
        return;
      }
      form.reset();
      await loadAll();
      alert('Recolección agregada');
    } catch (err) {
      console.error(err);
      alert('Error de red');
    }
  });
});

// util debounce
function debounce(fn, wait) {
  let t;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}


const tbody = document.querySelector('#recoTable tbody');
const date = new Date(fechaISO);
const diaSemana = date.toLocaleDateString('es-ES', { weekday: 'long' });
const fecha = date.toLocaleDateString('es-ES');
const hora = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

const tr = document.createElement('tr');
tr.innerHTML = `
  <td>${diaSemana} ${fecha} ${hora}</td>
  <td>${nuevaReco.ruta}</td>
  <td>${nuevaReco.tipo}</td>
  <td>${nuevaReco.cantidadKg} kg</td>
  <td><button class="btn small">Ver</button></td>
`;
tbody.appendChild(tr);
