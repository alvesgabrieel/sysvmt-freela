import { NextResponse } from "next/server";
import { join } from "path";
import PDFDocument from "pdfkit";

interface Sale {
  id: number;
  idInTourOperator: string | null;
  saleDate: string | null;
  paymentMethod: string | null;
  checkIn: string;
  checkOut: string;
  grossTotal: number;
  totalDiscount: number;
  netTotal: number;
  agencyCommissionValue: number;
  sallerCommissionValue: number;
  client: { name: string };
  tourOperator?: { name: string };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const salesData: Sale[] = body.sales;

    if (!Array.isArray(salesData)) {
      return NextResponse.json(
        {
          error:
            "O corpo da requisição deve conter uma lista de vendas em 'sales'.",
        },
        { status: 400 },
      );
    }

    const fontPath = join(
      process.cwd(),
      "public",
      "fonts",
      "Roboto_Condensed-Regular.ttf",
    );

    // Aumentei a margem direita para 50px
    const doc = new PDFDocument({
      font: fontPath,
      margin: 40,
    });
    const buffers: Uint8Array[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));

    // Cabeçalho centralizado com margem
    doc.fontSize(18).text("Relatório de Vendas", {
      align: "center",
      width: doc.page.width - 100, // Usando pageWidth com margens
    });
    doc.moveDown();

    // Configurações da tabela COM MARGENS
    const tableTop = 100;
    const margin = 40;
    const rightMargin = 50; // Margem direita explícita
    const pageWidth = doc.page.width - margin - rightMargin; // CORRIGIDO
    const cellPadding = 8;
    const rowHeight = 30;

    // Definição das colunas (com largura total ajustada)
    const columns = [
      { header: "ID", width: 40 },
      { header: "Cliente", width: 120 },
      { header: "Operadora", width: 100 },
      { header: "Check-in", width: 80 },
      { header: "Check-out", width: 80 },
      { header: "Pagamento", width: 90 },
      { header: "Total", width: 70 },
    ];

    // Verificação da largura total
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
    if (totalWidth > pageWidth) {
      // Ajuste proporcional se ultrapassar
      const ratio = pageWidth / totalWidth;
      columns.forEach((col) => (col.width *= ratio));
    }

    // Função para desenhar células COM MARGEM DIREITA
    const drawCell = (
      text: string,
      x: number,
      y: number,
      width: number,
      isHeader = false,
    ) => {
      doc
        .fontSize(10)
        .fillColor(isHeader ? "#FFFFFF" : "#000000")
        .text(text, x + cellPadding, y + cellPadding, {
          width: width - 2 * cellPadding,
          align: "left",
          lineBreak: false,
        });
    };

    // Desenhar cabeçalho da tabela COM MARGEM DIREITA
    let x = margin;
    doc.fillColor("#3498db");
    columns.forEach((column) => {
      // Limite direito explícito
      if (x + column.width > doc.page.width - rightMargin) {
        column.width = doc.page.width - rightMargin - x;
      }

      doc
        .rect(x, tableTop, column.width, rowHeight)
        .fillAndStroke("#3498db", "#3498db");
      drawCell(column.header, x, tableTop, column.width, true);
      x += column.width;
    });

    // Preencher dados das vendas COM CONTROLE DE MARGEM
    let y = tableTop + rowHeight;
    salesData.forEach((sale, index) => {
      // Quebra de página com margem inferior de 100px
      if (y + rowHeight > doc.page.height - 100) {
        doc.addPage();
        y = 40;

        // Redesenhar cabeçalho
        x = margin;
        doc.fillColor("#3498db");
        columns.forEach((column) => {
          if (x + column.width > doc.page.width - rightMargin) {
            column.width = doc.page.width - rightMargin - x;
          }
          doc
            .rect(x, y, column.width, rowHeight)
            .fillAndStroke("#3498db", "#3498db");
          drawCell(column.header, x, y, column.width, true);
          x += column.width;
        });
        y += rowHeight;
      }

      // Desenhar linha de dados
      x = margin;
      columns.forEach((column, colIndex) => {
        // Garantir que não ultrapasse a margem direita
        const cellWidth = Math.min(
          column.width,
          doc.page.width - rightMargin - x,
        );

        doc
          .fillColor(index % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
          .rect(x, y, cellWidth, rowHeight)
          .fillAndStroke("#FFFFFF", "#EEEEEE");

        let cellText = "";
        switch (colIndex) {
          case 0:
            cellText = sale.id.toString();
            break;
          case 1:
            cellText = sale.client.name;
            break;
          case 2:
            cellText = sale.tourOperator?.name || "N/A";
            break;
          case 3:
            cellText = sale.checkIn?.slice(0, 10) || "N/A";
            break;
          case 4:
            cellText = sale.checkOut?.slice(0, 10) || "N/A";
            break;
          case 5:
            cellText = sale.paymentMethod || "N/A";
            break;
          case 6:
            cellText = `R$ ${sale.netTotal.toFixed(2)}`;
            break;
        }

        drawCell(cellText, x, y, cellWidth);
        x += cellWidth;
      });

      y += rowHeight;
    });

    // Espaçamento final ajustado (50px da margem inferior)
    const finalY = Math.min(y + 30, doc.page.height - 50);

    // Data e hora alinhada à esquerda COM MARGEM
    const now = new Date();
    doc
      .fontSize(10)
      .fillColor("#000000")
      .text(
        `Relatório gerado em: ${now.toLocaleDateString()} às ${now.toLocaleTimeString()}`,
        margin,
        finalY,
        {
          width: pageWidth,
          align: "left",
        },
      );

    const pdfBuffer: Uint8Array = await new Promise((resolve) => {
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });
      doc.end();
    });

    return new NextResponse(
      new Blob([pdfBuffer], { type: "application/pdf" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline; filename=relatorio.pdf",
        },
      },
    );
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json({ error: "Erro ao gerar PDF." }, { status: 500 });
  }
}
