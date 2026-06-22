'use strict';
const express = require('express');
const app = express();

app.use(express.static(__dirname));
app.use(express.json());

// ─── AUTH ───────────────────────────────────────────────────────────────────
app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    if (user === 'admin' && pass === '1234') {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// ─── RUTAS ──────────────────────────────────────────────────────────────────
let rutas = [
    {
        id: 1,
        nombre: 'Residencial Botánico',
        sectores: 'Botánico',
        dias: 'Lunes, miércoles y viernes',
        horario: '6:00 am - 3:00 pm',
        coords: [[18.486, -69.931], [18.487, -69.932], [18.488, -69.930]]
    },
    {
        id: 2,
        nombre: 'Los Próceres / Cerik Leonardo Ekman',
        sectores: 'Los Próceres; Cerik Leonardo Ekman',
        dias: 'Martes y sábado',
        horario: '6:00 am - 3:00 pm',
        coords: [[18.480, -69.940], [18.481, -69.942], [18.482, -69.941]]
    },
    {
        id: 3,
        nombre: 'Las Aldabas',
        sectores: 'Las Aldabas',
        dias: 'Martes, jueves y viernes',
        horario: '6:00 am - 3:00 pm',
        coords: [[18.492, -69.925], [18.493, -69.926], [18.494, -69.924]]
    },
    {
        id: 4,
        nombre: 'Urbanización Los Ríos / Villa Marina',
        sectores: 'Los Ríos; Villa Marina',
        dias: 'Martes, jueves y sábado',
        horario: '6:00 am - 3:00 pm',
        coords: [[18.475, -69.935], [18.476, -69.936], [18.477, -69.934]]
    },
    {
        id: 5,
        nombre: 'El Claret',
        sectores: 'El Claret',
        dias: 'Lunes, miércoles y viernes',
        horario: '6:00 am - 3:00 pm',
        coords: [[18.495, -69.920], [18.496, -69.921], [18.497, -69.919]]
    },
    {
        id: 6,
        nombre: 'Circunscripción #1',
        sectores: 'Circunscripción #1',
        dias: 'Programa especial de recolección nocturna',
        horario: 'Nocturno (según programación)',
        coords: [[18.488, -69.930], [18.489, -69.931], [18.490, -69.929]]
    }
];

app.get('/api/rutas', (req, res) => res.json(rutas));

app.post('/api/rutas', (req, res) => {
    const { nombre, sectores, dias, horario, coords } = req.body;
    if (!nombre || !coords || !Array.isArray(coords) || coords.length === 0) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: nombre y coords' });
    }
    const newRoute = {
        id: rutas.length ? Math.max(...rutas.map(r => r.id)) + 1 : 1,
        nombre,
        sectores: sectores || '',
        dias: dias || '',
        horario: horario || '',
        coords
    };
    rutas.push(newRoute);
    res.status(201).json(newRoute);
});

app.put('/api/rutas/:id', (req, res) => {
    const id = Number(req.params.id);
    const r = rutas.find(x => x.id === id);
    if (!r) return res.status(404).json({ error: 'Ruta no encontrada' });
    const { nombre, sectores, dias, horario, coords } = req.body;
    if (nombre) r.nombre = nombre;
    if (sectores !== undefined) r.sectores = sectores;
    if (dias !== undefined) r.dias = dias;
    if (horario !== undefined) r.horario = horario;
    if (coords) r.coords = coords;
    res.json(r);
});

app.delete('/api/rutas/:id', (req, res) => {
    const id = Number(req.params.id);
    const idx = rutas.findIndex(x => x.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Ruta no encontrada' });
    rutas.splice(idx, 1);
    res.json({ ok: true });
});

// ─── RECOLECCIONES ──────────────────────────────────────────────────────────
let recolecciones = [
    { id: 1, rutaId: 1, nombreRuta: 'Residencial Botánico',                    tipo: 'Orgánico', cantidadKg: 420, fechaISO: '2026-06-18T07:30:00Z', coords: [18.486, -69.931] },
    { id: 2, rutaId: 1, nombreRuta: 'Residencial Botánico',                    tipo: 'Plástico', cantidadKg: 120, fechaISO: '2026-06-18T09:10:00Z', coords: [18.487, -69.932] },
    { id: 3, rutaId: 2, nombreRuta: 'Los Próceres / Cerik Leonardo Ekman',     tipo: 'Vidrio',   cantidadKg:  60, fechaISO: '2026-06-17T08:00:00Z', coords: [18.480, -69.940] },
    { id: 4, rutaId: 3, nombreRuta: 'Las Aldabas',                             tipo: 'Orgánico', cantidadKg: 300, fechaISO: '2026-06-16T07:45:00Z', coords: [18.492, -69.925] },
    { id: 5, rutaId: 4, nombreRuta: 'Urbanización Los Ríos / Villa Marina',    tipo: 'Plástico', cantidadKg: 210, fechaISO: '2026-06-19T10:20:00Z', coords: [18.475, -69.935] },
    { id: 6, rutaId: 6, nombreRuta: 'Circunscripción #1',                      tipo: 'Orgánico', cantidadKg: 150, fechaISO: '2026-06-19T22:30:00Z', coords: [18.488, -69.930] },
    { id: 7, rutaId: 5, nombreRuta: 'El Claret',                               tipo: 'Vidrio',   cantidadKg:  85, fechaISO: '2026-06-20T08:15:00Z', coords: [18.495, -69.920] },
    { id: 8, rutaId: 2, nombreRuta: 'Los Próceres / Cerik Leonardo Ekman',     tipo: 'Orgánico', cantidadKg: 310, fechaISO: '2026-06-21T07:00:00Z', coords: [18.481, -69.942] },
    { id: 9, rutaId: 3, nombreRuta: 'Las Aldabas',                             tipo: 'Plástico', cantidadKg: 175, fechaISO: '2026-06-22T08:45:00Z', coords: [18.493, -69.926] },
    { id:10, rutaId: 1, nombreRuta: 'Residencial Botánico',                    tipo: 'Vidrio',   cantidadKg:  45, fechaISO: '2026-06-22T11:00:00Z', coords: [18.486, -69.931] }
];

app.get('/api/recolecciones', (req, res) => {
    const { desde, hasta, tipo } = req.query;
    let list = recolecciones.slice();

    if (tipo) list = list.filter(r => r.tipo && r.tipo.toLowerCase() === tipo.toLowerCase());
    if (desde) { const d = new Date(desde); list = list.filter(r => new Date(r.fechaISO) >= d); }
    if (hasta) { const h = new Date(hasta); list = list.filter(r => new Date(r.fechaISO) <= h); }

    list.sort((a, b) => new Date(b.fechaISO) - new Date(a.fechaISO));
    res.json(list);
});

app.post('/api/recolecciones', (req, res) => {
    const { rutaId, nombreRuta, tipo, cantidadKg, fechaISO, coords } = req.body;
    if (!nombreRuta || !tipo || !cantidadKg || !fechaISO) {
        return res.status(400).json({ error: 'Faltan campos: nombreRuta, tipo, cantidadKg, fechaISO' });
    }
    const newId = recolecciones.length ? Math.max(...recolecciones.map(r => r.id)) + 1 : 1;
    const rec = {
        id: newId,
        rutaId: rutaId || null,
        nombreRuta,
        tipo,
        cantidadKg: Number(cantidadKg),
        fechaISO,
        coords: Array.isArray(coords) ? coords : null
    };
    recolecciones.push(rec);
    res.status(201).json(rec);
});

app.delete('/api/recolecciones/:id', (req, res) => {
    const id = Number(req.params.id);
    const idx = recolecciones.findIndex(x => x.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Recolección no encontrada' });
    recolecciones.splice(idx, 1);
    res.json({ ok: true });
});

app.get('/api/recolecciones/stats', (req, res) => {
    const period = req.query.period || 'daily';
    const now = new Date();
    let start;

    if (period === 'weekly') {
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
    } else {
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
    }

    const filtered = recolecciones.filter(r => new Date(r.fechaISO) >= start);
    const totalsByType = filtered.reduce((acc, cur) => {
        acc[cur.tipo] = (acc[cur.tipo] || 0) + Number(cur.cantidadKg || 0);
        return acc;
    }, {});
    const count = filtered.length;

    if (period === 'weekly') {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            d.setHours(0, 0, 0, 0);
            days.push(d);
        }
        const daily = days.map(d => {
            const next = new Date(d);
            next.setDate(d.getDate() + 1);
            const items = recolecciones.filter(r => new Date(r.fechaISO) >= d && new Date(r.fechaISO) < next);
            const totalKg = items.reduce((s, it) => s + Number(it.cantidadKg || 0), 0);
            return { date: d.toISOString().slice(0, 10), totalKg, count: items.length };
        });
        return res.json({ period: 'weekly', totalsByType, count, daily });
    } else {
        const hours = Array.from({ length: 24 }, (_, h) => {
            const startH = new Date(start);
            startH.setHours(h, 0, 0, 0);
            const endH = new Date(startH);
            endH.setHours(h + 1, 0, 0, 0);
            const items = recolecciones.filter(r => new Date(r.fechaISO) >= startH && new Date(r.fechaISO) < endH);
            const totalKg = items.reduce((s, it) => s + Number(it.cantidadKg || 0), 0);
            return { hour: h, totalKg, count: items.length };
        });
        return res.json({ period: 'daily', totalsByType, count, hours });
    }
});

// ─── REPORTES ───────────────────────────────────────────────────────────────
app.get('/api/reportes/summary', (req, res) => {
    const period = req.query.period || 'daily';
    const now = new Date();
    let start;
    if (period === 'weekly')       { start = new Date(now); start.setDate(now.getDate() - 6);   start.setHours(0, 0, 0, 0); }
    else if (period === 'monthly') { start = new Date(now); start.setMonth(now.getMonth() - 1); start.setHours(0, 0, 0, 0); }
    else                           { start = new Date(now); start.setHours(0, 0, 0, 0); }

    const filtered = recolecciones.filter(r => new Date(r.fechaISO) >= start);
    const totalKg  = filtered.reduce((s, r) => s + Number(r.cantidadKg || 0), 0);
    const count    = filtered.length;
    const byType   = filtered.reduce((acc, cur) => {
        acc[cur.tipo] = (acc[cur.tipo] || 0) + Number(cur.cantidadKg || 0);
        return acc;
    }, {});
    const reciclables  = (byType['Plástico'] || 0) + (byType['Vidrio'] || 0);
    const pctReciclaje = totalKg ? Math.round((reciclables / totalKg) * 10000) / 100 : 0;

    res.json({ period, totalKg, count, byType, pctReciclaje });
});

app.get('/api/reportes/series', (req, res) => {
    const days = Math.min(parseInt(req.query.days || '7', 10), 365);
    const now  = new Date();
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const next = new Date(d);
        next.setDate(d.getDate() + 1);
        const items   = recolecciones.filter(r => new Date(r.fechaISO) >= d && new Date(r.fechaISO) < next);
        const totalKg = items.reduce((s, it) => s + Number(it.cantidadKg || 0), 0);
        result.push({ date: d.toISOString().slice(0, 10), totalKg, count: items.length });
    }
    res.json(result);
});

// ─── USUARIOS ───────────────────────────────────────────────────────────────
let users = [
    { id: 1, name: 'Admin', email: 'admin@ecodistrito.local', role: 'Administrador', lastLogin: null, createdAt: new Date().toISOString() }
];

app.get('/api/users', (req, res) => res.json(users));

app.post('/api/users', (req, res) => {
    const { name, email, role } = req.body;
    if (!name || !email || !role) return res.status(400).json({ error: 'name, email y role son obligatorios' });
    const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const u  = { id, name, email, role, lastLogin: null, createdAt: new Date().toISOString() };
    users.push(u);
    res.status(201).json(u);
});

app.put('/api/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const u  = users.find(x => x.id === id);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { name, email, role } = req.body;
    if (name)  u.name  = name;
    if (email) u.email = email;
    if (role)  u.role  = role;
    res.json(u);
});

app.delete('/api/users/:id', (req, res) => {
    const id  = Number(req.params.id);
    const idx = users.findIndex(x => x.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (id === 1)   return res.status(403).json({ error: 'No se puede eliminar el administrador principal' });
    users.splice(idx, 1);
    res.json({ ok: true });
});

// ─── INICIO DEL SERVIDOR ─────────────────────────────────────────────────────
// ✅ CORREGIDO: app.listen() se llama UNA SOLA VEZ al final
app.listen(3000, () => {
    console.log('🌿 EcoDistrito corriendo en http://localhost:3000');
});
