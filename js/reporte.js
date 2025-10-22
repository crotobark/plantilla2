// ============================
// Reporte de Inventario
// ============================

// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("loggedIn");
  window.location.href = "login.html";
});

// Leer datos de movimientos e inventario
const movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
const inventario = JSON.parse(localStorage.getItem("inventario")) || {};
const tablaBody = document.querySelector("#tablaReportes tbody");

// Variables acumuladoras
let totalEntradas = 0;
let totalSalidas = 0;

// Objeto temporal para consolidar los datos
const resumen = {};

movimientos.forEach(m => {
  if (!resumen[m.producto]) {
    resumen[m.producto] = { entradas: 0, salidas: 0, stock: 0 };
  }

  if (m.tipo === "entrada") {
    resumen[m.producto].entradas += m.cantidad;
    totalEntradas += m.cantidad;
  } else {
    resumen[m.producto].salidas += m.cantidad;
    totalSalidas += m.cantidad;
  }
});

// Calcular stock actual
for (const producto in resumen) {
  resumen[producto].stock =
    (inventario[producto] !== undefined) ? inventario[producto] : resumen[producto].entradas - resumen[producto].salidas;
}

// Mostrar datos en tabla
Object.keys(resumen).forEach(producto => {
  const { entradas, salidas, stock } = resumen[producto];
  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td>${producto}</td>
    <td>${entradas}</td>
    <td>${salidas}</td>
    <td>${stock}</td>
  `;
  tablaBody.appendChild(fila);
});

// Totales generales
document.getElementById("totalEntradas").textContent = totalEntradas;
document.getElementById("totalSalidas").textContent = totalSalidas;
document.getElementById("totalStock").textContent = Object.values(inventario).reduce((a, b) => a + b, 0);

// ============================
// Exportar a Excel
// ============================
document.getElementById("btnExcel").addEventListener("click", () => {
  const wb = XLSX.utils.book_new();
  const datos = [["Producto", "Entradas", "Salidas", "Stock Actual"]];

  Object.keys(resumen).forEach(p => {
    const { entradas, salidas, stock } = resumen[p];
    datos.push([p, entradas, salidas, stock]);
  });

  const ws = XLSX.utils.aoa_to_sheet(datos);
  XLSX.utils.book_append_sheet(wb, ws, "Reporte Inventario");
  XLSX.writeFile(wb, "Reporte_Inventario.xlsx");
});

// ============================
// Exportar a PDF
// ============================
document.getElementById("btnPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Reporte General de Inventario", 14, 15);

  let y = 30;
  doc.setFontSize(10);
  doc.text("Producto", 14, y);
  doc.text("Entradas", 70, y);
  doc.text("Salidas", 110, y);
  doc.text("Stock", 160, y);
  y += 8;

  Object.keys(resumen).forEach(p => {
    const { entradas, salidas, stock } = resumen[p];
    doc.text(p, 14, y);
    doc.text(String(entradas), 70, y);
    doc.text(String(salidas), 110, y);
    doc.text(String(stock), 160, y);
    y += 8;
  });

  doc.save("Reporte_Inventario.pdf");
});

// ============================
// GRÁFICA DE PASTEL (Chart.js)
// ============================

// Obtener los valores actuales de los totales
const totalEntradasVal = totalEntradas;
const totalSalidasVal = totalSalidas;
const totalStockVal = Object.values(inventario).reduce((a, b) => a + b, 0);

// Crear la gráfica
const ctx = document.getElementById("graficaResumen").getContext("2d");

const grafica = new Chart(ctx, {
  type: "pie",
  data: {
    labels: ["Entradas", "Salidas", "Stock Actual"],
    datasets: [
      {
        label: "Resumen de Inventario",
        data: [totalEntradasVal, totalSalidasVal, totalStockVal],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",  // Azul - Entradas
          "rgba(255, 99, 132, 0.7)",  // Rojo - Salidas
          "rgba(75, 192, 192, 0.7)"   // Verde - Stock
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)"
        ],
        borderWidth: 2
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#333",
          font: { size: 14 }
        }
      },
      title: {
        display: true,
        text: "Distribución general del inventario",
        color: "#111",
        font: { size: 16, weight: "bold" }
      }
    }
  }
});

// =============================
// PAGINACIÓN DE REPORTES
// =============================

let paginaActualReportes = 1;
const filasPorPagina = 10;
let datosReportes = []; // 👈 se llenará con los datos actuales

function renderTablaReportes() {
  const tbody = document.querySelector("#tablaReportes tbody");
  tbody.innerHTML = "";

  if (datosReportes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No hay datos para mostrar</td></tr>`;
    return;
  }

  const inicio = (paginaActualReportes - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  const pagina = datosReportes.slice(inicio, fin);

  pagina.forEach(item => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.producto}</td>
      <td>${item.totalEntradas}</td>
      <td>${item.totalSalidas}</td>
      <td>${item.stockActual}</td>
    `;
    tbody.appendChild(fila);
  });

  crearPaginacionReportes(datosReportes.length);
}

function crearPaginacionReportes(total) {
  const totalPaginas = Math.ceil(total / filasPorPagina);
  const contenedor = document.getElementById("paginacionReportes");
  contenedor.innerHTML = "";

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.add("btn-pagina");
    if (i === paginaActualReportes) btn.classList.add("active");

    btn.addEventListener("click", () => {
      paginaActualReportes = i;
      renderTablaReportes();
    });

    contenedor.appendChild(btn);
  }
}

// =============================
// FUNCIÓN ORIGINAL QUE GENERA DATOS
// =============================
function generarReporte() {
  const movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];

  const resumen = {};

  movimientos.forEach(m => {
    if (!resumen[m.producto]) resumen[m.producto] = { entradas: 0, salidas: 0 };
    if (m.tipo === "entrada") resumen[m.producto].entradas += m.cantidad;
    else resumen[m.producto].salidas += m.cantidad;
  });

  datosReportes = Object.entries(resumen).map(([producto, data]) => ({
    producto,
    totalEntradas: data.entradas,
    totalSalidas: data.salidas,
    stockActual: data.entradas - data.salidas
  }));

  renderTablaReportes(); // 👈 se llama la paginación aquí
}

document.addEventListener("DOMContentLoaded", generarReporte);
