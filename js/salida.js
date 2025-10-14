
    // Protección de sesión
    if (!sessionStorage.getItem("loggedIn")) {
      window.location.href = "login.html";
    }

    // Cerrar sesión
    document.getElementById("logoutBtn").addEventListener("click", () => {
      sessionStorage.removeItem("loggedIn");
      window.location.href = "login.html";
    });

    const form = document.getElementById('salidaForm');
    const tabla = document.getElementById('tablaSalidas').querySelector('tbody');

    // Cargar las salidas guardadas
    const salidas = JSON.parse(localStorage.getItem('salidas') || '[]');
    renderSalidas();

    // Agregar salida
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const producto = document.getElementById('producto').value.trim();
      const cantidad = parseInt(document.getElementById('cantidad').value);
      const fecha = document.getElementById('fecha').value;

      if (!producto || cantidad <= 0 || !fecha) return;

      salidas.push({ id: Date.now(), producto, cantidad, fecha });
      localStorage.setItem('salidas', JSON.stringify(salidas));
      renderSalidas();
      form.reset();
    });

    // Renderizar tabla
    function renderSalidas() {
      tabla.innerHTML = salidas.length
        ? salidas.map(e => `
            <tr>
              <td>${e.producto}</td>
              <td>${e.cantidad}</td>
              <td>${e.fecha}</td>
              <td>
                <button class="btn-eliminar" onclick="eliminarSalida(${e.id})">🗑️</button>
              </td>
            </tr>
          `).join('')
        : '<tr><td colspan="4" class="empty">No hay salidas registradas.</td></tr>';
    }

    // Eliminar salida
    function eliminarSalida(id) {
      const index = salidas.findIndex(e => e.id === id);
      if (index >= 0) {
        if (confirm("¿Deseas eliminar esta salida?")) {
          salidas.splice(index, 1);
          localStorage.setItem('salidas', JSON.stringify(salidas));
          renderSalidas();
        }
      }
    }

    // Hacer disponible la función en el scope global
    window.eliminarSalida = eliminarSalida;
