import { z } from "zod";

import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type TransactionType,
} from "./finance.ts";

export type TransactionDraft = {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  occurred_on: string;
};

export type PartialTransactionDraft = Partial<TransactionDraft>;

type PreviousTransactionDraft = {
  [Key in keyof TransactionDraft]?: TransactionDraft[Key] | null;
};

export type TransactionInterpretation = {
  status: "ok" | "incomplete" | "unclear";
  type: TransactionType | null;
  amount: number | null;
  description: string | null;
  category: string | null;
  occurred_on: string | null;
  missing: string[];
  explanation: string;
};

const rawAiResponseSchema = z.object({
  status: z.enum(["ok", "incomplete", "unclear"]),
  type: z.enum(["income", "expense"]).nullable().optional(),
  amount: z.number().finite().nullable().optional(),
  description: z.string().max(200).nullable().optional(),
  category: z.string().max(60).nullable().optional(),
  occurred_on: z.string().max(10).nullable().optional(),
  missing: z.array(z.string().max(30)).max(5).optional(),
  explanation: z.string().max(300).optional().default(""),
});

export const GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    status: {
      type: "STRING",
      enum: ["ok", "incomplete", "unclear"],
    },
    type: {
      type: "STRING",
      enum: ["income", "expense"],
      nullable: true,
    },
    amount: { type: "NUMBER", nullable: true },
    description: { type: "STRING", nullable: true },
    category: { type: "STRING", nullable: true },
    occurred_on: { type: "STRING", nullable: true },
    missing: { type: "ARRAY", items: { type: "STRING" } },
    explanation: { type: "STRING" },
  },
  required: [
    "status",
    "type",
    "amount",
    "description",
    "category",
    "occurred_on",
    "missing",
    "explanation",
  ],
} as const;

export function normalizeAiInterpretation(
  raw: unknown,
  previous: PreviousTransactionDraft = {},
): TransactionInterpretation {
  const result = rawAiResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      "O assistente retornou uma resposta inválida. Tente novamente.",
    );
  }

  const current = result.data;
  const type = current.type ?? previous.type ?? null;
  const amount =
    validAmount(current.amount) ?? validAmount(previous.amount) ?? null;
  const description =
    cleanText(current.description, 200) ??
    cleanText(previous.description, 200) ??
    null;
  const occurredOn =
    validDate(current.occurred_on) ?? validDate(previous.occurred_on) ?? null;
  const category = type
    ? canonicalCategory(current.category ?? previous.category ?? null, type)
    : null;

  const missing: string[] = [];
  if (!type) missing.push("tipo");
  if (!amount) missing.push("valor");
  if (!description) missing.push("descrição");
  if (!occurredOn) missing.push("data");

  const hasTransactionData = Boolean(
    type || amount || description || occurredOn || previous.category,
  );
  const status =
    missing.length === 0
      ? "ok"
      : current.status === "unclear" && !hasTransactionData
        ? "unclear"
        : "incomplete";

  return {
    status,
    type,
    amount,
    description,
    category,
    occurred_on: occurredOn,
    missing,
    explanation:
      cleanText(current.explanation, 300) ??
      defaultExplanation(status, missing, description),
  };
}

function validAmount(value: unknown): number | undefined {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= 1_000_000_000
    ? value
    : undefined;
}

function cleanText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.trim();
  return clean && clean.length <= maxLength ? clean : undefined;
}

function validDate(value: unknown): string | undefined {
  return typeof value === "string" && isValidIsoDate(value) ? value : undefined;
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? true
    : false;
}

function canonicalCategory(
  value: string | null,
  type: TransactionType,
): string {
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const normalized = normalizeLabel(value ?? "");
  return (
    categories.find((category) => normalizeLabel(category) === normalized) ??
    "Outros"
  );
}

function normalizeLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function defaultExplanation(
  status: TransactionInterpretation["status"],
  missing: string[],
  description: string | null,
): string {
  if (status === "unclear") {
    return "Não identifiquei uma movimentação financeira. Pode contar o que você pagou ou recebeu?";
  }
  if (missing.length === 1 && missing[0] === "valor" && description) {
    return `Qual foi o valor de ${description}?`;
  }
  return `Ainda preciso saber: ${missing.join(", ")}.`;
}
