// mapas.js
let mapFull;
let layers = { contenedores: L.layerGroup(), camiones: L.layerGroup(), incidentes: L.layerGroup() };

function initMapFull() {
  mapFull = L.map('mapFull').setView([18.4861, -69.9312], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapFull);
  layers.contenedores.addTo(mapFull);
  layers.camiones.addTo(mapFull);
  layers.incidentes.addTo(mapFull);
}

// datos de ejemplo (en producción pedir a API)
const contenedores = [
  { id:'C-101', coords:[18.486, -69.931], nivel: 30, zona:'Centro' },
  { id:'C-102', coords:[18.490, -69.935], nivel: 70, zona:'Norte' },
  { id:'C-103', coords:[18.480, -69.925], nivel: 90, zona:'Este' }
];
const camiones = [
  { id:'T-01', coords:[18.488, -69.932], ruta:'R-1' },
  { id:'T-02', coords:[18.492, -69.928], ruta:'R-2' }
];
const incidentes = [
  { id:'I-1', coords:[18.485, -69.930], tipo:'Avería', zona:'Centro' }
];

function colorByLevel(n) {
  if (n < 45) return '#2fa84f';
  if (n < 65) return '#f0b429';
  return '#ff4d4d';
}

function renderAllMarkers() {
  layers.contenedores.clearLayers();
  layers.camiones.clearLayers();
  layers.incidentes.clearLayers();

  contenedores.forEach(c => {
    const el = L.circleMarker(c.coords, { radius:10, color: colorByLevel(c.nivel), fillOpacity:0.9 });
    el.bindPopup(`<strong>${c.id}</strong><br>Nivel: ${c.nivel}%<br>Zona: ${c.zona}`);
    layers.contenedores.addLayer(el);
  });

  camiones.forEach(t => {
    const icon = L.divIcon({ html: '🚛', className:'truck-icon', iconSize:[24,24] });
    const m = L.marker(t.coords, { icon }).bindPopup(`<strong>${t.id}</strong><br>Ruta: ${t.ruta}`);
    layers.camiones.addLayer(m);
  });

  incidentes.forEach(i => {
    const icon = L.divIcon({ html: '⚠️', className:'incident-icon', iconSize:[24,24] });
    const m = L.marker(i.coords, { icon }).bindPopup(`<strong>${i.id}</strong><br>${i.tipo}`);
    layers.incidentes.addLayer(m);
  });
}

// filtros
function applyMapFilters() {
  const zona = document.getElementById('filterZona').value;
  const tipo = document.getElementById('filterTipoMap').value;
  const q = document.getElementById('searchMap').value.trim().toLowerCase();

  // mostrar/ocultar capas según tipo
  if (!tipo || tipo === 'contenedor') mapFull.addLayer(layers.contenedores); else mapFull.removeLayer(layers.contenedores);
  if (!tipo || tipo === 'camion') mapFull.addLayer(layers.camiones); else mapFull.removeLayer(layers.camiones);
  if (!tipo || tipo === 'incidente') mapFull.addLayer(layers.incidentes); else mapFull.removeLayer(layers.incidentes);

  // búsqueda y zona: filtrado simple (podrías reconstruir capas filtradas)
  // Para simplicidad, re-renderizamos con visibilidad según filtros:
  layers.contenedores.clearLayers();
  contenedores.filter(c => (!zona || c.zona === zona) && (!q || c.id.toLowerCase().includes(q))).forEach(c => {
    const el = L.circleMarker(c.coords, { radius:10, color: colorByLevel(c.nivel), fillOpacity:0.9 });
    el.bindPopup(`<strong>${c.id}</strong><br>Nivel: ${c.nivel}%<br>Zona: ${c.zona}`);
    layers.contenedores.addLayer(el);
  });
  layers.camiones.clearLayers();
  camiones.filter(t => (!zona || t.zona === zona) && (!q || t.id.toLowerCase().includes(q))).forEach(t => {
    const icon = L.divIcon({ html: '🚛', className:'truck-icon', iconSize:[24,24] });
    const m = L.marker(t.coords, { icon }).bindPopup(`<strong>${t.id}</strong><br>Ruta: ${t.ruta}`);
    layers.camiones.addLayer(m);
  });
  layers.incidentes.clearLayers();
  incidentes.filter(i => (!zona || i.zona === zona) && (!q || i.id.toLowerCase().includes(q))).forEach(i => {
    const icon = L.divIcon({ html: '⚠️', className:'incident-icon', iconSize:[24,24] });
    const m = L.marker(i.coords, { icon }).bindPopup(`<strong>${i.id}</strong><br>${i.tipo}`);
    layers.incidentes.addLayer(m);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMapFull();
  renderAllMarkers();
  document.getElementById('filterZona').addEventListener('change', applyMapFilters);
  document.getElementById('filterTipoMap').addEventListener('change', applyMapFilters);
  document.getElementById('searchMap').addEventListener('input', () => setTimeout(applyMapFilters, 200));
});
