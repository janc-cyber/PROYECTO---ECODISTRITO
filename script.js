'use strict';

/**
 * ✅ CORREGIDO: el login ahora llama al endpoint /login del servidor
 * en vez de validar las credenciales en el cliente.
 */
async function login() {
    const user = document.getElementById('user').value.trim();
    const pass = document.getElementById('pass').value;

    clearError();

    if (!user || !pass) {
        showError('Por favor ingresa usuario y contraseña.');
        return;
    }

    const btn = document.querySelector('.login-box .btn');
    btn.disabled = true;
    btn.textContent = 'Validando…';

    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass })
        });

        if (!res.ok) throw new Error('Error del servidor: ' + res.status);

        const data = await res.json();
        if (data.success) {
            sessionStorage.setItem('ecoAuth', '1');
            window.location.href = 'dashboard.html';
        } else {
            showError('Usuario o contraseña incorrectos.');
        }
    } catch (err) {
        showError('Error de conexión. Verifica que el servidor esté activo (node server.js).');
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Iniciar Sesión';
    }
}

function showError(msg) {
    const el = document.getElementById('loginError');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearError() {
    const el = document.getElementById('loginError');
    if (el) { el.textContent = ''; el.style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('user');
    const passInput = document.getElementById('pass');

    function handleKey(e) {
        if (e.key === 'Enter') { e.preventDefault(); login(); }
    }

    if (userInput) userInput.addEventListener('keydown', handleKey);
    if (passInput) passInput.addEventListener('keydown', handleKey);
});
