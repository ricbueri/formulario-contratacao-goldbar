import nodemailer from "nodemailer";
import { summarizeForDisplay } from "../shared/fields.js";

export function emailIsConfigured() {
  if (process.env.RESEND_API_KEY) return true;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return Boolean(host && user && pass);
}

function createTransport() {
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
    });
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendNotificationEmail({ fields, pdfBuffer, fileName }) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) throw new Error("NOTIFY_EMAIL não configurado.");

  const transport = createTransport();
  if (!transport) {
    throw new Error(
      "Configure SMTP_HOST, SMTP_USER e SMTP_PASS — ou RESEND_API_KEY — para enviar e-mails."
    );
  }

  const s = summarizeForDisplay(fields);
  const from = process.env.MAIL_FROM || "Gold Bar Formulário <onboarding@resend.dev>";

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

  await transport.sendMail({
    from,
    to,
    replyTo: fields.EMAIL || undefined,
    subject: `Gold Bar — Ficha ${s.contratante || "cliente"} — ${s.data || ""}`.trim(),
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
