import PDFDocument from "pdfkit";
import { summarizeForDisplay } from "../shared/fields.js";
import { todayExtenso } from "../shared/formatters.js";

function line(doc, label, value, y) {
  if (!value) return y;
  doc.fontSize(10).fillColor("#333").text(`${label}: `, { continued: true });
  doc.fillColor("#111").text(String(value));
  return doc.y + 4;
}

export function buildSummaryPdf(fields) {
  const s = summarizeForDisplay(fields);
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));

  const done = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fontSize(18).fillColor("#8B6914").text("Gold Bar Eventos", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(14).fillColor("#222").text("Ficha do evento (resumo)", { align: "center" });
  doc.moveDown(0.2);
  doc.fontSize(9).fillColor("#666").text(`Recebido em ${todayExtenso()}`, { align: "center" });
  doc.moveDown(1);

  doc.fontSize(12).fillColor("#8B6914").text("Contratante");
  doc.moveDown(0.3);
  line(doc, "Nome", s.contratante);
  line(doc, "CPF/CNPJ", fields.CPF);
  line(doc, "Endereço", s.endereco);
  line(doc, "Contato", s.contato);
  doc.moveDown(0.8);

  doc.fontSize(12).fillColor("#8B6914").text("Evento");
  doc.moveDown(0.3);
  line(doc, "Natureza", s.evento);
  line(doc, "Data", s.data);
  line(doc, "Local", s.local);
  line(doc, "Cidade do evento", s.cidadeEvento);
  line(doc, "Convidados", s.convidados);
  line(doc, "Início open bar", s.horario);
  line(doc, "Duração", s.tempo);
  line(doc, "Valor total", s.valorTotal);
  line(doc, "Sinal de reserva", s.sinal);
  line(doc, "Saldo remanescente", s.saldo);
  line(doc, "Prazo para quitar o saldo", s.prazoSaldo);
  doc.moveDown(0.8);

  doc.fontSize(12).fillColor("#8B6914").text("Pacote — Open bar");
  doc.moveDown(0.3);
  line(doc, "Drinks", s.drinks);
  if (s.bases) line(doc, "Bases", s.bases);
  if (s.baseTipo) line(doc, "Tipo de base", s.baseTipo);
  doc.moveDown(0.8);

  if (s.welcome) {
    doc.fontSize(12).fillColor("#8B6914").text("Welcome drinks (opcional)");
    doc.moveDown(0.3);
    line(doc, "Seleção", s.welcome);
    doc.moveDown(0.8);
  }

  if (s.shots) {
    doc.fontSize(12).fillColor("#8B6914").text("Shots (opcional)");
    doc.moveDown(0.3);
    line(doc, "Seleção", s.shots);
    doc.moveDown(0.8);
  }

  doc.fontSize(12).fillColor("#8B6914").text("Adicionais");
  doc.moveDown(0.3);
  for (const [label, value] of s.adicionais) {
    line(doc, label, value);
  }

  doc.end();
  return done;
}
