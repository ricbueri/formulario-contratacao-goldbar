import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildSubmitPayload } from "../shared/fields.js";
import { validatePublicForm } from "../shared/validateForm.js";
import { maskCpfForLog, sanitizeFileName } from "../shared/formatters.js";
import { buildSummaryPdf } from "./pdf.js";
import { emailIsConfigured, sendNotificationEmail } from "./email.js";

const OUTPUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "output");
const hosted = Boolean(process.env.VERCEL || process.env.NETLIFY);

function canSavePdfLocally() {
  return process.env.SAVE_PDF_LOCALLY === "true" && !hosted;
}

export async function processFormSubmission(body) {
  if (body?.company_website) {
    return { status: 200, json: { ok: true } };
  }

  const nested = body?.fields && typeof body.fields === "object" ? body.fields : {};
  const form = {
    ...nested,
    openBarDrinks: (body?.openBarDrinks ?? []).map((d) => String(d).trim()).filter(Boolean),
    welcomeDrinks: body?.welcomeDrinks ?? [],
    shots: body?.shots ?? [],
  };

  const errors = validatePublicForm(form);
  if (errors.length) {
    return { status: 400, json: { error: errors.join(" ") } };
  }

  const { fields } = buildSubmitPayload(form);
  const pdfBuffer = await buildSummaryPdf(fields);
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  const fileName = `Ficha Gold Bar - ${sanitizeFileName(fields.NOME_CONTRATANTE)} - ${stamp}.pdf`;

  let pdfSavedLocally = false;
  if (canSavePdfLocally()) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const outPath = path.join(OUTPUT_DIR, fileName);
    fs.writeFileSync(outPath, pdfBuffer);
    pdfSavedLocally = true;
    console.log(`[submit] PDF salvo em ${outPath}`);
  }

  const skipEmail = !hosted && (process.env.SKIP_EMAIL === "true" || !emailIsConfigured());
  let emailed = false;
  if (skipEmail) {
    console.log("[submit] e-mail não enviado (ambiente local)");
  } else {
    await sendNotificationEmail({ fields, pdfBuffer, fileName });
    emailed = true;
  }

  console.log(
    `[submit] ${fields.NOME_CONTRATANTE} · CPF ${maskCpfForLog(fields.CPF)} · ${fields.DATA_EVENTO}`
  );

  return {
    status: 200,
    json: {
      ok: true,
      emailed,
      pdfSavedLocally,
      pdfFileName: emailed ? undefined : fileName,
      pdfBase64: emailed ? undefined : pdfBuffer.toString("base64"),
    },
  };
}
