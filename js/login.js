 // Protección de sesión
    if (!sessionStorage.getItem("loggedIn")) {
      window.location.href = "login.html";
    }

    // Cerrar sesión
    document.getElementById("logoutBtn").addEventListener("click", () => {
      sessionStorage.removeItem("loggedIn");
      window.location.href = "login.html";
    });

    // Función para manejar entradas
    const form = document.getElementById('entradaForm');
    const tabla = document.getElementById('tablaEntradas').querySelector('tbody');

    // Cargar las entradas guardadas en localStorage
    const entradas = JSON.parse(localStorage.getItem('entradas') || '[]');
    renderEntradas();

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const producto = document.getElementById('producto').value.trim();
      const cantidad = parseInt(document.getElementById('cantidad').value);
      const fecha = document.getElementById('fecha').value;

      if (!producto || cantidad <= 0 || !fecha) return;

      entradas.push({ producto, cantidad, fecha });
      localStorage.setItem('entradas', JSON.stringify(entradas));
      renderEntradas();

      form.reset();
    });

    function renderEntradas() {
      tabla.innerHTML = entradas.length
        ? entradas.map(e => `
            <tr>
              <td>${e.producto}</td>
              <td>${e.cantidad}</td>
              <td>${e.fecha}</td>
            </tr>
          `).join('')
        : '<tr><td colspan="3" class="empty">No hay entradas registradas.</td></tr>';
    }