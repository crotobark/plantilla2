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
