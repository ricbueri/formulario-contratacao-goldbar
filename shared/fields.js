import { joinDrinkLine } from "./cardapioDrinks.js";
import {
  capitalizeWords,
  composeEndereco,
  formatBaseTipo,
  formatMoneyWithExtenso,
  formatPrazo,
  normalizeHorario,
  parseMoneyBR,
  yesNo,
} from "./formatters.js";

export function composeRuaComNumero({ endereco, numero, complemento } = {}) {
  const rua = String(endereco || "").replace(/\s+/g, " ").trim();
  const num = String(numero || "").replace(/\s+/g, " ").trim();
  const comp = String(complemento || "").replace(/\s+/g, " ").trim();
  const parts = [];
  if (rua) parts.push(rua);
  if (num) parts.push(`nº ${num}`);
  let line = parts.join(", ");
  if (comp) line = line ? `${line} — ${comp}` : comp;
  return line;
}

export const EMPTY_PUBLIC_FIELDS = {
  NOME_CONTRATANTE: "",
  CPF: "",
  ENDERECO: "",
  NUMERO_ENDERECO: "",
  COMPLEMENTO_ENDERECO: "",
  CIDADE: "",
  ESTADO: "",
  CEP: "",
  EMAIL: "",
  TELEFONE: "",
  NATUREZA: "",
  DATA_EVENTO: "",
  LOCAL_EVENTO: "",
  CIDADE_EVENTO: "",
  NUM_CONVIDADOS_RAW: "",
  HORARIO_INICIO: "",
  TEMPO_OPENBAR: "",
  VALOR_TOTAL_RAW: "",
  SINAL_PCT: "",
  SINAL_RESERVA_RAW: "",
  SALDO_REMANESCENTE_RAW: "",
  PRAZO_SALDO_QTD: "",
  PRAZO_SALDO_UNIDADE: "dias",
  DRINKS_LINHA: "",
  BASES_LINHA: "",
  BASE_TIPO: "",
  COPOS_VIDRO: "Não",
  EQUIPE_ADD: "Não",
  ESTRUTURA_PERS: "Não",
  TORRE_ESPUMANTE: "Não",
  REGUA_SHOTS: "Não",
  WELCOME_DRINKS_LINHA: "",
  SHOTS_LINHA: "",
};

/** Monta o payload com chaves do sistema interno + extras opcionais. */
export function buildSubmitPayload(form) {
  const openBarDrinks = (form.openBarDrinks || []).map((d) => String(d).trim()).filter(Boolean);
  const welcome = (form.welcomeDrinks || []).map((d) => String(d).trim()).filter(Boolean);
  const shots = (form.shots || []).map((d) => String(d).trim()).filter(Boolean);

  const fields = {
    ...EMPTY_PUBLIC_FIELDS,
    NOME_CONTRATANTE: form.NOME_CONTRATANTE,
    CPF: form.CPF,
    ENDERECO: composeRuaComNumero({
      endereco: form.ENDERECO,
      numero: form.NUMERO_ENDERECO,
      complemento: form.COMPLEMENTO_ENDERECO,
    }),
    CIDADE: form.CIDADE,
    ESTADO: form.ESTADO,
    CEP: form.CEP,
    EMAIL: form.EMAIL,
    TELEFONE: form.TELEFONE,
    NATUREZA: form.NATUREZA,
    DATA_EVENTO: form.DATA_EVENTO,
    LOCAL_EVENTO: form.LOCAL_EVENTO,
    CIDADE_EVENTO: form.CIDADE_EVENTO || "",
    NUM_CONVIDADOS_RAW: form.NUM_CONVIDADOS_RAW,
    HORARIO_INICIO: normalizeHorario(form.HORARIO_INICIO) || form.HORARIO_INICIO,
    TEMPO_OPENBAR: form.TEMPO_OPENBAR,
    ...eventMoneyFields(form),
    DRINKS_LINHA: joinDrinkLine(openBarDrinks),
    BASES_LINHA: form.BASES_LINHA || "",
    BASE_TIPO: form.BASE_TIPO || "",
    COPOS_VIDRO: form.COPOS_VIDRO,
    EQUIPE_ADD: form.EQUIPE_ADD,
    ESTRUTURA_PERS: form.ESTRUTURA_PERS,
    TORRE_ESPUMANTE: form.TORRE_ESPUMANTE,
    REGUA_SHOTS: shots.length > 0 ? "Sim" : form.REGUA_SHOTS,
    WELCOME_DRINKS_LINHA: joinDrinkLine(welcome),
    SHOTS_LINHA: joinDrinkLine(shots),
  };

  return { fields, openBarDrinks, welcomeDrinks: welcome, shots };
}

function eventMoneyFields(form) {
  const valorTotal = parseMoneyBR(form.VALOR_TOTAL_RAW);
  let sinal = parseMoneyBR(form.SINAL_RESERVA_RAW);
  const pct = parseMoneyBR(form.SINAL_PCT);
  if (pct !== null && valorTotal !== null && pct > 0) {
    sinal = Math.round(((valorTotal * pct) / 100) * 100) / 100;
  }
  const saldo =
    valorTotal !== null && sinal !== null ? Math.round((valorTotal - sinal) * 100) / 100 : null;

  return {
    VALOR_TOTAL_RAW: form.VALOR_TOTAL_RAW || "",
    SINAL_PCT: form.SINAL_PCT || "",
    SINAL_RESERVA_RAW: form.SINAL_RESERVA_RAW || "",
    SALDO_REMANESCENTE_RAW: form.SALDO_REMANESCENTE_RAW || "",
    PRAZO_SALDO_QTD: form.PRAZO_SALDO_QTD || "",
    PRAZO_SALDO_UNIDADE: form.PRAZO_SALDO_UNIDADE || "dias",
    VALOR_TOTAL: valorTotal !== null ? formatMoneyWithExtenso(valorTotal) : "",
    SINAL_RESERVA: sinal !== null ? formatMoneyWithExtenso(sinal) : "",
    SALDO_REMANESCENTE: saldo !== null ? formatMoneyWithExtenso(saldo) : "",
    PRAZO_SALDO: formatPrazo(form.PRAZO_SALDO_QTD, form.PRAZO_SALDO_UNIDADE),
  };
}

export { validatePublicForm } from "./validateForm.js";

export function summarizeForDisplay(fields) {
  return {
    contratante: capitalizeWords(fields.NOME_CONTRATANTE),
    endereco: capitalizeWords(
      composeEndereco({
        endereco: fields.ENDERECO,
        cidade: fields.CIDADE,
        estado: fields.ESTADO,
        cep: fields.CEP,
      })
    ),
    contato: [fields.EMAIL, fields.TELEFONE].filter(Boolean).join(" · "),
    evento: capitalizeWords(fields.NATUREZA),
    data: fields.DATA_EVENTO,
    local: capitalizeWords(fields.LOCAL_EVENTO),
    cidadeEvento: capitalizeWords(fields.CIDADE_EVENTO),
    convidados: fields.NUM_CONVIDADOS_RAW,
    horario: fields.HORARIO_INICIO,
    tempo: fields.TEMPO_OPENBAR,
    valorTotal: fields.VALOR_TOTAL,
    sinal: fields.SINAL_RESERVA,
    saldo: fields.SALDO_REMANESCENTE,
    prazoSaldo: fields.PRAZO_SALDO,
    drinks: fields.DRINKS_LINHA,
    bases: fields.BASES_LINHA,
    baseTipo: formatBaseTipo(fields.BASE_TIPO),
    welcome: fields.WELCOME_DRINKS_LINHA,
    shots: fields.SHOTS_LINHA,
    adicionais: [
      ["Copos de vidro", yesNo(fields.COPOS_VIDRO)],
      ["Equipe adicional", yesNo(fields.EQUIPE_ADD)],
      ["Estrutura personalizada", yesNo(fields.ESTRUTURA_PERS)],
      ["Torre de espumante", yesNo(fields.TORRE_ESPUMANTE)],
      ["Régua de shots", yesNo(fields.REGUA_SHOTS)],
    ],
  };
}
