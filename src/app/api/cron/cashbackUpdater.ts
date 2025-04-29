import { subHours } from "date-fns";

// Remova a importação do node-cron, não é mais necessária aqui
// import cron from "node-cron";
import { db } from "@/lib/prisma";

// Renomeie a função para refletir que ela executa a lógica diretamente
const runCashbackExpirationLogic = async () => {
  console.log("⏳ Executando lógica de expiração de cashbacks...");

  const now = subHours(new Date(), 3); // Força UTC-3 para comparação

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
    // Re-throw o erro para que o handler da API possa capturá-lo e retornar 500
    throw error;
  }

  console.log("✅ Lógica de expiração de cashbacks concluída!");
};

export default runCashbackExpirationLogic; // Exporte a função com o novo nome
