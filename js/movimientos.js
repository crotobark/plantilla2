// ============================
// MOVIMIENTOS.JS
// ============================

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

// Variables de paginación
let paginaActual = 1;
const movimientosPorPagina = 10;

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

// Registrar movimiento con validación de stock
document.getElementById("formMovimiento").addEventListener("submit", e => {
  e.preventDefault();

  const tipo = document.getElementById("tipo").value;
  const producto = document.getElementById("producto").value;
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const fecha = document.getElementById("fecha").value;

  if (!producto || !cantidad || cantidad <= 0) {
    Swal.fire({
      title: "Por favor ingresa todos los datos correctamente.",
      icon: "error",
      showConfirmButton: true
    });
    return;
  }

  // ==========================
  // VALIDAR STOCK DISPONIBLE
  // ==========================
  const movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];

  let entradas = 0;
  let salidas = 0;

  movimientos.forEach(m => {
    if (m.producto === producto) {
      if (m.tipo === "entrada") entradas += m.cantidad;
      else if (m.tipo === "salida") salidas += m.cantidad;
    }
  });

  const stockDisponible = entradas - salidas;

  if (tipo === "salida" && cantidad > stockDisponible) {
    Swal.fire({
      title: "Stock insuficiente",
      text: `No puedes registrar una salida de ${cantidad} unidades. 
El stock disponible para "${producto}" es de ${stockDisponible}.`,
      icon: "warning",
      confirmButtonText: "Entendido"
    });
    return; // No guarda el movimiento
  }

  // ==========================
  // GUARDAR EL NUEVO MOVIMIENTO
  // ==========================
  const nuevoMovimiento = { tipo, producto, cantidad, fecha };
  guardarMovimiento(nuevoMovimiento);

  // Mostrar tabla y reiniciar formulario
  mostrarMovimientos();
  document.getElementById("formMovimiento").reset();

  Swal.fire({
    title: "Movimiento registrado con éxito",
    icon: "success",
    timer: 1500,
    showConfirmButton: false
  });
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  mostrarMovimientos();
});

// Limitar la fecha para que no sea mayor al día actual
document.addEventListener("DOMContentLoaded", () => {
  const inputFecha = document.getElementById("fecha");

  // Obtener la fecha actual en formato YYYY-MM-DD
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  const fechaActual = `${año}-${mes}-${dia}`;

  // Asignar la fecha máxima
  inputFecha.max = fechaActual;
});
