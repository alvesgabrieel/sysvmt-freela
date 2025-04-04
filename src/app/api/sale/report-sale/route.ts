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

    const doc = new PDFDocument({ font: fontPath, margin: 40 });
    const buffers: Uint8Array[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));

    // Cabeçalho
    doc.fontSize(18).text("Relatório de Vendas", { align: "center" });
    doc.moveDown();

    salesData.forEach((sale, index) => {
      doc.fontSize(12).text(`Venda #${index + 1}`, { underline: true });
      doc.text(`ID: ${sale.id}`);
      doc.text(`Cliente: ${sale.client.name}`);
      doc.text(`Operadora: ${sale.tourOperator?.name || "Não informada"}`);
      doc.text(`Check-in: ${sale.checkIn?.slice(0, 10) || "Não informado"}`);
      doc.text(`Check-out: ${sale.checkOut?.slice(0, 10) || "Não informado"}`);
      doc.text(
        `Data da Venda: ${sale.saleDate?.slice(0, 10) || "Não informada"}`,
      );
      doc.text(`Método de Pagamento: ${sale.paymentMethod || "Não informado"}`);
      doc.text(`Total Bruto: R$ ${sale.grossTotal.toFixed(2)}`);
      doc.text(`Descontos: R$ ${sale.totalDiscount.toFixed(2)}`);
      doc.text(`Total Líquido: R$ ${sale.netTotal.toFixed(2)}`);
      doc.text(
        `Comissão da Agência: R$ ${sale.agencyCommissionValue?.toFixed(2)}`,
      );
      doc.text(
        `Comissão do Vendedor: R$ ${sale.sallerCommissionValue?.toFixed(2)}`,
      );
      doc.moveDown();

      // Adiciona nova página se estiver perto do fim
      if (doc.y > 700) doc.addPage();
    });

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
