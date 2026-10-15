import nodemailer from "nodemailer";
import { summarizeForDisplay } from "../shared/fields.js";

function envValue(name) {
  return String(process.env[name] || "")
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

export function emailIsConfigured() {
  if (envValue("RESEND_API_KEY")) return true;
  return Boolean(envValue("SMTP_HOST") && envValue("SMTP_USER") && envValue("SMTP_PASS"));
}

function createTransport() {
  const host = envValue("SMTP_HOST");
  const port = Number(envValue("SMTP_PORT") || 587);
  const user = envValue("SMTP_USER");
  const pass = envValue("SMTP_PASS");
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function explainResendError(message) {
  if (/only send testing emails/i.test(message)) {
    return "A Resend ainda está em modo de teste e só entrega para o e-mail da conta (ricardobueri@gmail.com). Deixe NOTIFY_EMAIL com esse endereço.";
  }
  return message;
}

async function sendWithResend({ from, to, replyTo, subject, text, fileName, pdfBuffer }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${envValue("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      text,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer.toString("base64"),
        },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      (typeof data.message === "string" && data.message) ||
      (typeof data.error === "string" && data.error) ||
      data.error?.message ||
      "A Resend recusou o envio do e-mail.";
    throw new Error(explainResendError(String(message)));
  }
}

export async function sendNotificationEmail({ fields, pdfBuffer, fileName }) {
  const to = envValue("NOTIFY_EMAIL");
  if (!to) throw new Error("NOTIFY_EMAIL não configurado.");

  const s = summarizeForDisplay(fields);
  const from = envValue("MAIL_FROM") || "Gold Bar <onboarding@resend.dev>";

  const text = [
    "Nova ficha de evento — Gold Bar",
    "",
    `Contratante: ${s.contratante}`,
    `Evento: ${s.evento} — ${s.data}`,
    `Local: ${s.local}`,
    `Contato: ${s.contato}`,
    "",
    `Open bar: ${s.drinks}`,
    s.welcome ? `Welcome: ${s.welcome}` : null,
    s.shots ? `Shots: ${s.shots}` : null,
    "",
    "JSON (importação futura):",
    JSON.stringify(fields, null, 2),
  ]
    .filter(Boolean)
    .join("\n");

  const subject = `Gold Bar — Ficha ${s.contratante || "cliente"} — ${s.data || ""}`.trim();
  const replyTo = fields.EMAIL || undefined;

  if (envValue("RESEND_API_KEY")) {
    await sendWithResend({ from, to, replyTo, subject, text, fileName, pdfBuffer });
    return;
  }

  const transport = createTransport();
  if (!transport) {
    throw new Error("Configure RESEND_API_KEY para enviar o e-mail.");
  }

  await transport.sendMail({
    from,
    to,
    replyTo,
    subject,
    text,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}
