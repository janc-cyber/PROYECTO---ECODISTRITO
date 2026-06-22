'use strict';

/**
 * Verifica autenticación. Si el usuario no está autenticado,
 * redirige al login. Llamar al inicio de cada página protegida.
 */
function checkAuth() {
    if (!sessionStorage.getItem('ecoAuth')) {
        window.location.replace('login.html');
    }
}

/**
 * Cierra sesión: limpia almacenamiento y redirige al login.
 * Disponible globalmente para los botones de "Salir".
 */
function logout() {
    try {
        sessionStorage.removeItem('ecoAuth');
        sessionStorage.clear();
        localStorage.removeItem('token');
    } catch (e) {
        console.warn('Error al limpiar almacenamiento', e);
    }
    window.location.href = 'login.html';
}
