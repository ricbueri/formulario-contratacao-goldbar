import { A_DEFINIR } from "./cardapioDrinks.js";
import { BASE_SPIRIT_OPTIONS, getDrinkMeta, OPEN_BAR_SEM_ALCOOL } from "./drinkCatalog.js";
import { parseMoneyBR } from "./formatters.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const BASE_TIPO_OPTIONS = ["Nacional", "Importada", "Nacional e Importada"];
const OPEN_BAR_DURATIONS = new Set(["1 hora", "2 horas", "3 horas", "4 horas", "5 horas", "6 horas"]);
const KNOWN_BASES = new Set(BASE_SPIRIT_OPTIONS.map((name) => name.toLocaleLowerCase("pt-BR")));

export function isValidEmail(value) {
  const email = String(value || "").trim();
  return email.length > 0 && EMAIL_RE.test(email);
}

export function isValidPhoneBr(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length > 11) digits = digits.slice(2);
  return digits.length === 10 || digits.length === 11;
}

export function isValidDateBr(value) {
  const text = String(value || "").trim();
  const m = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || year < 1900) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isValidTime(value) {
  const match = String(value || "").trim().match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/** Open bar com álcool, «À definir» ou ainda sem drinks precisa de bases. Soft bar puro não. */
export function requiresAlcoholBases(drinks) {
  const named = (drinks || []).map((drink) => String(drink || "").trim()).filter(Boolean);
  if (!named.length) return true;
  return named.some((name) => {
    if (name === A_DEFINIR) return true;
    if (name === OPEN_BAR_SEM_ALCOOL) return false;
    return getDrinkMeta(name).alcoholic !== false;
  });
}

function selectedBases(form) {
  return String(form.BASES_LINHA || "")
    .split(/,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validatePublicForm(form) {
  const errors = [];
  const name = String(form.NOME_CONTRATANTE || "").trim();
  if (!name) errors.push("Informe o nome do contratante.");

  const cpfDigits = String(form.CPF || "").replace(/\D/g, "");
  if (!cpfDigits) errors.push("Informe o CPF ou CNPJ.");
  else if (cpfDigits.length !== 11 && cpfDigits.length !== 14) {
    errors.push("CPF/CNPJ inválido.");
  }

  const cepDigits = String(form.CEP || "").replace(/\D/g, "");
  if (cepDigits.length !== 8) errors.push("Informe o CEP com 8 números.");

  if (!String(form.ENDERECO || "").trim()) errors.push("Informe o logradouro (rua).");
  if (!String(form.NUMERO_ENDERECO || "").trim()) errors.push("Informe o número do endereço.");
  if (!String(form.CIDADE || "").trim()) errors.push("Informe a cidade.");
  if (!/^[A-Za-z]{2}$/.test(String(form.ESTADO || "").trim())) errors.push("Informe a UF com 2 letras.");

  const email = String(form.EMAIL || "").trim();
  const phone = String(form.TELEFONE || "").trim();
  if (!email) errors.push("Informe o e-mail.");
  else if (!isValidEmail(email)) errors.push("E-mail inválido.");

  if (!phone) errors.push("Informe o telefone / WhatsApp.");
  else if (!isValidPhoneBr(phone)) errors.push("Telefone inválido (use DDD + número).");

  if (!String(form.NATUREZA || "").trim()) errors.push("Informe a natureza do evento.");

  const data = String(form.DATA_EVENTO || "").trim();
  if (!data) errors.push("Informe a data do evento.");
  else if (!isValidDateBr(data)) errors.push("Data inválida. Use o formato DD/MM/AAAA.");

  if (!String(form.LOCAL_EVENTO || "").trim()) errors.push("Informe o local do evento.");
  if (!String(form.CIDADE_EVENTO || "").trim()) errors.push("Informe a cidade do evento.");

  const guests = String(form.NUM_CONVIDADOS_RAW || "").trim();
  if (!/^\d+$/.test(guests) || Number(guests) < 1) {
    errors.push("Informe o número de convidados.");
  }

  const start = String(form.HORARIO_INICIO || "").trim();
  if (!start) errors.push("Informe o início do open bar.");
  else if (!isValidTime(start)) errors.push("Horário inválido. Use o formato HH:MM.");

  if (!OPEN_BAR_DURATIONS.has(String(form.TEMPO_OPENBAR || "").trim())) {
    errors.push("Informe o tempo de open bar (de 1 a 6 horas).");
  }

  const valorTotal = parseMoneyBR(form.VALOR_TOTAL_RAW);
  if (valorTotal === null || valorTotal <= 0) errors.push("Informe o valor total do evento.");

  const pct = parseMoneyBR(form.SINAL_PCT);
  let sinal = parseMoneyBR(form.SINAL_RESERVA_RAW);
  if (pct !== null && String(form.SINAL_PCT || "").trim()) {
    if (pct <= 0 || pct > 100) errors.push("A porcentagem do sinal deve ficar entre 1 e 100.");
    else if (valorTotal !== null && valorTotal > 0) {
      sinal = Math.round(((valorTotal * pct) / 100) * 100) / 100;
    }
  }
  if (sinal === null || sinal <= 0) {
    errors.push("Informe o sinal de reserva (valor ou porcentagem).");
  } else if (valorTotal !== null && sinal > valorTotal) {
    errors.push("O sinal não pode ser maior que o valor total.");
  }

  const prazo = String(form.PRAZO_SALDO_QTD || "").trim();
  if (!/^\d+$/.test(prazo) || Number(prazo) < 1) {
    errors.push("Informe o prazo para quitar o saldo.");
  }
  const unidade = String(form.PRAZO_SALDO_UNIDADE || "").trim();
  if (unidade !== "dias" && unidade !== "meses") {
    errors.push("Informe se o prazo do saldo é em dias ou meses.");
  }

  const rawDrinks = Array.isArray(form.openBarDrinks) ? form.openBarDrinks : [];
  const drinks = rawDrinks.map((drink) => String(drink || "").trim()).filter(Boolean);
  if (drinks.length && rawDrinks.some((drink) => !String(drink || "").trim())) {
    errors.push("Preencha ou remova os drinks em branco do open bar.");
  }
  if (!drinks.length) errors.push("Escolha pelo menos um drink do open bar (ou «À definir»).");
  if (drinks.length > 6) errors.push("O pacote permite no máximo 6 drinks no open bar.");

  if (requiresAlcoholBases(drinks)) {
    const bases = selectedBases(form);
    const known = bases.filter((base) => KNOWN_BASES.has(base.toLocaleLowerCase("pt-BR")));
    if (!known.length) errors.push("Selecione pelo menos uma base alcoólica do pacote.");
    const baseTipo = String(form.BASE_TIPO || "").trim();
    if (!BASE_TIPO_OPTIONS.includes(baseTipo)) {
      errors.push("Informe se a base é nacional, importada ou as duas.");
    }
  }

  return errors;
}
