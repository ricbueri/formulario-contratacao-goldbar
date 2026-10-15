import { processFormSubmission } from "../server/submitForm.js";

export const config = {
  maxDuration: 15,
};

function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) return JSON.parse(req.body);
  return {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const result = await processFormSubmission(readJsonBody(req));
    return res.status(result.status).json(result.json);
  } catch (error) {
    console.error("[submit]", error.message);
    return res.status(500).json({
      error: error.message || "Não foi possível enviar. Tente novamente em instantes.",
    });
  }
}
