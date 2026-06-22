'use strict';

document.addEventListener('DOMContentLoaded', async function () {
    // ✅ Verificar autenticación
    checkAuth();

    // Cargar datos de las APIs y luego inicializar visualizaciones
    await loadDashboardData();
    await initChart();
    initMap();
});

/* ─── Tarjetas de estadísticas ─────────────────────────────────────────── */
async function loadDashboardData() {
    try {
        // Número de rutas activas
        const rutasRes = await fetch('/api/rutas');
        const rutas = await rutasRes.json();
        document.getElementById('cardRutas').textContent = rutas.length;

        // Recolecciones del día (count) y kg totales del día
        const statsRes = await fetch('/api/recolecciones/stats?period=daily');
        const stats    = await statsRes.json();
        document.getElementById('cardRecolecciones').textContent = stats.count;

        // % Reciclaje semanal + kg semanales
        const summaryRes = await fetch('/api/reportes/summary?period=weekly');
        const summary    = await summaryRes.json();
        document.getElementById('cardKg').textContent        = summary.totalKg.toLocaleString('es-ES') + ' kg';
        document.getElementById('cardReciclaje').textContent = summary.pctReciclaje + '%';
    } catch (err) {
        console.warn('Error cargando datos del dashboard:', err);
    }
}

/* ─── Gráfica (Chart.js) ────────────────────────────────────────────────── */
async function initChart() {
    const canvas = document.getElementById('grafica');
    if (!canvas || typeof Chart === 'undefined') {
        console.warn('#grafica o Chart.js no disponibles');
        return;
    }

    try {
        const res    = await fetch('/api/reportes/series?days=7');
        const series = await res.json();

        const labels = series.map(s => {
            const d = new Date(s.date + 'T12:00:00');
            return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
        });
        const data = series.map(s => s.totalKg);

        new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Residuos Recolectados (kg)',
                    data,
                    borderColor: '#2fa84f',
                    backgroundColor: 'rgba(47,168,79,0.15)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                plugins:          { legend: { display: true } },
                maintainAspectRatio: false,
                scales:           { y: { beginAtZero: true } }
            }
        });
    } catch (err) {
        console.warn('Error inicializando gráfica:', err);
        // Fallback: datos estáticos de ejemplo
        new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Residuos (kg)',
                    data: [420, 310, 530, 480, 600, 395, 490],
                    borderColor: '#2fa84f',
                    backgroundColor: 'rgba(47,168,79,0.15)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { maintainAspectRatio: false }
        });
    }
}

/* ─── Mapa (Leaflet) ────────────────────────────────────────────────────── */
async function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') {
        console.warn('#map o Leaflet no disponibles');
        return;
    }

    try {
        const map = L.map('map').setView([18.4861, -69.9312], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Dibujar rutas desde la API
        const res   = await fetch('/api/rutas');
        const rutas = await res.json();

        rutas.forEach(r => {
            if (Array.isArray(r.coords) && r.coords.length > 1) {
                L.polyline(r.coords, { color: '#2fa84f', weight: 4, smoothFactor: 1 })
                    .addTo(map)
                    .bindPopup(`<strong>${r.nombre}</strong><br>${r.dias}<br>${r.horario}`);
                // Marcador en el primer punto
                L.circleMarker(r.coords[0], { radius: 6, color: '#2fa84f', fillOpacity: 0.9 })
                    .addTo(map);
            }
        });
    } catch (err) {
        console.error('Error inicializando mapa:', err);
    }
}
