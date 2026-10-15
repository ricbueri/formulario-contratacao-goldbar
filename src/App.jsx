import { useEffect, useRef, useState } from "react";
import { postFormSubmit } from "./api/submit.js";
import { formatCpfCnpjInput, formatDateBrInput, formatPhoneBrInput } from "./utils/masks.js";
import { EMPTY_PUBLIC_FIELDS } from "../shared/fields.js";
import { validatePublicForm } from "../shared/validateForm.js";
import { SHOT_OPTIONS, WELCOME_DRINK_OPTIONS } from "../shared/cardapioDrinks.js";
import { BASE_SPIRIT_OPTIONS } from "../shared/drinkCatalog.js";
import { OPEN_BAR_DURATION_OPTIONS } from "./constants.js";
import { ChoiceButtons, Field, MultiChoiceButtons, Section, SelectField } from "./components/ui.jsx";
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

    const openBarDrinksClean = openBarDrinks.map((d) => String(d).trim()).filter(Boolean);
    const form = { ...fields, openBarDrinks: openBarDrinksClean, welcomeDrinks, shots };
    const clientErrors = validatePublicForm(form);
    if (clientErrors.length) {
      setError(clientErrors.join("\n"));
      return;
    }

    setLoading(true);
    try {
      const { response, payload } = await postFormSubmit({
        fields,
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
  const selectedBases = String(f.BASES_LINHA || "")
    .split(/,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  function setBases(nextList) {
    setField("BASES_LINHA")(nextList.join(", "));
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

          <Section title="Contratante" subtitle="Dados para contato e contrato.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Nome completo *"
                value={f.NOME_CONTRATANTE}
                onChange={setField("NOME_CONTRATANTE")}
                placeholder="Ex: Mariana Alves Costa"
              />
              <Field
                label="CPF ou CNPJ"
                value={f.CPF}
                onChange={(v) => setField("CPF")(formatCpfCnpjInput(v))}
                placeholder="Ex: 000.000.000-00"
              />
              <Field
                label="CEP"
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
                label="Logradouro (rua)"
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
              <Field label="Cidade" value={f.CIDADE} onChange={setField("CIDADE")} placeholder="Ex: São Paulo" />
              <Field label="UF" value={f.ESTADO} onChange={setField("ESTADO")} placeholder="Ex: SP" />
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
            <p className="mt-3 text-xs text-white/40">* Campos obrigatórios. E-mail e telefone precisam estar válidos.</p>
          </Section>

          <Section title="Evento">
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
                label="Cidade do evento"
                value={f.CIDADE_EVENTO}
                onChange={setField("CIDADE_EVENTO")}
                className="md:col-span-2"
                placeholder="Ex: São Paulo"
              />
              <Field
                label="Nº de convidados"
                value={f.NUM_CONVIDADOS_RAW}
                onChange={setField("NUM_CONVIDADOS_RAW")}
                placeholder="Ex: 80"
              />
              <Field
                label="Início do open bar"
                value={f.HORARIO_INICIO}
                onChange={setField("HORARIO_INICIO")}
                placeholder="Ex: 16:00"
              />
              <SelectField
                label="Tempo de open bar"
                value={f.TEMPO_OPENBAR}
                onChange={setField("TEMPO_OPENBAR")}
                className="md:col-span-2"
                placeholder="Selecione a duração"
                options={OPEN_BAR_DURATION_OPTIONS}
                hint="De 1 a 6 horas."
              />
            </div>
          </Section>

          <Section
            title="Open bar — drinks"
            subtitle="Adicione quantos drinks quiser. Toque em cada linha para abrir o cardápio."
            defaultOpen={true}
          >
            <OpenBarDrinkList drinks={openBarDrinks} onChange={setOpenBarDrinks} />
            <div className="mt-6 grid gap-5 border-t border-gold/10 pt-5">
              <MultiChoiceButtons
                label="Bases alcoólicas do pacote"
                hint="Selecione todas que se aplicam ao seu evento."
                options={BASE_SPIRIT_OPTIONS}
                selected={selectedBases}
                onChange={setBases}
              />
              <ChoiceButtons
                label="Base nacional ou importada"
                value={f.BASE_TIPO}
                onChange={setField("BASE_TIPO")}
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
