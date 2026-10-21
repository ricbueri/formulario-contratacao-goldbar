import assert from "node:assert/strict";
import test from "node:test";
import { BAR_SEM_ALCOOL } from "./drinkCatalog.js";
import { isBarSemAlcool, validatePublicForm } from "./validateForm.js";

function completeForm(overrides = {}) {
  return {
    NOME_CONTRATANTE: "Mariana Alves",
    CPF: "123.456.789-00",
    CEP: "05433-000",
    ENDERECO: "Rua das Palmeiras",
    NUMERO_ENDERECO: "210",
    CIDADE: "São Paulo",
    ESTADO: "SP",
    EMAIL: "mariana@email.com",
    TELEFONE: "(11) 98888-1234",
    NATUREZA: "Casamento",
    DATA_EVENTO: "14/11/2026",
    LOCAL_EVENTO: "Casa Itaim",
    CIDADE_EVENTO: "São Paulo",
    NUM_CONVIDADOS_RAW: "80",
    HORARIO_INICIO: "16:00",
    TEMPO_OPENBAR: "6 horas",
    VALOR_TOTAL_RAW: "1.509,00",
    SINAL_PCT: "50",
    SINAL_RESERVA_RAW: "",
    PRAZO_SALDO_QTD: "7",
    PRAZO_SALDO_UNIDADE: "dias",
    BASES_LINHA: "Vodka, Gin",
    BASE_TIPO: "Nacional",
    openBarDrinks: ["Moscow Mule"],
    ...overrides,
  };
}

test("ficha completa passa", () => {
  assert.deepEqual(validatePublicForm(completeForm()), []);
});

test("bloqueia bases e tipo de base vazios", () => {
  const errors = validatePublicForm(completeForm({ BASES_LINHA: "", BASE_TIPO: "" }));
  assert.ok(errors.some((error) => /base alcoólica/i.test(error)));
  assert.ok(errors.some((error) => /nacional, importada/i.test(error)));
});

test("botão bar sem álcool preenche base e tipo", () => {
  const form = completeForm({
    openBarDrinks: ["Berry Fresh"],
    BASES_LINHA: BAR_SEM_ALCOOL,
    BASE_TIPO: BAR_SEM_ALCOOL,
  });
  assert.equal(isBarSemAlcool(form), true);
  assert.deepEqual(validatePublicForm(form), []);
});

test("soft bar sem o botão continua pendente", () => {
  const errors = validatePublicForm(
    completeForm({
      openBarDrinks: ["Berry Fresh", "Peach Gold"],
      BASES_LINHA: "",
      BASE_TIPO: "",
    })
  );
  assert.ok(errors.some((error) => /bar sem álcool/i.test(error)));
});

test("«À definir» ainda exige bases", () => {
  const errors = validatePublicForm(completeForm({ openBarDrinks: ["À definir"], BASES_LINHA: "", BASE_TIPO: "" }));
  assert.ok(errors.some((error) => /base alcoólica/i.test(error)));
});

test("drink em branco e campos de evento vazios bloqueiam o envio", () => {
  const errors = validatePublicForm(
    completeForm({
      openBarDrinks: ["Moscow Mule", ""],
      CIDADE_EVENTO: "",
      NUM_CONVIDADOS_RAW: "",
      HORARIO_INICIO: "",
      TEMPO_OPENBAR: "",
      VALOR_TOTAL_RAW: "",
      SINAL_PCT: "",
      PRAZO_SALDO_QTD: "",
      CPF: "",
      CEP: "",
    })
  );
  for (const snippet of [
    "drinks em branco",
    "cidade do evento",
    "convidados",
    "início do open bar",
    "tempo de open bar",
    "valor total",
    "sinal de reserva",
    "prazo",
    "CPF",
    "CEP",
  ]) {
    assert.ok(
      errors.some((error) => error.toLocaleLowerCase("pt-BR").includes(snippet.toLocaleLowerCase("pt-BR"))),
      `faltou erro contendo "${snippet}": ${errors.join(" | ")}`
    );
  }
});
