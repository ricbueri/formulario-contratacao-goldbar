import extenso from "extenso";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function parseMoneyBR(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
  }
  let text = String(value).trim();
  if (!text) return null;
  if (/^(r\$\s*)?\d+\.\d{1,2}$/i.test(text)) {
    return Math.round(Number(text.replace(/r\$\s*/i, "")) * 100) / 100;
  }
  text = text.replace(/r\$\s*/gi, "").replace(/\s/g, "");
  if (!text) return null;

  if (text.includes(",") && text.includes(".")) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (text.includes(",")) {
    text = text.replace(",", ".");
  } else {
    text = text.replace(/\./g, "");
  }

  const amount = Number(text);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100) / 100;
}

export function formatMoneyBR(amount) {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatMoneyInput(amount) {
  if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) return "";
  return Number(amount).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function moneyToWords(amount) {
  const cents = Math.round(amount * 100);
  const normalized = (cents / 100).toFixed(2).replace(".", ",");
  return extenso(normalized, { mode: "currency", currency: { type: "BRL" } });
}

export function formatMoneyWithExtenso(value) {
  const amount = parseMoneyBR(value);
  if (amount === null) return String(value || "").trim();
  return `${formatMoneyBR(amount)} (${moneyToWords(amount)})`;
}

export function parseInteger(value) {
  if (value === null || value === undefined) return null;
  const match = String(value).replace(/\./g, "").match(/\d+/);
  if (!match) return null;
  return Number(match[0]);
}

export function formatGuests(value) {
  const n = parseInteger(value);
  if (n === null) return String(value || "").trim();
  const words = extenso(n);
  return `${n} (${words}) pessoas`;
}

const PALAVRAS_PEQUENAS = new Set(["de", "da", "do", "das", "dos", "e", "em", "no", "na", "nos", "nas"]);

export function capitalizeWords(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  let first = true;
  return text.replace(/\p{L}[\p{L}'’]*/gu, (word) => {
    const isFirst = first;
    first = false;
    const lower = word.toLowerCase();
    if (!isFirst && PALAVRAS_PEQUENAS.has(lower)) return lower;
    const isAllUpper = word === word.toUpperCase();
    if (isAllUpper && word.length <= 3 && word.length > 1) return word;
    const hasInnerUpper = /\p{Ll}.*\p{Lu}|\p{Lu}.*\p{Lu}/u.test(word.slice(1)) && !isAllUpper;
    if (hasInnerUpper) return word.charAt(0).toUpperCase() + word.slice(1);
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

export function formatDurationHours(value) {
  const text = String(value || "").trim();
  if (!text || /\(.+\)/.test(text)) return text;
  const m = text.match(/^(\d{1,3})\s*(?:(h|hs|hr|hrs|horas?)(?![\p{L}]))?\s*(.*)$/iu);
  if (!m) return text;
  const [, digits, unit, rest] = m;
  if (!unit && rest) return text;
  if (/^\d/.test(rest)) return text;
  const n = Number(digits);
  return `${n} (${extenso(n)}) ${n === 1 ? "hora" : "horas"}${rest ? ` ${rest}` : ""}`;
}

export function formatPrazo(quantidade, unidade) {
  const parsed = parseInteger(quantidade);
  const n = parsed && parsed > 0 ? parsed : 7;
  const meses = parsed && parsed > 0 && /mes/i.test(String(unidade || ""));
  const palavra = meses ? (n === 1 ? "mês" : "meses") : n === 1 ? "dia" : "dias";
  return `${String(n).padStart(2, "0")} (${extenso(n)}) ${palavra}`;
}

export function todayExtenso(date = new Date()) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);

  const day = parts.find((p) => p.type === "day")?.value;
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const year = parts.find((p) => p.type === "year")?.value;
  return `${day} de ${MESES[month - 1]} de ${year}`;
}

export function yesNo(value) {
  const text = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!text) return "Não";
  if (/^(nao|n|no|0|-)$/.test(text)) return "Não";
  if (/(nao|sem |n\/a|nao incluso)/.test(text) && !/^sim/.test(text)) {
    if (/nao/.test(text) || /sem /.test(text)) return "Não";
  }
  if (/^(sim|s|yes|1|x|incluso|incluida|incluido)$/.test(text)) return "Sim";
  if (/\bsim\b/.test(text) || /\binclus/.test(text)) return "Sim";
  if (/\bnao\b/.test(text)) return "Não";
  return "Não";
}

export function sanitizeFileName(name) {
  const clean = String(name || "Cliente")
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return clean || "Cliente";
}

export function composeEndereco({ endereco, cidade, estado, cep } = {}) {
  const rua = String(endereco || "").replace(/\s+/g, " ").trim();
  const city = String(cidade || "").replace(/\s+/g, " ").trim();
  const uf = String(estado || "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
  const zip = String(cep || "").replace(/\s+/g, " ").trim();

  const parts = [];
  if (rua) parts.push(rua);
  if (city && uf) parts.push(`${city}/${uf}`);
  else if (city) parts.push(city);
  else if (uf) parts.push(uf);
  if (zip) parts.push(`CEP ${zip}`);
  return parts.join(", ");
}

export function formatBaseTipo(value) {
  const text = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!text) return "";
  const hasNac = /\bnacional(?:is)?\b/.test(text);
  const hasImp = /\bimportad(?:a|as|o|os)\b/.test(text);
  if (hasNac && hasImp) return "Nacional e Importada";
  if (hasImp) return "Importada";
  if (hasNac) return "Nacional";
  if (/ambas|mista|nacional.?ou.?importad/.test(text)) return "Nacional e Importada";
  return capitalizeWords(value);
}

export function maskCpfForLog(cpf) {
  const digits = String(cpf || "").replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***.***.***-${digits.slice(-2)}`;
}
