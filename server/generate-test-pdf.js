import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildSubmitPayload } from "../shared/fields.js";
import { buildSummaryPdf } from "./pdf.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "output");

const sample = {
  NOME_CONTRATANTE: "Mariana Alves Costa",
  CPF: "123.456.789-00",
  ENDERECO: "Rua das Palmeiras",
  NUMERO_ENDERECO: "210",
  COMPLEMENTO_ENDERECO: "Apto 42",
  CIDADE: "São Paulo",
  ESTADO: "SP",
  CEP: "05433-000",
  EMAIL: "mariana@email.com",
  TELEFONE: "(11) 98888-1234",
  NATUREZA: "Casamento",
  DATA_EVENTO: "14/11/2026",
  LOCAL_EVENTO: "Casa Itaim",
  NUM_CONVIDADOS_RAW: "80",
  HORARIO_INICIO: "16:00",
  TEMPO_OPENBAR: "6 horas",
  BASES_LINHA: "Vodka, cachaça e saquê",
  BASE_TIPO: "Nacional",
  openBarDrinks: ["Moscow Mule", "Berry Mule", "À definir"],
  welcomeDrinks: ["Welcome Spritz — Aperol Spritz"],
  shots: ["Velvet Gold"],
  COPOS_VIDRO: "Sim",
  EQUIPE_ADD: "Não",
  ESTRUTURA_PERS: "Não",
  TORRE_ESPUMANTE: "Não",
  REGUA_SHOTS: "Sim",
};

const { fields } = buildSubmitPayload(sample);
const pdf = await buildSummaryPdf(fields);
fs.mkdirSync(outDir, { recursive: true });
const target = path.join(outDir, "teste-ficha.pdf");
fs.writeFileSync(target, pdf);
console.log("PDF gerado:", target);
