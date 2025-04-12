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

// ============= FUNÇÕES DE FORMATAÇÃO =============
const formatarDataBR = (dataString: string | null | undefined): string => {
  if (!dataString) return "N/A";
  try {
    // Ajuste para fuso horário
    const data = new Date(dataString);
    const dataAjustada = new Date(
      data.getTime() + data.getTimezoneOffset() * 60000,
    );
    return dataAjustada.toLocaleDateString("pt-BR");
  } catch {
    return "N/A";
  }
};

const formatarDataFiltroBR = (
  dataString: string | number | null | undefined,
): string => {
  if (dataString === null || dataString === undefined)
    return "Não especificado";

  const dataStr = dataString.toString();

  // Conversão direta para datas no formato YYYY-MM-DD
  if (dataStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  try {
    return formatarDataBR(dataStr);
  } catch {
    return "Não especificado";
  }
};

const formatarPrecoBR = (valor: number): string => {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatarTextoFiltro = (
  texto: string | number | null | undefined,
): string => {
  if (texto === null || texto === undefined) return "Não especificado";
  return texto.toString().trim();
};

// ============= GERADOR DE PDF =============
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const salesData: Sale[] = body.sales;
    const filters: Record<string, string | number | null | undefined> =
      body.filters || {};

    if (!Array.isArray(salesData)) {
      return NextResponse.json(
        { error: "Dados de vendas inválidos." },
        { status: 400 },
      );
    }

    const fontPath = join(
      process.cwd(),
      "public",
      "fonts",
      "Roboto_Condensed-Regular.ttf",
    );

    const doc = new PDFDocument({
      font: fontPath,
      margin: 30,
      size: "A4",
    });

    const buffers: Uint8Array[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));

    // ============= CABEÇALHO =============
    doc
      .fontSize(18)
      .text("RELATÓRIO DE VENDAS", {
        align: "center",
        underline: true,
      })
      .moveDown(1);

    // ============= FILTROS APLICADOS =============
    doc
      .fontSize(12)
      .text("Filtros aplicados:", { underline: true })
      .moveDown(0.5);

    const filtrosParaExibir = [
      {
        label: "Período da venda",
        value:
          filters.saleDateFrom && filters.saleDateTo
            ? `${filters.saleDateFrom} - ${filters.saleDateTo}`
            : null,
      },
      {
        label: "Período do check-in",
        value:
          filters.checkInFrom && filters.checkInTo
            ? `${filters.checkInFrom} - ${filters.checkInTo}`
            : null,
      },
      {
        label: "Período do check-out",
        value:
          filters.checkOutFrom && filters.checkOutTo
            ? `${filters.checkOutFrom} - ${filters.checkOutTo}`
            : null,
      },
      { label: "Operadora", value: filters.tourOperator },
      { label: "Ingresso", value: filters.ticket },
      { label: "Hospedagem", value: filters.hosting },
    ];

    filtrosParaExibir.forEach((filtro) => {
      let valorFormatado;

      if (
        filtro.value &&
        typeof filtro.value === "string" &&
        filtro.value.includes("-")
      ) {
        // Formata intervalos de data
        const [dataInicio, dataFim] = filtro.value.split(" - ");
        valorFormatado = `${formatarDataFiltroBR(dataInicio)} - ${formatarDataFiltroBR(dataFim)}`;
      } else {
        valorFormatado = formatarTextoFiltro(filtro.value);
      }

      doc.fontSize(10).text(`• ${filtro.label}: ${valorFormatado}`);
    });

    doc.moveDown(2);

    // ============= TABELA DE VENDAS =============
    const tableTop = doc.y;
    const marginTable = 30;
    const rowHeight = 22;
    const pageWidth = doc.page.width - marginTable * 2;

    // Configuração das colunas
    const columns = [
      { header: "ID", width: 30 },
      { header: "Cliente", width: 80 },
      { header: "Operadora", width: 60 },
      { header: "Check-in", width: 60 },
      { header: "Check-out", width: 60 },
      { header: "Total", width: 60 },
      { header: "Com. Ag.", width: 60 },
      { header: "Com. Vend.", width: 60 },
    ];

    // Cabeçalho da tabela
    doc
      .fillColor("#3498db")
      .rect(marginTable, tableTop, pageWidth, rowHeight)
      .fill();

    let x = marginTable;
    columns.forEach((column) => {
      doc
        .fontSize(9)
        .fillColor("#FFFFFF")
        .text(column.header, x + 3, tableTop + 6, {
          width: column.width,
          align: "left",
        });
      x += column.width;
    });

    // Linhas da tabela
    let y = tableTop + rowHeight;
    salesData.forEach((sale, index) => {
      if (y + rowHeight > doc.page.height - 40) {
        doc.addPage();
        y = 40;

        // Redesenha o cabeçalho em nova página
        let xHeader = marginTable;
        doc
          .fillColor("#3498db")
          .rect(marginTable, y, pageWidth, rowHeight)
          .fill();

        columns.forEach((column) => {
          doc
            .fontSize(9)
            .fillColor("#FFFFFF")
            .text(column.header, xHeader + 3, y + 6, {
              width: column.width,
              align: "left",
            });
          xHeader += column.width;
        });

        y += rowHeight;
      }

      // Cor de fundo alternada
      doc
        .fillColor(index % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
        .rect(marginTable, y, pageWidth, rowHeight)
        .fill();

      // Conteúdo das células
      x = marginTable;
      columns.forEach((column, colIndex) => {
        let cellText = "";
        switch (colIndex) {
          case 0:
            cellText = sale.id.toString();
            break;
          case 1:
            cellText =
              sale.client.name.substring(0, 15) +
              (sale.client.name.length > 15 ? "..." : "");
            break;
          case 2:
            cellText = sale.tourOperator?.name?.substring(0, 10) || "-";
            break;
          case 3:
            cellText = formatarDataBR(sale.checkIn);
            break;
          case 4:
            cellText = formatarDataBR(sale.checkOut);
            break;
          case 5:
            cellText = `R$ ${formatarPrecoBR(sale.netTotal)}`;
            break;
          case 6:
            cellText = `R$ ${formatarPrecoBR(sale.agencyCommissionValue)}`;
            break;
          case 7:
            cellText = `R$ ${formatarPrecoBR(sale.sallerCommissionValue)}`;
            break;
        }

        doc
          .fontSize(8)
          .fillColor("#000000")
          .text(cellText, x + 3, y + 6, {
            width: column.width - 6,
            align: "left",
            ellipsis: true,
          });

        x += column.width;
      });

      y += rowHeight;
    });

    // ============= RODAPÉ =============
    doc
      .fontSize(10)
      .text(
        `Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        { align: "right" },
      );

    // Finaliza o PDF
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.end();
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=relatorio-vendas.pdf",
      },
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json({ error: "Erro ao gerar PDF." }, { status: 500 });
  }
}
