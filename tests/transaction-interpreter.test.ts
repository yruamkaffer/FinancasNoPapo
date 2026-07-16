import assert from "node:assert/strict";
import test from "node:test";

import { normalizeAiInterpretation } from "../src/lib/transaction-interpreter.ts";

test("combina uma resposta curta com o rascunho anterior", () => {
  const result = normalizeAiInterpretation(
    {
      status: "ok",
      type: null,
      amount: 35,
      description: null,
      category: null,
      occurred_on: null,
      missing: [],
      explanation: "Pronto.",
    },
    {
      type: "expense",
      description: "Chinelo",
      category: "Compras",
      occurred_on: "2026-07-16",
    },
  );

  assert.equal(result.status, "ok");
  assert.equal(result.amount, 35);
  assert.equal(result.description, "Chinelo");
  assert.equal(result.category, "Compras");
});

test("rejeita datas impossíveis e não confia no status da IA", () => {
  const result = normalizeAiInterpretation({
    status: "ok",
    type: "expense",
    amount: 12,
    description: "Café",
    category: "Alimentacao",
    occurred_on: "2026-02-31",
    missing: [],
    explanation: "Pronto.",
  });

  assert.equal(result.status, "incomplete");
  assert.deepEqual(result.missing, ["data"]);
  assert.equal(result.category, "Alimentação");
});

test("recusa uma estrutura inesperada", () => {
  assert.throws(
    () => normalizeAiInterpretation({ status: "ok", amount: "35" }),
    /resposta inválida/i,
  );
});
