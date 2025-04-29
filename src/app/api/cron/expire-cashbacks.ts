import { NextApiRequest, NextApiResponse } from "next";

// Importe a função com o nome atualizado
import runCashbackExpirationLogic from "./cashbackUpdater";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Verifica um token de segurança
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Chame a função que executa a lógica diretamente
    await runCashbackExpirationLogic();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Erro no cron job (handler):", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
