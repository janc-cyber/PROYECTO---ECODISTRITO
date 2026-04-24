// administracion.js
// Ajusta esta URL según dónde corra tu backend.
// Ejemplo: 'http://localhost:3000/api/users'

let users = [];
let nextId = 1;

function renderUsers() {
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${new Date(u.createdAt).toLocaleString()}</td>
      <td>
        <button class="btn small" onclick="openEditModal(${u.id})">Editar</button>
        <button class="btn small" onclick="deleteUser(${u.id})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addUserForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const user = {
      id: nextId++,
      name: fd.get('name'),
      email: fd.get('email'),
      role: fd.get('role'),
      createdAt: new Date()
    };
    users.push(user);
    form.reset();
    renderUsers();
  });

  const editForm = document.getElementById('editUserForm');
  editForm.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(editForm);
    const id = parseInt(fd.get('id'));
    const user = users.find(u => u.id === id);
    if (user) {
      user.name = fd.get('name');
      user.email = fd.get('email');
      user.role = fd.get('role');
      closeModal();
      renderUsers();
    }
  });
});

function openEditModal(id) {
  const user = users.find(u => u.id === id);
  if (!user) return;
  const modal = document.getElementById('editModal');
  modal.style.display = 'block';
  const form = document.getElementById('editUserForm');
  form.name.value = user.name;
  form.email.value = user.email;
  form.role.value = user.role;
  form.id.value = user.id;
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

function deleteUser(id) {
  users = users.filter(u => u.id !== id);
  renderUsers();
}
