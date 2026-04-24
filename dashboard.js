document.addEventListener('DOMContentLoaded', function () {
  /* ===== Gráfica (Chart.js) ===== */
  const canvas = document.getElementById('grafica');
  if (canvas && typeof Chart !== 'undefined') {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],
          datasets: [{
            label: 'Residuos Recolectados',
            data: [20,40,30,50,45,60,55],
            borderColor: 'green',
            backgroundColor: 'rgba(0,128,0,0.2)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          plugins: { legend: { display: true } },
          maintainAspectRatio: false
        }
      });
    } else {
      console.error('No se pudo obtener el contexto 2D para #grafica');
    }
  } else {
    if (!canvas) console.warn('#grafica no encontrado en el DOM');
    if (typeof Chart === 'undefined') console.warn('Chart.js no está cargado');
  }

  /* ===== Mapa (Leaflet) ===== */
  // Asegúrate de que Leaflet esté cargado y que exista el contenedor #map
  const mapEl = document.getElementById('map');
  if (mapEl) {
    if (typeof L === 'undefined') {
      console.error('Leaflet (L) no está definido. Incluye leaflet.js antes de dashboard.js');
    } else {
      try {
        const map = L.map('map').setView([18.4861, -69.9312], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Ruta simulada (polilínea)
        const latlngs = [
          [18.48, -69.93],
          [18.49, -69.94],
          [18.50, -69.95]
        ];
        L.polyline(latlngs, { color: 'green', weight: 5, smoothFactor: 1 }).addTo(map);

        // Marcadores
        L.marker([18.48, -69.93]).addTo(map).bindPopup("Inicio");
        L.marker([18.50, -69.95]).addTo(map).bindPopup("Fin");
      } catch (err) {
        console.error('Error inicializando Leaflet:', err);
      }
    }
  } else {
    console.warn('#map no encontrado en el DOM; mapa no será inicializado');
  }
});
