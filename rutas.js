// Datos de ejemplo (las rutas que pediste)
const rutas = [
  {
    id: "Residencial Botánico",
    sectores: "Botánico",
    dias: "Lunes, miércoles y viernes",
    horario: "6:00 am - 3:00 pm",
    coords: [18.486, -69.931] // ejemplo
  },
  {
    id: "Los Próceres / Cerik Leonardo Ekman",
    sectores: "Los Próceres; Cerik Leonardo Ekman",
    dias: "Martes y sábado",
    horario: "6:00 am - 3:00 pm",
    coords: [18.480, -69.940]
  },
  {
    id: "Las Aldabas",
    sectores: "Las Aldabas",
    dias: "Martes, jueves y viernes",
    horario: "6:00 am - 3:00 pm",
    coords: [18.492, -69.925]
  },
  {
    id: "Urbanización Los Ríos / Villa Marina",
    sectores: "Los Ríos; Villa Marina",
    dias: "Martes, jueves y sábado",
    horario: "6:00 am - 3:00 pm",
    coords: [18.475, -69.935]
  },
  {
    id: "El Claret",
    sectores: "El Claret",
    dias: "Lunes, miércoles y viernes",
    horario: "6:00 am - 3:00 pm",
    coords: [18.495, -69.920]
  },
  {
    id: "Circunscripción #1",
    sectores: "Circunscripción #1",
    dias: "Programa especial de recolección nocturna",
    horario: "Nocturno (según programación)",
    coords: [18.488, -69.930]
  }
];

// Render tabla
function renderTable() {
  const tbody = document.querySelector("#routesTable tbody");
  tbody.innerHTML = "";
  rutas.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${r.id}</strong></td>
      <td>${r.sectores}</td>
      <td>${r.dias}</td>
      <td>${r.horario}</td>
      <td>
        <button class="btn small" data-index="${i}" onclick="zoomToRoute(${i})">Ver</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Inicializar mapa
let map, markers = [];
function initMap() {
  map = L.map('mapRoutes').setView([18.4861, -69.9312], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  rutas.forEach((r, i) => {
    const m = L.marker(r.coords).addTo(map).bindPopup(`<strong>${r.id}</strong><br>${r.dias}<br>${r.horario}`);
    markers.push(m);
  });
}

// Zoom y mostrar detalle
function zoomToRoute(index) {
  const r = rutas[index];
  map.setView(r.coords, 14, { animate: true });
  markers[index].openPopup();
  const detail = document.getElementById('routeDetail');
  detail.innerHTML = `
    <strong>${r.id}</strong>
    <p><strong>Sectores:</strong> ${r.sectores}</p>
    <p><strong>Días:</strong> ${r.dias}</p>
    <p><strong>Horario:</strong> ${r.horario}</p>
  `;
}

// Inicialización al cargar
document.addEventListener('DOMContentLoaded', function () {
  renderTable();
  initMap();
});
