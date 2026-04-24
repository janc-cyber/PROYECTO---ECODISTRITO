function login() {
    let user = document.getElementById("user").value;
    let pass = document.getElementById("pass").value;

    // Validación simple
    if(user === "admin" && pass === "1234"){
        window.location.href = "dashboard.html";
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

document.addEventListener('DOMContentLoaded', function () {
  const userInput = document.getElementById('user');
  const passInput = document.getElementById('pass');

  function handleKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      login();
    }
  }

  if (userInput) userInput.addEventListener('keydown', handleKey);
  if (passInput) passInput.addEventListener('keydown', handleKey);
});







