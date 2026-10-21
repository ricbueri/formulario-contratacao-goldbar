import { useEffect, useRef, useState } from "react";
import { postFormSubmit } from "./api/submit.js";
import { formatCpfCnpjInput, formatDateBrInput, formatMoneyBrInput, formatPhoneBrInput, formatTimeBrInput } from "./utils/masks.js";
import { formatMoneyInput, normalizeHorario, parseMoneyBR } from "../shared/formatters.js";
import { EMPTY_PUBLIC_FIELDS } from "../shared/fields.js";
import { isBarSemAlcool, validatePublicForm } from "../shared/validateForm.js";
import { SHOT_OPTIONS, WELCOME_DRINK_OPTIONS } from "../shared/cardapioDrinks.js";
import { BAR_SEM_ALCOOL, BASE_SPIRIT_OPTIONS } from "../shared/drinkCatalog.js";
import { OPEN_BAR_DURATION_OPTIONS } from "./constants.js";
import { ChoiceButtons, Field, MultiChoiceButtons, Section, SelectField, inputClass } from "./components/ui.jsx";
import { fetchAddressByCep, formatCepInput } from "./utils/viacep.js";
import { OpenBarDrinkList } from "./components/OpenBarDrinkList.jsx";
import { OptionalMultiPick } from "./components/OptionalMultiPick.jsx";

function downloadPdfFile(base64, fileName) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function friendlyError(err, fallback) {
  const text = String(err?.message || "");
  if (err instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(text)) {
    return "Não conseguimos enviar agora. Verifique sua conexão e tente de novo.";
  }
  return text || fallback;
}

export default function App() {
  const [fields, setFields] = useState(EMPTY_PUBLIC_FIELDS);
  const [openBarDrinks, setOpenBarDrinks] = useState([""]);
  const [welcomeDrinks, setWelcomeDrinks] = useState([]);
  const [shots, setShots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const errorRef = useRef(null);
  const [cepStatus, setCepStatus] = useState("");
  const lastCepFetched = useRef("");

  const setField = (key) => (value) => setFields((c) => ({ ...c, [key]: value }));

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [error]);

  useEffect(() => {
    setFields((current) => {
      const total = parseMoneyBR(current.VALOR_TOTAL_RAW);
      const pct = parseMoneyBR(current.SINAL_PCT);
      let sinal = parseMoneyBR(current.SINAL_RESERVA_RAW);
      let nextSinalRaw = current.SINAL_RESERVA_RAW;

      if (pct !== null && total !== null && pct > 0) {
        const calc = Math.round(((total * pct) / 100) * 100) / 100;
        nextSinalRaw = formatMoneyInput(calc);
        sinal = calc;
      }

      let nextSaldoRaw = "";
      if (total !== null && sinal !== null) {
        nextSaldoRaw = formatMoneyInput(Math.round((total - sinal) * 100) / 100);
      }

      if (nextSinalRaw === current.SINAL_RESERVA_RAW && nextSaldoRaw === current.SALDO_REMANESCENTE_RAW) {
        return current;
      }
      return {
        ...current,
        SINAL_RESERVA_RAW: nextSinalRaw,
        SALDO_REMANESCENTE_RAW: nextSaldoRaw,
      };
    });
  }, [fields.VALOR_TOTAL_RAW, fields.SINAL_RESERVA_RAW, fields.SINAL_PCT]);

  async function handleCepChange(raw) {
    const formatted = formatCepInput(raw);
    setField("CEP")(formatted);
    setCepStatus("");

    const digits = formatted.replace(/\D/g, "");
    if (digits.length !== 8) {
      lastCepFetched.current = "";
      return;
    }
    if (digits === lastCepFetched.current) return;

    setCepStatus("Buscando endereço...");
    try {
      const addr = await fetchAddressByCep(digits);
      if (!addr) {
        setCepStatus("CEP não encontrado. Confira os números ou preencha manualmente.");
        return;
      }
      lastCepFetched.current = digits;
      setFields((c) => ({
        ...c,
        CEP: addr.CEP,
        ENDERECO: addr.ENDERECO || c.ENDERECO,
        CIDADE: addr.CIDADE || c.CIDADE,
        ESTADO: addr.ESTADO || c.ESTADO,
      }));
      setCepStatus("Rua preenchida. Informe o número (obrigatório) e complemento, se houver.");
    } catch {
      setCepStatus("Não foi possível consultar o CEP agora. Preencha manualmente.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const horario = normalizeHorario(fields.HORARIO_INICIO);
    const fieldsToSend = horario ? { ...fields, HORARIO_INICIO: horario } : fields;
    if (horario && horario !== fields.HORARIO_INICIO) {
      setFields((current) => ({ ...current, HORARIO_INICIO: horario }));
    }
    const form = { ...fieldsToSend, openBarDrinks, welcomeDrinks, shots };
    const clientErrors = validatePublicForm(form);
    if (clientErrors.length) {
      setError(clientErrors.join("\n"));
      return;
    }
    const openBarDrinksClean = openBarDrinks.map((d) => String(d).trim()).filter(Boolean);

    setLoading(true);
    try {
      const { response, payload } = await postFormSubmit({
        fields: fieldsToSend,
        openBarDrinks: openBarDrinksClean,
        welcomeDrinks,
        shots,
        company_website: "",
      });
      if (!response.ok || (!payload.emailed && !payload.pdfBase64)) {
        throw new Error(payload.error || "Não foi possível enviar a ficha. Tente de novo em instantes.");
      }
      if (!payload.emailed && payload.pdfBase64) {
        const file = { base64: payload.pdfBase64, name: payload.pdfFileName || "Ficha Gold Bar.pdf" };
        downloadPdfFile(file.base64, file.name);
        setPdfFile(file);
      } else {
        setPdfFile(null);
      }
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(friendlyError(err, "Falha ao enviar."));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-ink">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.12),_transparent_42%)]" />
        <main className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Gold Bar Eventos</p>
          <h1 className="mt-4 font-serif text-3xl text-gold-soft">Recebemos seus dados</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Obrigado pelo envio. Nossa equipe vai analisar a ficha e entrar em contato em breve para
            confirmar detalhes e próximos passos.
          </p>
          <p className="mt-3 text-xs text-gold/80">
            {pdfFile
              ? "O PDF da ficha foi baixado neste computador."
              : "A ficha foi enviada por e-mail para a equipe Gold Bar."}
          </p>
          {pdfFile && (
            <button
              type="button"
              onClick={() => downloadPdfFile(pdfFile.base64, pdfFile.name)}
              className="mt-6 rounded-full bg-gold px-8 py-3 text-sm font-semibold text-black hover:bg-gold-soft"
            >
              Baixar PDF de novo
            </button>
          )}
        </main>
      </div>
    );
  }

  const f = fields;
  const barSemAlcool = isBarSemAlcool(f);
  const selectedBases = barSemAlcool
    ? []
    : String(f.BASES_LINHA || "")
        .split(/,\s*/)
        .map((s) => s.trim())
        .filter(Boolean);

  function setBases(nextList) {
    setFields((current) => ({
      ...current,
      BASES_LINHA: nextList.join(", "),
      BASE_TIPO: current.BASE_TIPO === BAR_SEM_ALCOOL ? "" : current.BASE_TIPO,
    }));
  }

  function chooseBarSemAlcool() {
    setFields((current) => ({
      ...current,
      BASES_LINHA: BAR_SEM_ALCOOL,
      BASE_TIPO: BAR_SEM_ALCOOL,
    }));
  }

  function setBaseTipo(value) {
    setFields((current) => ({
      ...current,
      BASE_TIPO: value,
      BASES_LINHA: current.BASES_LINHA === BAR_SEM_ALCOOL ? "" : current.BASES_LINHA,
    }));
  }

  return (
    <div className="min-h-screen bg-ink">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.12),_transparent_42%)]" />

      <main className="relative mx-auto max-w-2xl px-4 py-8 pb-16 md:px-6">
        <header className="mb-2 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-gold">Gold Bar Eventos</p>
          <h1 className="font-serif text-3xl text-gold-soft md:text-4xl">Ficha do seu evento</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/65">
            Preencha os dados abaixo. Enviamos um resumo para nossa equipe — não é o contrato final.
            Os campos com * são obrigatórios: a ficha só é enviada quando estiver completa.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-6" noValidate>
          <input
            type="text"
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
            className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
            aria-hidden="true"
          />

          <Section title="Dados do Cliente" subtitle="Dados para contato e contrato.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Nome completo *"
                value={f.NOME_CONTRATANTE}
                onChange={setField("NOME_CONTRATANTE")}
                placeholder="Ex: Mariana Alves Costa"
              />
              <Field
                label="CPF ou CNPJ *"
                value={f.CPF}
                onChange={(v) => setField("CPF")(formatCpfCnpjInput(v))}
                placeholder="Ex: 000.000.000-00"
              />
              <Field
                label="CEP *"
                value={f.CEP}
                onChange={handleCepChange}
                placeholder="Ex: 05433-000"
                inputMode="numeric"
                autoComplete="postal-code"
                className="md:col-span-2"
                hint="Ao digitar os 8 números, cidade e rua são preenchidos automaticamente."
              />
              {cepStatus && <p className="text-xs text-gold/70 md:col-span-2">{cepStatus}</p>}
              <Field
                label="Logradouro (rua) *"
                value={f.ENDERECO}
                onChange={setField("ENDERECO")}
                className="md:col-span-2"
                placeholder="Ex: Rua das Palmeiras"
              />
              <Field
                label="Número *"
                value={f.NUMERO_ENDERECO}
                onChange={setField("NUMERO_ENDERECO")}
                placeholder="Ex: 210"
                inputMode="numeric"
              />
              <Field
                label="Complemento"
                value={f.COMPLEMENTO_ENDERECO}
                onChange={setField("COMPLEMENTO_ENDERECO")}
                placeholder="Ex: Apto 42, bloco B"
              />
              <Field label="Cidade *" value={f.CIDADE} onChange={setField("CIDADE")} placeholder="Ex: São Paulo" />
              <Field label="UF *" value={f.ESTADO} onChange={setField("ESTADO")} placeholder="Ex: SP" />
              <Field
                label="E-mail *"
                value={f.EMAIL}
                onChange={setField("EMAIL")}
                type="text"
                inputMode="email"
                placeholder="Ex: nome@email.com"
                autoComplete="email"
              />
              <Field
                label="Telefone / WhatsApp *"
                value={f.TELEFONE}
                onChange={(v) => setField("TELEFONE")(formatPhoneBrInput(v))}
                placeholder="Ex: (11) 98888-1234"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            <p className="mt-3 text-xs text-white/40">
              Complemento é o único campo livre desta seção. E-mail, telefone, CPF/CNPJ e CEP precisam estar válidos.
            </p>
          </Section>

          <Section title="Dados do Evento">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Natureza do evento *"
                value={f.NATUREZA}
                onChange={setField("NATUREZA")}
                placeholder="Ex: Casamento, festa corporativa"
              />
              <Field
                label="Data do evento *"
                value={f.DATA_EVENTO}
                onChange={(v) => setField("DATA_EVENTO")(formatDateBrInput(v))}
                placeholder="Ex: 22/11/2026"
                inputMode="numeric"
              />
              <Field
                label="Local do evento *"
                value={f.LOCAL_EVENTO}
                onChange={setField("LOCAL_EVENTO")}
                className="md:col-span-2"
                placeholder="Ex: Espaço Villa Garden ou residência"
                hint="Nome do espaço, clube ou tipo de local — não precisa do endereço completo."
              />
              <Field
                label="Cidade do evento *"
                value={f.CIDADE_EVENTO}
                onChange={setField("CIDADE_EVENTO")}
                className="md:col-span-2"
                placeholder="Ex: São Paulo"
              />
              <Field
                label="Nº de convidados *"
                value={f.NUM_CONVIDADOS_RAW}
                onChange={setField("NUM_CONVIDADOS_RAW")}
                placeholder="Ex: 80"
              />
              <Field
                label="Início do open bar *"
                value={f.HORARIO_INICIO}
                onChange={(v) => setField("HORARIO_INICIO")(formatTimeBrInput(v))}
                onBlur={() =>
                  setFields((current) => {
                    const next = normalizeHorario(current.HORARIO_INICIO);
                    if (!next || next === current.HORARIO_INICIO) return current;
                    return { ...current, HORARIO_INICIO: next };
                  })
                }
                placeholder="Ex: 1600"
                inputMode="numeric"
                hint="Digite 1600 para 16:00, ou 1630 para 16:30. Só a hora, como 16, vira 16:00."
              />
              <SelectField
                label="Tempo de open bar *"
                value={f.TEMPO_OPENBAR}
                onChange={setField("TEMPO_OPENBAR")}
                className="md:col-span-2"
                placeholder="Selecione a duração"
                options={OPEN_BAR_DURATION_OPTIONS}
                hint="De 1 a 6 horas."
              />
            </div>
          </Section>

          <Section title="Dados Financeiros" subtitle="Valor do evento, sinal e prazo para quitar o saldo." emphasis>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field
                label="Valor total (R$) *"
                value={f.VALOR_TOTAL_RAW}
                onChange={(v) => setField("VALOR_TOTAL_RAW")(formatMoneyBrInput(v))}
                placeholder="1.509,00"
                inputMode="numeric"
              />
              <Field
                label="% do sinal (opcional)"
                value={f.SINAL_PCT}
                onChange={(v) => setField("SINAL_PCT")(v.replace(/[^\d.,]/g, "").slice(0, 6))}
                placeholder="Ex: 50"
                inputMode="decimal"
              />
              <Field
                label="Sinal de reserva (R$) *"
                value={f.SINAL_RESERVA_RAW}
                onChange={(value) =>
                  setFields((current) => ({
                    ...current,
                    SINAL_RESERVA_RAW: formatMoneyBrInput(value),
                    SINAL_PCT: "",
                  }))
                }
                placeholder="556,00"
                inputMode="numeric"
              />
              <Field
                label="Saldo remanescente (R$)"
                value={f.SALDO_REMANESCENTE_RAW}
                onChange={() => {}}
                readOnly
                placeholder="Automático"
              />
            </div>
            <p className="mt-3 text-xs text-white/45">
              Se preencher a porcentagem, o sinal é calculado sobre o valor total. O saldo é sempre valor total − sinal.
            </p>
            <div className="mt-4">
                <span className="text-xs uppercase tracking-wide text-gold/80">
                Prazo para quitar o saldo (antes da data do evento)
              </span>
              <div className="mt-1.5 flex max-w-sm gap-3">
                <input
                  type="number"
                  min="1"
                  value={f.PRAZO_SALDO_QTD}
                  onChange={(e) => setField("PRAZO_SALDO_QTD")(e.target.value)}
                  placeholder="7"
                  className={`${inputClass} w-24`}
                />
                <select
                  value={f.PRAZO_SALDO_UNIDADE}
                  onChange={(e) => setField("PRAZO_SALDO_UNIDADE")(e.target.value)}
                  className={inputClass}
                >
                  <option value="dias">dias</option>
                  <option value="meses">meses</option>
                </select>
              </div>
              <p className="mt-1.5 text-xs text-white/45">Em branco = padrão de 07 (sete) dias.</p>
            </div>
          </Section>

          <Section
            title="Open bar — drinks"
            subtitle="Escolha de 1 a 6 drinks. Toque em cada linha para abrir o cardápio. Linhas em branco impedem o envio."
            defaultOpen={true}
          >
            <OpenBarDrinkList drinks={openBarDrinks} onChange={setOpenBarDrinks} />
            <div className="mt-6 grid gap-5 border-t border-gold/10 pt-5">
              <div className="space-y-1.5">
                <span className="text-xs uppercase tracking-wide text-gold/80">Evento sem álcool</span>
                <p className="text-xs text-white/45">
                  Preenche a base alcoólica e o tipo como bar sem álcool.
                </p>
                <button
                  type="button"
                  aria-pressed={barSemAlcool}
                  onClick={chooseBarSemAlcool}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    barSemAlcool
                      ? "border-gold bg-gold text-black"
                      : "border-gold/30 text-gold/80 hover:bg-gold/10"
                  }`}
                >
                  Bar sem álcool
                </button>
              </div>
              <MultiChoiceButtons
                label="Bases alcoólicas do pacote *"
                hint="Obrigatório. Selecione todas que se aplicam ao seu evento, ou use «Bar sem álcool»."
                options={BASE_SPIRIT_OPTIONS}
                selected={selectedBases}
                onChange={setBases}
              />
              <ChoiceButtons
                label="Base nacional ou importada *"
                value={barSemAlcool ? "" : f.BASE_TIPO}
                onChange={setBaseTipo}
                options={["Nacional", "Importada", "Nacional e Importada"]}
              />
            </div>
          </Section>

          <Section title="Opcionais" subtitle="Welcome drinks e shots — se fizer parte do seu pacote." defaultOpen={true}>
            <div className="space-y-4">
              <OptionalMultiPick
                label="Welcome drinks"
                hint="Águas saborizadas, cervejas premium, spritz de recepção."
                options={WELCOME_DRINK_OPTIONS}
                selected={welcomeDrinks}
                onChange={setWelcomeDrinks}
              />
              <OptionalMultiPick
                label="Menu shots"
                hint="Shots autorais do cardápio."
                options={SHOT_OPTIONS}
                selected={shots}
                onChange={setShots}
              />
            </div>
          </Section>

          <Section title="Adicionais" defaultOpen={true}>
            <div className="grid gap-5 sm:grid-cols-2">
              <ChoiceButtons label="Copos de vidro" value={f.COPOS_VIDRO} onChange={setField("COPOS_VIDRO")} options={["Sim", "Não"]} />
              <ChoiceButtons label="Equipe adicional" value={f.EQUIPE_ADD} onChange={setField("EQUIPE_ADD")} options={["Sim", "Não"]} />
              <ChoiceButtons label="Estrutura pers." value={f.ESTRUTURA_PERS} onChange={setField("ESTRUTURA_PERS")} options={["Sim", "Não"]} />
              <ChoiceButtons label="Torre de espumante" value={f.TORRE_ESPUMANTE} onChange={setField("TORRE_ESPUMANTE")} options={["Sim", "Não"]} />
              <ChoiceButtons
                label="Régua de shots (serviço)"
                value={f.REGUA_SHOTS}
                onChange={setField("REGUA_SHOTS")}
                options={["Sim", "Não"]}
              />
            </div>
          </Section>

          <div className="mt-8 text-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-sm rounded-full bg-gold px-10 py-3.5 text-sm font-semibold text-black transition hover:bg-gold-soft disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Enviando..." : "Enviar ficha"}
            </button>
            {error && (
              <p
                ref={errorRef}
                className="mx-auto mt-4 max-w-md whitespace-pre-line text-center text-sm leading-relaxed text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
        </form>

        <footer className="mt-10 text-center text-xs text-white/35">
          Gold Bar Eventos · dados tratados com confidencialidade
        </footer>
      </main>
    </div>
  );
}
