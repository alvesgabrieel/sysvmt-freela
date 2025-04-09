import { subHours } from "date-fns";
import cron from "node-cron";

import { db } from "@/lib/prisma";

const runCashbackExpirationJob = () => {
  console.log("⏳ Iniciando job de expiração de cashbacks...");

  cron.schedule("0 0 * * *", async () => {
    console.log("🔄 Executando cron job: Expirando cashbacks vencidos...");

    const now = subHours(new Date(), 3); // Força UTC-3

    try {
      const updatedCashbacks = await db.saleCashback.updateMany({
        where: {
          status: "ACTIVE",
          expiryDate: { lt: now },
        },
        data: { status: "EXPIRED" },
      });

      console.log(`✅ ${updatedCashbacks.count} cashbacks expirados!`);
    } catch (error) {
      console.error("❌ Erro ao expirar cashbacks:", error);
    }
  });

  console.log(
    "✅ Job de cashback agendado para rodar todos os dias à meia-noite!",
  );
};

// Exportamos a função para rodar no backend
export default runCashbackExpirationJob;
