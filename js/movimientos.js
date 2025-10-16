// ============================
// MOVIMIENTOS.JS
// ============================

// Variables de paginación
let paginaActual = 1;
const movimientosPorPagina = 10;

// Cargar productos desde localStorage
function cargarProductos() {
  const productosGuardados = JSON.parse(localStorage.getItem("productos")) || [];
  const selectProducto = document.getElementById("producto");

  // Limpiar opciones anteriores
  selectProducto.innerHTML = '<option value="">Seleccione un producto</option>';

  // Rellenar el select
  productosGuardados.forEach(prod => {
    const option = document.createElement("option");
    option.value = prod.nombre;
    option.textContent = prod.nombre;
    selectProducto.appendChild(option);
  });
}

// Guardar movimiento en localStorage
function guardarMovimiento(movimiento) {
  const movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
  movimientos.push(movimiento);
  localStorage.setItem("movimientos", JSON.stringify(movimientos));
}

// Mostrar movimientos en la tabla con paginación
function mostrarMovimientos() {
  const movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
  const tbody = document.querySelector("#tablaMovimientos tbody");
  tbody.innerHTML = "";

  const inicio = (paginaActual - 1) * movimientosPorPagina;
  const fin = inicio + movimientosPorPagina;
  const movimientosPaginados = movimientos.slice(inicio, fin);

  movimientosPaginados.forEach(mov => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${mov.fecha}</td>
      <td>${mov.tipo}</td>
      <td>${mov.producto}</td>
      <td>${mov.cantidad}</td>
    `;
    tbody.appendChild(tr);
  });

  crearPaginacion(movimientos.length);
}

// Crear botones de paginación
function crearPaginacion(totalMovimientos) {
  const totalPaginas = Math.ceil(totalMovimientos / movimientosPorPagina);
  const contenedor = document.getElementById("paginacion");
  contenedor.innerHTML = "";

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.add("btn-pagina");
    if (i === paginaActual) btn.classList.add("active");
    btn.addEventListener("click", () => {
      paginaActual = i;
      mostrarMovimientos();
    });
    contenedor.appendChild(btn);
  }
}

// Limpiar formulario
document.getElementById("btnLimpiar").addEventListener("click", () => {
  document.getElementById("formMovimiento").reset();
});

// Registrar movimiento
document.getElementById("formMovimiento").addEventListener("submit", e => {
  e.preventDefault();

  const tipo = document.getElementById("tipo").value;
  const producto = document.getElementById("producto").value;
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const fecha = document.getElementById("fecha").value;

  if (!producto || !cantidad || cantidad <= 0) {
    Swal.fire({
      title: "❌ Por favor ingresa todos los datos correctamente.",
      icon: "error",
      showConfirmButton: true
    });
    return;
  }

  const nuevoMovimiento = { tipo, producto, cantidad, fecha };
  guardarMovimiento(nuevoMovimiento);

  // Mostrar tabla y reiniciar formulario
  mostrarMovimientos();
  document.getElementById("formMovimiento").reset();

  Swal.fire({
    title: "✅ Movimiento registrado con éxito",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
    scrollbarPadding: false
  });
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  mostrarMovimientos();
});
