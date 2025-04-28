import { NextApiRequest, NextApiResponse } from "next";

import runCashbackExpirationJob from "./cashbackUpdater";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Verifica um token de segurança (opcional, mas recomendado)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await runCashbackExpirationJob(); // Executa sua lógica de expiração
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Erro no cron job:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
