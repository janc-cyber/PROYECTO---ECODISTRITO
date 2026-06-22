'use strict';

// ✅ Inicializar layers DENTRO de DOMContentLoaded, no a nivel de módulo
// para evitar errores si Leaflet no está listo
let mapFull;
let layers;

/* ─── Datos de ejemplo ──────────────────────────────────────────────────── */
const contenedores = [
    { id: 'C-101', coords: [18.486, -69.931], nivel: 30, zona: 'Centro' },
    { id: 'C-102', coords: [18.490, -69.935], nivel: 70, zona: 'Norte'  },
    { id: 'C-103', coords: [18.480, -69.925], nivel: 90, zona: 'Este'   },
    { id: 'C-104', coords: [18.494, -69.928], nivel: 50, zona: 'Norte'  },
    { id: 'C-105', coords: [18.483, -69.938], nivel: 20, zona: 'Centro' }
];

// ✅ CORREGIDO: camiones ahora incluyen propiedad "zona" para que el filtro funcione
const camiones = [
    { id: 'T-01', coords: [18.488, -69.932], ruta: 'R-1 Botánico',              zona: 'Centro' },
    { id: 'T-02', coords: [18.492, -69.928], ruta: 'R-2 Los Próceres',          zona: 'Norte'  },
    { id: 'T-03', coords: [18.477, -69.934], ruta: 'R-4 Los Ríos/Villa Marina', zona: 'Este'   }
];

const incidentes = [
    { id: 'I-1', coords: [18.485, -69.930], tipo: 'Camión averiado', zona: 'Centro' },
    { id: 'I-2', coords: [18.496, -69.921], tipo: 'Contenedor lleno', zona: 'Norte' }
];

/* ─── Colores según nivel de llenado ───────────────────────────────────── */
function colorByLevel(n) {
    if (n < 45) return '#2fa84f';
    if (n < 75) return '#f0b429';
    return '#ff4d4d';
}

/* ─── Inicializar mapa ───────────────────────────────────────────────────── */
function initMapFull() {
    mapFull = L.map('mapFull').setView([18.4861, -69.9312], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapFull);

    // Crear grupos de capas
    layers = {
        contenedores: L.layerGroup(),
        camiones:     L.layerGroup(),
        incidentes:   L.layerGroup()
    };

    layers.contenedores.addTo(mapFull);
    layers.camiones.addTo(mapFull);
    layers.incidentes.addTo(mapFull);
}

/* ─── Renderizar todos los marcadores ───────────────────────────────────── */
function renderAllMarkers() {
    layers.contenedores.clearLayers();
    layers.camiones.clearLayers();
    layers.incidentes.clearLayers();

    contenedores.forEach(c => {
        const el = L.circleMarker(c.coords, { radius: 10, color: colorByLevel(c.nivel), fillColor: colorByLevel(c.nivel), fillOpacity: 0.85 });
        el.bindPopup(`<strong>${c.id}</strong><br>Nivel: ${c.nivel}%<br>Zona: ${c.zona}`);
        layers.contenedores.addLayer(el);
    });

    camiones.forEach(t => {
        const icon = L.divIcon({ html: '🚛', className: 'truck-icon', iconSize: [24, 24] });
        const m = L.marker(t.coords, { icon }).bindPopup(`<strong>${t.id}</strong><br>Ruta: ${t.ruta}<br>Zona: ${t.zona}`);
        layers.camiones.addLayer(m);
    });

    incidentes.forEach(i => {
        const icon = L.divIcon({ html: '⚠️', className: 'incident-icon', iconSize: [24, 24] });
        const m = L.marker(i.coords, { icon }).bindPopup(`<strong>${i.id}</strong><br>${i.tipo}<br>Zona: ${i.zona}`);
        layers.incidentes.addLayer(m);
    });
}

/* ─── Aplicar filtros ───────────────────────────────────────────────────── */
function applyMapFilters() {
    const zona = document.getElementById('filterZona').value;
    const tipo = document.getElementById('filterTipoMap').value;
    const q    = document.getElementById('searchMap').value.trim().toLowerCase();

    layers.contenedores.clearLayers();
    layers.camiones.clearLayers();
    layers.incidentes.clearLayers();

    // Mostrar/ocultar capas según tipo
    if (!tipo || tipo === 'contenedor') mapFull.addLayer(layers.contenedores);
    else mapFull.removeLayer(layers.contenedores);

    if (!tipo || tipo === 'camion') mapFull.addLayer(layers.camiones);
    else mapFull.removeLayer(layers.camiones);

    if (!tipo || tipo === 'incidente') mapFull.addLayer(layers.incidentes);
    else mapFull.removeLayer(layers.incidentes);

    // Filtrar contenedores
    contenedores
        .filter(c => (!zona || c.zona === zona) && (!q || c.id.toLowerCase().includes(q)))
        .forEach(c => {
            const el = L.circleMarker(c.coords, { radius: 10, color: colorByLevel(c.nivel), fillColor: colorByLevel(c.nivel), fillOpacity: 0.85 });
            el.bindPopup(`<strong>${c.id}</strong><br>Nivel: ${c.nivel}%<br>Zona: ${c.zona}`);
            layers.contenedores.addLayer(el);
        });

    // ✅ CORREGIDO: camiones ahora tienen .zona por lo que este filtro funciona
    camiones
        .filter(t => (!zona || t.zona === zona) && (!q || t.id.toLowerCase().includes(q)))
        .forEach(t => {
            const icon = L.divIcon({ html: '🚛', className: 'truck-icon', iconSize: [24, 24] });
            const m = L.marker(t.coords, { icon }).bindPopup(`<strong>${t.id}</strong><br>Ruta: ${t.ruta}<br>Zona: ${t.zona}`);
            layers.camiones.addLayer(m);
        });

    // Filtrar incidentes
    incidentes
        .filter(i => (!zona || i.zona === zona) && (!q || i.id.toLowerCase().includes(q) || i.tipo.toLowerCase().includes(q)))
        .forEach(i => {
            const icon = L.divIcon({ html: '⚠️', className: 'incident-icon', iconSize: [24, 24] });
            const m = L.marker(i.coords, { icon }).bindPopup(`<strong>${i.id}</strong><br>${i.tipo}<br>Zona: ${i.zona}`);
            layers.incidentes.addLayer(m);
        });
}

/* ─── Inicialización ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initMapFull();
    renderAllMarkers();

    document.getElementById('filterZona').addEventListener('change', applyMapFilters);
    document.getElementById('filterTipoMap').addEventListener('change', applyMapFilters);
    document.getElementById('searchMap').addEventListener('input', () => setTimeout(applyMapFilters, 200));
});
