'use strict';

/* ─── Inicialización ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // ✅ CORREGIDO: Carga usuarios desde la API real en vez de un array local
    loadUsers();

    // Formulario: crear usuario
    document.getElementById('addUserForm').addEventListener('submit', async e => {
        e.preventDefault();
        const fd   = new FormData(e.target);
        const body = { name: fd.get('name'), email: fd.get('email'), role: fd.get('role') };

        try {
            const res = await fetch('/api/users', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(body)
            });
            if (!res.ok) {
                const err = await res.json();
                alert('Error: ' + (err.error || res.statusText));
                return;
            }
            e.target.reset();
            await loadUsers();
        } catch (err) {
            alert('Error de red al crear usuario.');
        }
    });

    // ✅ CORREGIDO: editUserForm ahora existe en el HTML
    document.getElementById('editUserForm').addEventListener('submit', async e => {
        e.preventDefault();
        const fd   = new FormData(e.target);
        const id   = fd.get('id');
        const body = { name: fd.get('name'), email: fd.get('email'), role: fd.get('role') };

        try {
            const res = await fetch(`/api/users/${id}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(body)
            });
            if (!res.ok) {
                const err = await res.json();
                alert('Error: ' + (err.error || res.statusText));
                return;
            }
            closeModal();
            await loadUsers();
        } catch (err) {
            alert('Error de red al editar usuario.');
        }
    });

    // Cerrar modal al hacer clic fuera de él
    document.getElementById('editModal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });
});

/* ─── Cargar y renderizar usuarios ──────────────────────────────────────── */
async function loadUsers() {
    try {
        const res   = await fetch('/api/users');
        const users = await res.json();
        renderUsers(users);
    } catch (err) {
        console.error('Error cargando usuarios:', err);
        document.querySelector('#usersTable tbody').innerHTML =
            '<tr><td colspan="5" style="text-align:center;color:#c0392b">Error al cargar usuarios.</td></tr>';
    }
}

function renderUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;opacity:0.6">Sin usuarios registrados</td></tr>';
        return;
    }

    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td><span class="badge-role" data-role="${u.role}">${u.role}</span></td>
            <td>${new Date(u.createdAt).toLocaleDateString('es-ES')}</td>
            <td>
                <button class="btn small" onclick="openEditModal(${u.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn small btn-danger" onclick="deleteUser(${u.id})" ${u.id === 1 ? 'disabled title="No se puede eliminar el admin principal"' : ''}>
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* ─── Abrir modal de edición ─────────────────────────────────────────────── */
// ✅ CORREGIDO: ahora funciona porque el modal existe en el HTML
async function openEditModal(id) {
    try {
        const res   = await fetch('/api/users');
        const users = await res.json();
        const u     = users.find(x => x.id === id);
        if (!u) { alert('Usuario no encontrado.'); return; }

        const form = document.getElementById('editUserForm');
        form.elements['id'].value    = u.id;
        form.elements['name'].value  = u.name;
        form.elements['email'].value = u.email;
        form.elements['role'].value  = u.role;

        document.getElementById('editModal').style.display = 'flex';
    } catch (err) {
        console.error('Error abriendo modal:', err);
        alert('Error al cargar datos del usuario.');
    }
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

/* ─── Eliminar usuario ───────────────────────────────────────────────────── */
async function deleteUser(id) {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    try {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const err = await res.json();
            alert('Error: ' + (err.error || res.statusText));
            return;
        }
        await loadUsers();
    } catch (err) {
        alert('Error de red al eliminar usuario.');
    }
}
