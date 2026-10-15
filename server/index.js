import "dotenv/config";
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import { processFormSubmission } from "./submitForm.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "output");
const PORT = Number(process.env.PORT || 3002);
const isProd = process.env.NODE_ENV === "production";

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: "256kb" }));

app.use(
  "/api/submit",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." },
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/submit", async (req, res) => {
  try {
    const result = await processFormSubmission(req.body);
    res.status(result.status).json(result.json);
  } catch (error) {
    console.error("[submit]", error.message);
    res.status(500).json({
      error: error.message || "Não foi possível enviar. Tente novamente em instantes.",
    });
  }
});

if (isProd) {
  const dist = path.join(__dirname, "../dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.use((err, _req, res, next) => {
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ error: "Dados inválidos. Atualize a página e tente de novo." });
  }
  return next(err);
});

const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`API Gold Bar formulário em http://127.0.0.1:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `\nPorta ${PORT} já está em uso (outro "npm run dev" aberto?).\n` +
        `  PowerShell: Get-NetTCPConnection -LocalPort ${PORT} | Select OwningProcess\n` +
        `  Depois: taskkill /PID <número> /F\n` +
        `  Ou rode: npm run dev:free\n`
    );
    process.exit(1);
  }
  throw error;
});
