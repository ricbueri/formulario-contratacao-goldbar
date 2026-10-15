const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

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

export function validatePublicForm(form) {
  const errors = [];
  const name = String(form.NOME_CONTRATANTE || "").trim();
  if (!name) errors.push("Informe o nome do contratante.");

  const email = String(form.EMAIL || "").trim();
  const phone = String(form.TELEFONE || "").trim();
  if (!email) errors.push("Informe o e-mail.");
  else if (!isValidEmail(email)) errors.push("E-mail inválido.");

  if (!phone) errors.push("Informe o telefone / WhatsApp.");
  else if (!isValidPhoneBr(phone)) errors.push("Telefone inválido (use DDD + número).");

  const cpfDigits = String(form.CPF || "").replace(/\D/g, "");
  if (cpfDigits && cpfDigits.length !== 11 && cpfDigits.length !== 14) {
    errors.push("CPF/CNPJ inválido.");
  }

  if (!String(form.NUMERO_ENDERECO || "").trim()) {
    errors.push("Informe o número do endereço.");
  }

  if (!String(form.NATUREZA || "").trim()) errors.push("Informe a natureza do evento.");

  const data = String(form.DATA_EVENTO || "").trim();
  if (!data) errors.push("Informe a data do evento.");
  else if (!isValidDateBr(data)) errors.push("Data inválida. Use o formato DD/MM/AAAA.");

  if (!String(form.LOCAL_EVENTO || "").trim()) errors.push("Informe o local do evento.");

  const drinks = (form.openBarDrinks || []).filter((d) => String(d).trim());
  if (!drinks.length) errors.push("Escolha pelo menos um drink do open bar (ou «À definir»).");
  if (drinks.length > 6) errors.push("O pacote permite no máximo 6 drinks no open bar.");

  return errors;
}
