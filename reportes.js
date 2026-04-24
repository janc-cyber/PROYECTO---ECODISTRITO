// reportes.js
let reportChart;

async function loadReport() {
  const period = document.getElementById('periodReport').value;

  // Indicadores resumen
  const summaryRes = await fetch(`/api/reportes/summary?period=${period}`);
  const summary = await summaryRes.json();
  document.getElementById('indRec').textContent = `${summary.pctReciclaje}%`;
  document.getElementById('indEff').textContent = `${summary.count} recolecciones`;

  // Series para gráfico
  const days = period === 'monthly' ? 30 : (period === 'weekly' ? 7 : 1);
  const seriesRes = await fetch(`/api/reportes/series?days=${days}`);
  const series = await seriesRes.json();

  const labels = series.map(s => s.date);
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
        fill: true
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // Render tabla
  renderTable(series);
}

// Renderizar tabla con botón Ver
function renderTable(list) {
  const tbody = document.querySelector('#tablaRecolecciones tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  list.forEach((r, idx) => {
    const date = new Date(r.dateISO || r.date);
    const diaSemana = date.toLocaleDateString('es-ES', { weekday: 'long' });
    const fecha = date.toLocaleDateString('es-ES');
    const hora = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.ruta || '-'}</td>
      <td>${diaSemana} ${fecha}</td>
      <td>${hora}</td>
      <td>${Number(r.totalKg || r.cantidadKg || 0).toLocaleString()} kg</td>
      <td><button class="btn small verBtn" data-index="${idx}">Ver</button></td>
    `;
    tbody.appendChild(tr);
  });

  // Conectar botones Ver
  document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.verBtn').forEach(btn => {
    btn.addEventListener('click', function() {
      const fila = this.closest('tr');
      const ruta = fila.cells[0].textContent;
      const fecha = fila.cells[1].textContent;
      const hora = fila.cells[2].textContent;
      const kilos = fila.cells[3].textContent;

      document.getElementById('recoDetail').innerHTML = `
        <p><strong>Ruta:</strong> ${ruta}</p>
        <p><strong>Día / Fecha:</strong> ${fecha}</p>
        <p><strong>Hora:</strong> ${hora}</p>
        <p><strong>Kilos recogidos:</strong> ${kilos}</p>
      `;
    });
  });
});


// Exportar CSV
function exportCSV() {
  const filas = document.querySelectorAll("#tablaRecolecciones tr");
  let csv = [];
  filas.forEach(fila => {
    const cols = fila.querySelectorAll("td, th");
    const datos = Array.from(cols).map(c => c.textContent);
    csv.push(datos.join(","));
  });
  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "recolecciones.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// Exportar PDF con jsPDF
function exportPDF() {
  const doc = new jspdf.jsPDF();
  doc.text("Reporte de Recolecciones", 10, 10);
  doc.autoTable({ html: '#tablaRecolecciones' });
  doc.save("recolecciones.pdf");
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('periodReport').addEventListener('change', loadReport);
  document.getElementById('btnExportCSV').addEventListener('click', exportCSV);
  document.getElementById('btnExportPDF').addEventListener('click', exportPDF);
  loadReport();
});
}