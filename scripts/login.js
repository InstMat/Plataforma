document.addEventListener('DOMContentLoaded', function() {
    const CLAVE = "instmat2025"; // Cambia por la clave que desees

    function mostrarLogin() {
        document.getElementById('login-modal').style.display = 'flex';
    }
    function ocultarLogin() {
        document.getElementById('login-modal').style.display = 'none';
    }
    function intentarLogin() {
        const pass = document.getElementById('login-password').value;
        if (pass === CLAVE) {
            ocultarLogin();
            sessionStorage.setItem('autenticado', '1');
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    }
    document.getElementById('login-btn').onclick = intentarLogin;
    document.getElementById('login-password').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            intentarLogin();
        }
    });
    if (sessionStorage.getItem('autenticado') !== '1') {
        mostrarLogin();
    }
});