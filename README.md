# Formulário público — Gold Bar Eventos

Formulário mobile-first para o cliente preencher a ficha do evento. Ao enviar, a API gera um **PDF de resumo** e envia e-mail para a equipe (com JSON nas mesmas chaves do gerador de contratos interno).

## Requisitos

- Node.js 20+

## Rodar em desenvolvimento

```bash
npm install
cp .env.example .env   # já vem com SKIP_EMAIL=true — só PDF local por enquanto
npm run dev
```

Se aparecer **porta em uso** (dev anterior não fechado com Ctrl+C):

```bash
npm run dev:free
npm run dev
```

Cada envio grava o PDF em `server/output/`. **E-mail:** quando quiser, veja seção abaixo e mude `SKIP_EMAIL=false` no `.env`.

- Site: http://127.0.0.1:5173 (se a porta estiver ocupada, o Vite usa 5174, 5175…)  
- API: http://127.0.0.1:3002 (contratos internos usam 3001)  

## PDF de teste (sem e-mail)

```bash
npm run pdf:test
```

Arquivo: `server/output/teste-ficha.pdf`

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `NOTIFY_EMAIL` | E-mail que recebe a ficha (ex.: ricardobueri@gmail.com) |
| `RESEND_API_KEY` | Ou SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) |
| `MAIL_FROM` | Remetente |
| `SAVE_PDF_LOCALLY` | `true` grava PDF em `server/output/` |
| `SKIP_EMAIL` | `true` pula envio de e-mail |
| `PORT` | Porta da API (padrão 3001) |

## Link do cliente

O formulário que o cliente preenche é sempre [https://formulario-clientes-goldbar.vercel.app/](https://formulario-clientes-goldbar.vercel.app/). As alterações entram nesse endereço. Não publique outro link no lugar dele.

## Deploy (Vercel ou Netlify)

O site é o build do Vite (`dist/`). O envio fica em `api/submit.js` (Vercel) e `netlify/functions/submit.js` (Netlify). Segredos só no painel do host, nunca no Git.

Variáveis no painel: `NOTIFY_EMAIL`, `MAIL_FROM`, `RESEND_API_KEY` (ou `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) e `SKIP_EMAIL=false`. Não defina `SAVE_PDF_LOCALLY` na nuvem.

Na Vercel, o endereço do cliente é `https://formulario-clientes-goldbar.vercel.app/`.

Na Netlify: build `npm run build`, publish `dist` (já está no `netlify.toml`).

## Cardápio

Lista em `shared/cardapioDrinks.js` (espelha `cardapio_anexo.pdf` do projeto interno). Atualize ao mudar o PDF.

## Chaves enviadas

Compatíveis com o sistema de contratos: `NOME_CONTRATANTE`, `CPF`, `DRINKS_LINHA`, etc. Extras opcionais: `WELCOME_DRINKS_LINHA`, `SHOTS_LINHA`.
