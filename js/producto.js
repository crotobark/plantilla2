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

// =============================
// AGREGAR PRODUCTO
// =============================
form.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  const categoria = document.getElementById('categoria').value.trim();
  const precio = parseFloat(document.getElementById('precio').value);

  // Validar campos vacíos
  if (!nombre || !categoria || isNaN(precio)) {
    Swal.fire({
      title: "Error",
      text: "Por favor completa todos los campos correctamente.",
      icon: "error",
      scrollbarPadding: false
    });
    return;
  }

  // Validar duplicado (mismo nombre, categoría y precio)
  const existe = productos.some(p =>
    p.nombre.toLowerCase() === nombre.toLowerCase() &&
    p.categoria.toLowerCase() === categoria.toLowerCase() &&
    p.precio === precio
  );

  if (existe) {
    Swal.fire({
      title: "⚠️ Producto duplicado",
      text: "Este producto ya fue registrado anteriormente.",
      icon: "warning",
      scrollbarPadding: false
    });
    return;
  }

  // Si no existe, se agrega
  productos.push({ nombre, categoria, precio });
  guardarProductos();
  form.reset();

  Swal.fire({
    title: "✅ Producto agregado con éxito",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
    scrollbarPadding: false
  });
});

renderTabla();


// =============================
// ELIMINAR PRODUCTO (SweetAlert2)
// =============================
window.eliminarProducto = index => {
  Swal.fire({
    title: "¿Seguro que deseas eliminar este producto?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    scrollbarPadding: false
  }).then(result => {
    if (result.isConfirmed) {
      productos.splice(index, 1);
      guardarProductos();
      Swal.fire({
        title: "Eliminado",
        text: "El producto fue eliminado correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        scrollbarPadding: false
      });
    }
  });
};

// =============================
// EDITAR PRODUCTO (SweetAlert2 con inputs)
// =============================
window.editarProducto = index => {
  const producto = productos[index];

  Swal.fire({
    title: "Editar producto",
    html: `
      <input id="swal-nombre" class="swal2-input" value="${producto.nombre}" placeholder="Nombre">
      <input id="swal-categoria" class="swal2-input" value="${producto.categoria}" placeholder="Categoría">
      <input id="swal-precio" class="swal2-input" type="number" value="${producto.precio}" placeholder="Precio">
    `,
    confirmButtonText: "Guardar cambios",
    showCancelButton: true,
    scrollbarPadding: false,
    preConfirm: () => {
      const nuevoNombre = document.getElementById('swal-nombre').value.trim();
      const nuevaCategoria = document.getElementById('swal-categoria').value.trim();
      const nuevoPrecio = parseFloat(document.getElementById('swal-precio').value);

      if (!nuevoNombre || !nuevaCategoria || isNaN(nuevoPrecio)) {
        Swal.showValidationMessage("Por favor completa todos los campos correctamente.");
        return false;
      }

      return { nuevoNombre, nuevaCategoria, nuevoPrecio };
    }
  }).then(result => {
    if (result.isConfirmed) {
      const { nuevoNombre, nuevaCategoria, nuevoPrecio } = result.value;
      productos[index] = {
        nombre: nuevoNombre,
        categoria: nuevaCategoria,
        precio: nuevoPrecio
      };
      guardarProductos();
      Swal.fire({
        title: "✅ Producto actualizado",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        scrollbarPadding: false
      });
    }
  });
};

renderTabla();
