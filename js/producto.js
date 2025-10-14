    // =============================
    // PROTECCIÓN DE SESIÓN
    // =============================
    if (!sessionStorage.getItem("loggedIn")) {
      window.location.href = "login.html";
    }

    document.getElementById("logoutBtn").addEventListener("click", () => {
      sessionStorage.removeItem("loggedIn");
      window.location.href = "login.html";
    });

    // =============================
    // GESTIÓN DE PRODUCTOS
    // =============================
    const form = document.getElementById('formProducto');
    const tabla = document.getElementById('tablaProductos').querySelector('tbody');
    let productos = JSON.parse(localStorage.getItem('productos') || '[]');

    const renderTabla = () => {
      if (productos.length === 0) {
        tabla.innerHTML = `<tr><td colspan="4" class="empty">No hay productos registrados.</td></tr>`;
        return;
      }

      tabla.innerHTML = productos.map((p, index) => `
        <tr>
          <td>${p.nombre}</td>
          <td>${p.categoria}</td>
          <td>$${p.precio.toLocaleString()}</td>
          <td>
            <button class="btn-editar" onclick="editarProducto(${index})">✏️</button>
            <button class="btn-eliminar" onclick="eliminarProducto(${index})">🗑️</button>
          </td>
        </tr>
      `).join('');
    };

    const guardarProductos = () => {
      localStorage.setItem('productos', JSON.stringify(productos));
      renderTabla();
    };

    form.addEventListener('submit', e => {
      e.preventDefault();
      const nombre = document.getElementById('nombre').value.trim();
      const categoria = document.getElementById('categoria').value.trim();
      const precio = parseFloat(document.getElementById('precio').value);

      if (!nombre || !categoria || isNaN(precio)) return alert("Por favor completa todos los campos correctamente.");

      productos.push({ nombre, categoria, precio });
      guardarProductos();

      form.reset();
      alert("✅ Producto agregado con éxito.");
    });

    window.eliminarProducto = index => {
      if (confirm("¿Seguro que deseas eliminar este producto?")) {
        productos.splice(index, 1);
        guardarProductos();
      }
    };

    window.editarProducto = index => {
      const producto = productos[index];
      const nuevoNombre = prompt("Editar nombre:", producto.nombre);
      const nuevaCategoria = prompt("Editar categoría:", producto.categoria);
      const nuevoPrecio = prompt("Editar precio:", producto.precio);

      if (nuevoNombre && nuevaCategoria && nuevoPrecio && !isNaN(parseFloat(nuevoPrecio))) {
        productos[index] = {
          nombre: nuevoNombre.trim(),
          categoria: nuevaCategoria.trim(),
          precio: parseFloat(nuevoPrecio)
        };
        guardarProductos();
        alert("✅ Producto actualizado.");
      }
    };

    renderTabla();
