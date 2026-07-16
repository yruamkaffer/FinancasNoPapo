// Shared helpers used by both client and server code.
// Pure functions only — no server-only imports.

export const EXPENSE_CATEGORIES = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Assinaturas e serviços",
  "Outros",
] as const;

export const INCOME_CATEGORIES = [
  "Salário",
  "Freelancer",
  "Vendas",
  "Rendimentos",
  "Outros",
] as const;

export type TransactionType = "income" | "expense";

export function categoriesFor(type: TransactionType): readonly string[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
export function formatBRL(v: number | string | null | undefined): string {
  const n = typeof v === "string" ? Number(v) : (v ?? 0);
  return BRL.format(Number.isFinite(n) ? n : 0);
}

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
export function formatDateBR(iso: string): string {
  // iso: "YYYY-MM-DD" — evita fuso ao construir Date via ISO
  const [y, m, d] = iso.split("-").map(Number);
  return DATE_FMT.format(new Date(y, (m ?? 1) - 1, d ?? 1));
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function firstDayOfMonthISO(ref = new Date()): string {
  const y = ref.getFullYear();
  const m = String(ref.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}
