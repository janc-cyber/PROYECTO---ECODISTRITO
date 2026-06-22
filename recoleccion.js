'use strict';

const apiReco  = '/api/recolecciones';
const apiRutas = '/api/rutas';
let mapReco, markers = [], polyLines = [], chart;

/* ─── Inicializar mapa ───────────────────────────────────────────────────── */
function initMapReco() {
    mapReco = L.map('mapReco').setView([18.4861, -69.9312], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapReco);
}

/* ─── Poblar select de rutas ─────────────────────────────────────────────── */
async function loadRutasSelect() {
    try {
        const res   = await fetch(apiRutas);
        const rutas = await res.json();
        const sel   = document.getElementById('selectRuta');
        sel.innerHTML = '<option value="">-- Seleccione ruta (opcional) --</option>';
        rutas.forEach(r => {
            const opt = document.createElement('option');
            opt.value       = r.id;
            opt.textContent = r.nombre || r.id;
            sel.appendChild(opt);
        });
    } catch (err) {
        console.error('Error cargando rutas para select:', err);
    }
}

/* ─── Obtener recolecciones con filtros ──────────────────────────────────── */
async function fetchRecolecciones() {
    const tipo  = document.getElementById('filterTipo').value;
    const desde = document.getElementById('desde').value;
    const hasta = document.getElementById('hasta').value;
    const q     = document.getElementById('searchReco').value.trim().toLowerCase();

    const params = new URLSearchParams();
    if (tipo)  params.append('tipo',  tipo);
    if (desde) params.append('desde', new Date(desde).toISOString());
    if (hasta) {
        const h = new Date(hasta);
        h.setHours(23, 59, 59, 999);
        params.append('hasta', h.toISOString());
    }

    const url  = apiReco + (params.toString() ? '?' + params.toString() : '');
    const res  = await fetch(url);
    const list = await res.json();

    return list.filter(r => {
        if (!q) return true;
        return (r.nombreRuta && r.nombreRuta.toLowerCase().includes(q)) ||
               (r.tipo        && r.tipo.toLowerCase().includes(q));
    });
}

/* ─── Renderizar tabla ───────────────────────────────────────────────────── */
function renderTable(list) {
    const tbody = document.querySelector('#recoTable tbody');
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;opacity:0.6">Sin resultados</td></tr>';
        return;
    }

    list.forEach(r => {
        const tr   = document.createElement('tr');
        const date = new Date(r.fechaISO);
        tr.innerHTML = `
            <td>${date.toLocaleString('es-ES')}</td>
            <td>${r.nombreRuta || '-'}</td>
            <td>${r.tipo}</td>
            <td>${Number(r.cantidadKg).toLocaleString('es-ES')} kg</td>
            <td>
                <button class="btn small" onclick="zoomToReco(${r.id})">
                    <i class="fas fa-map-marker-alt"></i> Ver
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* ─── Mapa: limpiar y dibujar ────────────────────────────────────────────── */
function clearMap() {
    markers.forEach(m => { try { mapReco.removeLayer(m); } catch (_) {} });
    polyLines.forEach(p => { try { mapReco.removeLayer(p); } catch (_) {} });
    markers   = [];
    polyLines = [];
}

function drawOnMap(list) {
    clearMap();
    list.forEach(r => {
        if (!r.coords) return;
        if (Array.isArray(r.coords[0])) {
            const poly = L.polyline(r.coords, { color: colorByTipo(r.tipo), weight: 5, opacity: 0.8 }).addTo(mapReco);
            polyLines.push(poly);
            const m = L.marker(r.coords[0]).addTo(mapReco)
                .bindPopup(`<strong>${r.nombreRuta}</strong><br>${r.tipo}<br>${r.cantidadKg} kg`);
            markers.push(m);
        } else {
            const m = L.marker(r.coords).addTo(mapReco)
                .bindPopup(`<strong>${r.nombreRuta}</strong><br>${r.tipo}<br>${r.cantidadKg} kg`);
            markers.push(m);
        }
    });

    if (markers.length) {
        try {
            const group = L.featureGroup([...markers, ...polyLines]);
            mapReco.fitBounds(group.getBounds().pad(0.2));
        } catch (_) {}
    }
}

function colorByTipo(tipo) {
    if (!tipo) return '#2fa84f';
    const t = tipo.toLowerCase();
    if (t.includes('org'))    return '#2fa84f';
    if (t.includes('plast'))  return '#f0b429';
    if (t.includes('vidrio')) return '#4c9aff';
    return '#9b59b6';
}

/* ─── Zoom a recolección específica ─────────────────────────────────────── */
async function zoomToReco(id) {
    try {
        const res  = await fetch(apiReco);
        const list = await res.json();
        const r    = list.find(x => x.id === id);
        if (!r || !r.coords) return;

        // ✅ Para un solo punto, usar setView en lugar de fitBounds
        if (Array.isArray(r.coords[0])) {
            mapReco.fitBounds(r.coords, { padding: [40, 40] });
        } else {
            mapReco.setView(r.coords, 15, { animate: true });
        }

        document.getElementById('recoDetail').innerHTML = `
            <strong>${r.nombreRuta || 'Sin ruta'}</strong>
            <p><strong>Tipo:</strong> ${r.tipo}</p>
            <p><strong>Cantidad:</strong> ${r.cantidadKg} kg</p>
            <p><strong>Fecha:</strong> ${new Date(r.fechaISO).toLocaleString('es-ES')}</p>
        `;
    } catch (err) {
        console.error('Error en zoomToReco:', err);
    }
}

/* ─── Tarjetas resumen (hoy) ─────────────────────────────────────────────── */
async function updateSummary() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const res  = await fetch(`${apiReco}?desde=${today.toISOString()}`);
        const list = await res.json();

        const totalKg = list.reduce((s, r) => s + Number(r.cantidadKg || 0), 0);
        const count   = list.length;
        const byType  = list.reduce((acc, cur) => {
            acc[cur.tipo] = (acc[cur.tipo] || 0) + Number(cur.cantidadKg || 0);
            return acc;
        }, {});

        document.getElementById('card-totalKg').querySelector('h3').textContent = totalKg.toLocaleString('es-ES') + ' kg';
        document.getElementById('card-count').querySelector('h3').textContent   = count;
        document.getElementById('card-org').querySelector('h3').textContent     = (byType['Orgánico'] || 0).toLocaleString('es-ES') + ' kg';
        document.getElementById('card-plast').querySelector('h3').textContent   = (byType['Plástico'] || 0).toLocaleString('es-ES') + ' kg';
        document.getElementById('card-vidrio').querySelector('h3').textContent  = (byType['Vidrio']   || 0).toLocaleString('es-ES') + ' kg';
    } catch (err) {
        console.warn('Error actualizando tarjetas:', err);
    }
}

/* ─── Gráfico semanal ────────────────────────────────────────────────────── */
async function renderWeeklyChart() {
    try {
        const res  = await fetch('/api/recolecciones/stats?period=weekly');
        const data = await res.json();

        const labels = data.daily.map(d => {
            const dt = new Date(d.date + 'T12:00:00');
            return dt.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
        });
        const totals = data.daily.map(d => d.totalKg);

        const ctx = document.getElementById('recoChart').getContext('2d');
        if (chart) chart.destroy();
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ label: 'kg recolectados', data: totals, backgroundColor: '#2fa84f', borderRadius: 6 }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales:  { y: { beginAtZero: true } }
            }
        });
    } catch (err) {
        console.warn('Error renderizando gráfica semanal:', err);
    }
}

/* ─── Cargar y renderizar todo ───────────────────────────────────────────── */
async function loadAll() {
    try {
        const list = await fetchRecolecciones();
        renderTable(list);
        drawOnMap(list);
        await updateSummary();
        await renderWeeklyChart();
    } catch (err) {
        console.error('Error en loadAll:', err);
    }
}

/* ─── Inicialización ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    initMapReco();
    await loadRutasSelect();
    await loadAll();

    document.getElementById('filterTipo').addEventListener('change', loadAll);
    document.getElementById('desde').addEventListener('change', loadAll);
    document.getElementById('hasta').addEventListener('change', loadAll);
    document.getElementById('searchReco').addEventListener('input', debounce(loadAll, 300));

    // Formulario: agregar nueva recolección
    document.getElementById('addRecoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);

        const rutaId     = fd.get('rutaId') || null;
        const tipo       = fd.get('tipo');
        const cantidadKg = Number(fd.get('cantidadKg'));
        const fechaISO   = new Date(fd.get('fechaISO')).toISOString();
        const coordsRaw  = (fd.get('coords') || '').trim();

        let coords = null;
        if (coordsRaw) {
            const parts = coordsRaw.split(',').map(s => parseFloat(s.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) coords = parts;
        }

        if (!tipo || !cantidadKg || !fechaISO) {
            alert('Completa tipo, cantidad y fecha.');
            return;
        }

        // Buscar nombre de la ruta si se seleccionó una
        let nombreRuta = '';
        if (rutaId) {
            try {
                const rres  = await fetch(apiRutas);
                const rutas = await rres.json();
                const r     = rutas.find(x => String(x.id) === String(rutaId));
                nombreRuta  = r ? r.nombre : '';
            } catch (_) {}
        }

        try {
            const res = await fetch(apiReco, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ rutaId: rutaId ? Number(rutaId) : null, nombreRuta, tipo, cantidadKg, fechaISO, coords })
            });

            if (!res.ok) {
                const err = await res.json();
                alert('Error: ' + (err.error || res.statusText));
                return;
            }

            e.target.reset();
            await loadAll();
        } catch (err) {
            console.error(err);
            alert('Error de red al guardar la recolección.');
        }
    });
});

/* ─── Utilidad: debounce ─────────────────────────────────────────────────── */
function debounce(fn, wait) {
    let t;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

// ✅ CORREGIDO: Se eliminó el bloque de código huérfano (10 líneas)
// que existía al final del archivo y causaba un ReferenceError
// al intentar usar la variable `fechaISO` fuera de cualquier función.
