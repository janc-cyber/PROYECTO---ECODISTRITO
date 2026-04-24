const express = require('express');
const app = express();

app.use(express.static(__dirname));
app.use(express.json());

app.post('/login', (req, res) => {
    const {user, pass} = req.body;

    if(user === "admin" && pass === "1234"){
        res.json({success: true});
    } else {
        res.json({success: false});
    }
});

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});


// Datos en memoria (ejemplos)
let rutas = [
  {
    id: 1,
    nombre: "Residencial Botánico",
    sectores: "Botánico",
    dias: "Lunes, miércoles y viernes",
    horario: "6:00 am - 3:00 pm",
    // polilínea: array de coordenadas [lat, lng]
    coords: [[18.486, -69.931], [18.487, -69.932], [18.488, -69.930]]
  },
  {
    id: 2,
    nombre: "Los Próceres / Cerik Leonardo Ekman",
    sectores: "Los Próceres; Cerik Leonardo Ekman",
    dias: "Martes y sábado",
    horario: "6:00 am - 3:00 pm",
    coords: [[18.480, -69.940], [18.481, -69.942], [18.482, -69.941]]
  },
  {
    id: 3,
    nombre: "Las Aldabas",
    sectores: "Las Aldabas",
    dias: "Martes, jueves y viernes",
    horario: "6:00 am - 3:00 pm",
    coords: [[18.492, -69.925], [18.493, -69.926], [18.494, -69.924]]
  },
  {
    id: 4,
    nombre: "Urbanización Los Ríos / Villa Marina",
    sectores: "Los Ríos; Villa Marina",
    dias: "Martes, jueves y sábado",
    horario: "6:00 am - 3:00 pm",
    coords: [[18.475, -69.935], [18.476, -69.936], [18.477, -69.934]]
  },
  {
    id: 5,
    nombre: "El Claret",
    sectores: "El Claret",
    dias: "Lunes, miércoles y viernes",
    horario: "6:00 am - 3:00 pm",
    coords: [[18.495, -69.920], [18.496, -69.921], [18.497, -69.919]]
  },
  {
    id: 6,
    nombre: "Circunscripción #1",
    sectores: "Circunscripción #1",
    dias: "Programa especial de recolección nocturna",
    horario: "Nocturno (según programación)",
    coords: [[18.488, -69.930], [18.489, -69.931], [18.490, -69.929]]
  }
];

// Endpoint para obtener rutas
app.get('/api/rutas', (req, res) => {
  res.json(rutas);
});

// Endpoint para crear una ruta nueva
// Espera JSON: { nombre, sectores, dias, horario, coords: [[lat,lng], ...] }
app.post('/api/rutas', (req, res) => {
  const { nombre, sectores, dias, horario, coords } = req.body;
  if (!nombre || !coords || !Array.isArray(coords) || coords.length === 0) {
    return res.status(400).json({ error: "Faltan campos obligatorios: nombre y coords (array de [lat,lng])" });
  }
  const newRoute = {
    id: rutas.length ? Math.max(...rutas.map(r => r.id)) + 1 : 1,
    nombre,
    sectores: sectores || "",
    dias: dias || "",
    horario: horario || "",
    coords
  };
  rutas.push(newRoute);
  res.status(201).json(newRoute);
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});






/* */





// Datos de recolecciones en memoria (ejemplos)
let recolecciones = [
  // formato: { id, rutaId, nombreRuta, tipo, cantidadKg, fechaISO, coords: [lat,lng] }
  { id: 1, rutaId: 1, nombreRuta: "Residencial Botánico", tipo: "Orgánico", cantidadKg: 420, fechaISO: "2026-04-13T07:30:00Z", coords: [18.486, -69.931] },
  { id: 2, rutaId: 1, nombreRuta: "Residencial Botánico", tipo: "Plástico", cantidadKg: 120, fechaISO: "2026-04-13T09:10:00Z", coords: [18.487, -69.932] },
  { id: 3, rutaId: 2, nombreRuta: "Los Próceres / Cerik Leonardo Ekman", tipo: "Vidrio", cantidadKg: 60, fechaISO: "2026-04-12T08:00:00Z", coords: [18.480, -69.940] },
  { id: 4, rutaId: 3, nombreRuta: "Las Aldabas", tipo: "Orgánico", cantidadKg: 300, fechaISO: "2026-04-11T07:45:00Z", coords: [18.492, -69.925] },
  { id: 5, rutaId: 4, nombreRuta: "Urbanización Los Ríos / Villa Marina", tipo: "Plástico", cantidadKg: 210, fechaISO: "2026-04-13T10:20:00Z", coords: [18.475, -69.935] },
  { id: 6, rutaId: 6, nombreRuta: "Circunscripción #1", tipo: "Orgánico", cantidadKg: 150, fechaISO: "2026-04-13T22:30:00Z", coords: [18.488, -69.930] }
];

// GET /api/recolecciones  -> lista (opcional query: desde, hasta, tipo)
app.get('/api/recolecciones', (req, res) => {
  const { desde, hasta, tipo } = req.query;
  let list = recolecciones.slice();

  if (tipo) {
    list = list.filter(r => r.tipo && r.tipo.toLowerCase() === tipo.toLowerCase());
  }
  if (desde) {
    const d = new Date(desde);
    list = list.filter(r => new Date(r.fechaISO) >= d);
  }
  if (hasta) {
    const h = new Date(hasta);
    list = list.filter(r => new Date(r.fechaISO) <= h);
  }
  // ordenar por fecha descendente
  list.sort((a,b) => new Date(b.fechaISO) - new Date(a.fechaISO));
  res.json(list);
});

// POST /api/recolecciones  -> crear recolección
// body: { rutaId, nombreRuta, tipo, cantidadKg, fechaISO, coords: [lat,lng] }
app.post('/api/recolecciones', (req, res) => {
  const { rutaId, nombreRuta, tipo, cantidadKg, fechaISO, coords } = req.body;
  if (!nombreRuta || !tipo || !cantidadKg || !fechaISO) {
    return res.status(400).json({ error: "Faltan campos obligatorios: nombreRuta, tipo, cantidadKg, fechaISO" });
  }
  const newId = recolecciones.length ? Math.max(...recolecciones.map(r => r.id)) + 1 : 1;
  const newRec = {
    id: newId,
    rutaId: rutaId || null,
    nombreRuta,
    tipo,
    cantidadKg: Number(cantidadKg),
    fechaISO,
    coords: Array.isArray(coords) ? coords : (coords ? coords : null)
  };
  recolecciones.push(newRec);
  res.status(201).json(newRec);
});

// GET /api/recolecciones/stats?period=daily|weekly
app.get('/api/recolecciones/stats', (req, res) => {
  const period = req.query.period || 'daily'; // daily or weekly
  const now = new Date();
  let start;
  if (period === 'weekly') {
    // últimos 7 días (incluye hoy)
    start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0,0,0,0);
  } else {
    // daily: hoy desde 00:00
    start = new Date(now);
    start.setHours(0,0,0,0);
  }

  const filtered = recolecciones.filter(r => new Date(r.fechaISO) >= start);

  // Totales por tipo
  const totalsByType = filtered.reduce((acc, cur) => {
    acc[cur.tipo] = (acc[cur.tipo] || 0) + Number(cur.cantidadKg || 0);
    return acc;
  }, {});

  // Número de recolecciones del día (si period=daily) o total en periodo
  const count = filtered.length;

  // Historial diario (para weekly: array de 7 días; para daily: horas)
  if (period === 'weekly') {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      d.setHours(0,0,0,0);
      days.push(d);
    }
    const daily = days.map(d => {
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const items = recolecciones.filter(r => new Date(r.fechaISO) >= d && new Date(r.fechaISO) < next);
      const totalKg = items.reduce((s, it) => s + Number(it.cantidadKg || 0), 0);
      return { date: d.toISOString().slice(0,10), totalKg, count: items.length };
    });
    return res.json({ period: 'weekly', totalsByType, count, daily });
  } else {
    // daily: agrupado por hora (0-23)
    const hours = Array.from({length:24}, (_,h) => {
      const startH = new Date(start);
      startH.setHours(h,0,0,0);
      const endH = new Date(startH);
      endH.setHours(h+1,0,0,0);
      const items = recolecciones.filter(r => new Date(r.fechaISO) >= startH && new Date(r.fechaISO) < endH);
      const totalKg = items.reduce((s, it) => s + Number(it.cantidadKg || 0), 0);
      return { hour: h, totalKg, count: items.length };
    });
    return res.json({ period: 'daily', totalsByType, count, hours });
  }
});







// --- REPORTES: estadísticas agregadas y export (simple) ---
app.get('/api/reportes/summary', (req, res) => {
  // parámetros opcionales: period=daily|weekly|monthly
  const period = req.query.period || 'daily';
  // reutiliza recolecciones en memoria
  const now = new Date();
  let start;
  if (period === 'weekly') { start = new Date(now); start.setDate(now.getDate()-6); start.setHours(0,0,0,0); }
  else if (period === 'monthly') { start = new Date(now); start.setMonth(now.getMonth()-1); start.setHours(0,0,0,0); }
  else { start = new Date(now); start.setHours(0,0,0,0); }

  const filtered = recolecciones.filter(r => new Date(r.fechaISO) >= start);
  const totalKg = filtered.reduce((s, r) => s + Number(r.cantidadKg || 0), 0);
  const count = filtered.length;
  const byType = filtered.reduce((acc, cur) => { acc[cur.tipo] = (acc[cur.tipo]||0) + Number(cur.cantidadKg||0); return acc; }, {});
  // % reciclaje: ejemplo simple = (reciclables / total) *100 (considero Plástico+Vidrio como reciclables)
  const reciclables = (byType['Plástico']||0) + (byType['Vidrio']||0);
  const pctReciclaje = totalKg ? Math.round((reciclables/totalKg)*10000)/100 : 0;
  res.json({ period, totalKg, count, byType, pctReciclaje });
});

// Endpoint para obtener series diarias (últimos N días)
app.get('/api/reportes/series', (req, res) => {
  const days = parseInt(req.query.days || '7', 10);
  const now = new Date();
  const result = [];
  for (let i = days-1; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate()-i); d.setHours(0,0,0,0);
    const next = new Date(d); next.setDate(d.getDate()+1);
    const items = recolecciones.filter(r => new Date(r.fechaISO) >= d && new Date(r.fechaISO) < next);
    const totalKg = items.reduce((s, it) => s + Number(it.cantidadKg||0), 0);
    result.push({ date: d.toISOString().slice(0,10), totalKg, count: items.length });
  }
  res.json(result);
});







// --- ADMINISTRACIÓN: usuarios (en memoria) ---
let users = [
  { id:1, name:'Admin', email:'admin@ecodistrito.local', role:'Administrador', lastLogin: null, createdAt: new Date().toISOString() }
];

// GET usuarios
app.get('/api/users', (req,res) => {
  res.json(users);
});

// POST crear usuario
app.post('/api/users', (req,res) => {
  const { name, email, role } = req.body;
  if (!name || !email || !role) return res.status(400).json({ error: 'name,email,role son obligatorios' });
  const id = users.length ? Math.max(...users.map(u=>u.id))+1 : 1;
  const u = { id, name, email, role, lastLogin: null, createdAt: new Date().toISOString() };
  users.push(u);
  res.status(201).json(u);
});

// PUT editar usuario
app.put('/api/users/:id', (req,res) => {
  const id = Number(req.params.id);
  const u = users.find(x=>x.id===id);
  if (!u) return res.status(404).json({ error:'Usuario no encontrado' });
  const { name, email, role } = req.body;
  if (name) u.name = name;
  if (email) u.email = email;
  if (role) u.role = role;
  res.json(u);
});

// DELETE usuario
app.delete('/api/users/:id', (req,res) => {
  const id = Number(req.params.id);
  const idx = users.findIndex(x=>x.id===id);
  if (idx === -1) return res.status(404).json({ error:'Usuario no encontrado' });
  users.splice(idx,1);
  res.json({ ok:true });
});
