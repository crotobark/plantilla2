    // Protección de sesión
    if (!sessionStorage.getItem("loggedIn")) {
      window.location.href = "login.html";
    }

    document.getElementById("logoutBtn").addEventListener("click", () => {
      sessionStorage.removeItem("loggedIn");
      window.location.href = "login.html";
    });

    const entradas = JSON.parse(localStorage.getItem('entradas') || '[]');
    const salidas = JSON.parse(localStorage.getItem('salidas') || '[]');

    const resumen = {};
    let totalEntradas = 0;
    let totalSalidas = 0;

    entradas.forEach(e => {
      totalEntradas += e.cantidad;
      if (!resumen[e.producto]) resumen[e.producto] = { entradas: 0, salidas: 0 };
      resumen[e.producto].entradas += e.cantidad;
    });

    salidas.forEach(s => {
      totalSalidas += s.cantidad;
      if (!resumen[s.producto]) resumen[s.producto] = { entradas: 0, salidas: 0 };
      resumen[s.producto].salidas += s.cantidad;
    });

    let totalStock = 0;
    const tbody = document.querySelector("#tablaReportes tbody");

    if (Object.keys(resumen).length > 0) {
      tbody.innerHTML = Object.entries(resumen)
        .map(([producto, datos]) => {
          const stock = datos.entradas - datos.salidas;
          totalStock += stock;
          return `
            <tr>
              <td>${producto}</td>
              <td>${datos.entradas}</td>
              <td>${datos.salidas}</td>
              <td>${stock >= 0 ? stock : 0}</td>
            </tr>
          `;
        })
        .join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="4" class="empty">No hay datos para mostrar.</td></tr>`;
    }

    document.getElementById("totalEntradas").textContent = totalEntradas;
    document.getElementById("totalSalidas").textContent = totalSalidas;
    document.getElementById("totalStock").textContent = totalStock;

    // =============================
    // EXPORTAR A EXCEL
    // =============================
    document.getElementById("btnExcel").addEventListener("click", () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Producto,Entradas,Salidas,Stock\n";

      Object.entries(resumen).forEach(([producto, datos]) => {
        const stock = datos.entradas - datos.salidas;
        csvContent += `${producto},${datos.entradas},${datos.salidas},${stock}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "reporte_inventario.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    // =============================
    // EXPORTAR A PDF
    // =============================
    document.getElementById("btnPDF").addEventListener("click", async () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Reporte General de Inventario", 14, 15);
      doc.setFontSize(11);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 25);

      let y = 35;
      doc.text("Producto        Entradas    Salidas    Stock", 14, y);
      y += 5;

      Object.entries(resumen).forEach(([producto, datos]) => {
        const stock = datos.entradas - datos.salidas;
        doc.text(
          `${producto.padEnd(15)} ${String(datos.entradas).padEnd(10)} ${String(datos.salidas).padEnd(10)} ${stock}`,
          14,
          y
        );
        y += 6;
      });

      doc.text(`\nTotal Entradas: ${totalEntradas}`, 14, y + 10);
      doc.text(`Total Salidas: ${totalSalidas}`, 14, y + 16);
      doc.text(`Stock Actual: ${totalStock}`, 14, y + 22);

      doc.save("reporte_inventario.pdf");
    });
  