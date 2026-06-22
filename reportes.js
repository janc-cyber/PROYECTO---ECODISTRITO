'use strict';

let reportChart;

/* ─── Cargar reporte según periodo ──────────────────────────────────────── */
async function loadReport() {
    const period = document.getElementById('periodReport').value;

    try {
        // Indicadores de resumen
        const summaryRes = await fetch(`/api/reportes/summary?period=${period}`);
        const summary    = await summaryRes.json();

        document.getElementById('indTotal').textContent = summary.totalKg.toLocaleString('es-ES') + ' kg';
        document.getElementById('indRec').textContent   = summary.pctReciclaje + '%';
        document.getElementById('indEff').textContent   = summary.count;

        // Desglose por tipo
        const ulByType = document.getElementById('indByType');
        ulByType.innerHTML = '';
        Object.entries(summary.byType || {}).forEach(([tipo, kg]) => {
            const li = document.createElement('li');
            li.textContent = `${tipo}: ${kg.toLocaleString('es-ES')} kg`;
            ulByType.appendChild(li);
        });

        // Series para gráfico
        const days      = period === 'monthly' ? 30 : period === 'weekly' ? 7 : 1;
        const seriesRes = await fetch(`/api/reportes/series?days=${days}`);
        const series    = await seriesRes.json();

        renderChart(series);
        renderTable(series);
    } catch (err) {
        console.error('Error cargando reporte:', err);
    }
}

/* ─── Renderizar gráfico ─────────────────────────────────────────────────── */
function renderChart(series) {
    const labels = series.map(s => {
        const d = new Date(s.date + 'T12:00:00');
        return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    });
    const data = series.map(s => s.totalKg);

    const ctx = document.getElementById('reportChart').getContext('2d');
    if (reportChart) reportChart.destroy();

    reportChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'kg recolectados',
                data,
                borderColor: '#2fa84f',
                backgroundColor: 'rgba(47,168,79,0.12)',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales:  { y: { beginAtZero: true } }
        }
    });
}

/* ─── Renderizar tabla ───────────────────────────────────────────────────── */
// ✅ CORREGIDO: función tiene su llave de cierre correcta.
//    Las funciones exportCSV, exportPDF y addEventListener estaban
//    DENTRO de esta función por un } faltante.
function renderTable(series) {
    const tbody = document.querySelector('#tablaRecolecciones tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    series.forEach(s => {
        const d   = new Date(s.date + 'T12:00:00');
        const dia = d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${dia}</td>
            <td>${s.count}</td>
            <td>${Number(s.totalKg || 0).toLocaleString('es-ES')} kg</td>
            <td>
                <button class="btn small verBtn" data-date="${s.date}" data-count="${s.count}" data-kg="${s.totalKg}">
                    Ver
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}   // ✅ Esta llave cerraba cuando faltaba antes

/* ─── Evento delegado para botones "Ver" ────────────────────────────────── */
// ✅ CORREGIDO: usado event delegation en lugar de addEventListener dentro de renderTable
document.addEventListener('click', function (e) {
    if (!e.target.classList.contains('verBtn')) return;
    const btn   = e.target;
    const fecha = btn.closest('tr').cells[0].textContent;
    const count = btn.dataset.count;
    const kg    = Number(btn.dataset.kg || 0).toLocaleString('es-ES');

    const detail = document.getElementById('recoDetail');
    if (detail) {
        detail.innerHTML = `
            <div style="padding:10px;background:rgba(47,168,79,0.08);border-radius:8px;border-left:4px solid #2fa84f;">
                <p><strong>📅 Fecha:</strong> ${fecha}</p>
                <p><strong>🔢 Recolecciones:</strong> ${count}</p>
                <p><strong>⚖️ Total recolectado:</strong> ${kg} kg</p>
            </div>
        `;
    }
});

/* ─── Exportar CSV ───────────────────────────────────────────────────────── */
// ✅ CORREGIDO: ahora es una función de nivel superior (no anidada)
function exportCSV() {
    const filas = document.querySelectorAll('#tablaRecolecciones tr');
    if (filas.length === 0) { alert('No hay datos para exportar.'); return; }

    const csv = [];
    filas.forEach(fila => {
        const cols  = fila.querySelectorAll('td, th');
        const datos = Array.from(cols)
            .slice(0, 3) // excluir columna Acciones
            .map(c => `"${c.textContent.trim().replace(/"/g, '""')}"`);
        csv.push(datos.join(','));
    });

    const blob = new Blob(['\uFEFF' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `ecodistrito_reporte_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* ─── Exportar PDF ───────────────────────────────────────────────────────── */
// ✅ CORREGIDO: ahora es una función de nivel superior (no anidada)
function exportPDF() {
    if (typeof jspdf === 'undefined' || !jspdf.jsPDF) {
        alert('Error: librería jsPDF no disponible. Verifica tu conexión a internet.');
        return;
    }
    const doc = new jspdf.jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(47, 168, 79);
    doc.text('EcoDistrito — Reporte de Recolecciones', 14, 16);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 23);
    doc.text(`Periodo: ${document.getElementById('periodReport').options[document.getElementById('periodReport').selectedIndex].text}`, 14, 29);

    doc.autoTable({
        html:    '#tablaRecolecciones',
        startY:  35,
        columns: [0, 1, 2], // excluir columna Acciones
        styles:  { fontSize: 9 },
        headStyles: { fillColor: [47, 168, 79] }
    });

    doc.save(`ecodistrito_reporte_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/* ─── Inicialización ────────────────────────────────────────────────────── */
// ✅ CORREGIDO: este addEventListener ya no está dentro de renderTable
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    document.getElementById('periodReport').addEventListener('change', loadReport);
    document.getElementById('btnExportCSV').addEventListener('click', exportCSV);
    document.getElementById('btnExportPDF').addEventListener('click', exportPDF);
    loadReport();
});
