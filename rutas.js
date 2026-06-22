'use strict';

let map, markers = [];

document.addEventListener('DOMContentLoaded', async function () {
    checkAuth();
    initMap();
    await loadRutas();
});

/* ─── Inicializar mapa ───────────────────────────────────────────────────── */
function initMap() {
    map = L.map('mapRoutes').setView([18.4861, -69.9312], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

/* ─── Cargar rutas desde la API ─────────────────────────────────────────── */
async function loadRutas() {
    try {
        const res   = await fetch('/api/rutas');
        const rutas = await res.json();
        renderTable(rutas);
        renderMapMarkers(rutas);
    } catch (err) {
        console.error('Error cargando rutas:', err);
        document.querySelector('#routesTable tbody').innerHTML =
            '<tr><td colspan="5" style="text-align:center;color:#c0392b">Error al cargar rutas. Verifica el servidor.</td></tr>';
    }
}

/* ─── Renderizar tabla ───────────────────────────────────────────────────── */
function renderTable(rutas) {
    const tbody = document.querySelector('#routesTable tbody');
    tbody.innerHTML = '';
    rutas.forEach((r, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${r.nombre}</strong></td>
            <td>${r.sectores}</td>
            <td>${r.dias}</td>
            <td>${r.horario}</td>
            <td>
                <button class="btn small" onclick="zoomToRoute(${i})">
                    <i class="fas fa-map-marker-alt"></i> Ver
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* ─── Dibujar marcadores / polilíneas en el mapa ────────────────────────── */
function renderMapMarkers(rutas) {
    // Limpiar marcadores anteriores
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    rutas.forEach((r, i) => {
        if (!r.coords || r.coords.length === 0) return;

        // Punto de inicio para marcador
        const startCoord = Array.isArray(r.coords[0]) ? r.coords[0] : r.coords;

        if (Array.isArray(r.coords[0]) && r.coords.length > 1) {
            // Polilínea para rutas con varios puntos
            const poly = L.polyline(r.coords, { color: '#2fa84f', weight: 4 })
                .addTo(map)
                .bindPopup(`<strong>${r.nombre}</strong><br>${r.dias}<br>${r.horario}`);
            markers.push(poly);
        }

        // Marcador en el primer punto
        const m = L.marker(startCoord)
            .addTo(map)
            .bindPopup(`<strong>${r.nombre}</strong><br>${r.sectores}<br>${r.dias}<br>${r.horario}`);
        markers.push(m);
    });
}

/* ─── Zoom a ruta y mostrar detalle ────────────────────────────────────── */
async function zoomToRoute(index) {
    try {
        const res   = await fetch('/api/rutas');
        const rutas = await res.json();
        const r     = rutas[index];
        if (!r) return;

        // Determinar coordenadas destino
        const coord = Array.isArray(r.coords[0]) ? r.coords[0] : r.coords;
        map.setView(coord, 15, { animate: true });

        // Abrir popup del marcador correspondiente
        const markerIndex = index * (Array.isArray(r.coords[0]) ? 2 : 1);
        if (markers[markerIndex]) {
            try { markers[markerIndex].openPopup(); } catch (_) {}
        }

        // Panel de detalle
        document.getElementById('routeDetail').innerHTML = `
            <strong>${r.nombre}</strong>
            <p><strong>Sectores:</strong> ${r.sectores}</p>
            <p><strong>Días:</strong> ${r.dias}</p>
            <p><strong>Horario:</strong> ${r.horario}</p>
        `;
    } catch (err) {
        console.error('Error al hacer zoom a la ruta:', err);
    }
}
