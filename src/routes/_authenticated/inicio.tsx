import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listTransactions, listGoals } from "@/lib/finance.functions";
import { formatBRL, formatDateBR, firstDayOfMonthISO } from "@/lib/finance";
import {
  ArrowDownRight,
  ArrowUpRight,
  MessageSquareText,
  Plus,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/inicio")({
  component: Dashboard,
});

function Dashboard() {
  const listTx = useServerFn(listTransactions);
  const listGl = useServerFn(listGoals);

  const txQ = useQuery({ queryKey: ["transactions"], queryFn: () => listTx() });
  const glQ = useQuery({ queryKey: ["goals"], queryFn: () => listGl() });

  const monthStart = firstDayOfMonthISO();
  const monthTx = (txQ.data ?? []).filter((t) => t.occurred_on >= monthStart);
  const income = monthTx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = monthTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  const byCategory: Record<string, number> = {};
  for (const t of monthTx.filter((t) => t.type === "expense")) {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + Number(t.amount);
  }
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  const recent = (txQ.data ?? []).slice(0, 5);
  const goals = glQ.data ?? [];

  const now = new Date();
  const monthLabel = now.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Resumo de {monthLabel}</p>
        <h1 className="mt-1 font-display text-3xl text-foreground">
          Olá! Aqui está seu mês.
        </h1>
      </div>

      {(txQ.isError || glQ.isError) && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Parte dos seus dados não pôde ser carregada. Tente atualizar a página.
        </p>
      )}

      {/* Cards de resumo */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Saldo do mês"
          value={formatBRL(balance)}
          tone={balance >= 0 ? "positive" : "negative"}
        />
        <SummaryCard label="Receitas" value={formatBRL(income)} tone="income" />
        <SummaryCard
          label="Despesas"
          value={formatBRL(expense)}
          tone="expense"
        />
      </div>

      {/* Ações rápidas */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/chat"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <MessageSquareText className="size-4" aria-hidden /> Registrar pelo
          chat
        </Link>
        <Link
          to="/transacoes"
          search={{ novo: 1 }}
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
        >
          <Plus className="size-4" aria-hidden /> Registrar pelo formulário
        </Link>
      </div>

      {/* Observação do agente */}
      <section
        aria-labelledby="obs"
        className="rounded-2xl border border-border bg-secondary/40 p-5"
      >
        <h2
          id="obs"
          className="flex items-center gap-2 font-display text-lg text-foreground"
        >
          <Sparkles className="size-4 text-primary" aria-hidden /> Observação do
          assistente
        </h2>
        <p className="mt-2 text-sm text-foreground">
          {txQ.isLoading ? (
            "Carregando seus dados…"
          ) : monthTx.length === 0 ? (
            "Você ainda não registrou nada neste mês. Comece registrando uma despesa ou receita — pelo chat ou pelo formulário."
          ) : topCategory ? (
            <>
              Sua maior categoria de gastos em {monthLabel} foi{" "}
              <strong>{topCategory[0]}</strong>, somando{" "}
              <strong>{formatBRL(topCategory[1])}</strong>. Isso é apenas uma
              observação — você decide o que fazer com essa informação.
            </>
          ) : (
            <>
              Você registrou apenas receitas neste mês. Continue acompanhando
              seus gastos.
            </>
          )}
        </p>
      </section>

      {/* Transações recentes */}
      <section aria-labelledby="recentes">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="recentes" className="font-display text-xl text-foreground">
            Transações recentes
          </h2>
          <Link
            to="/transacoes"
            className="text-sm font-medium text-primary underline underline-offset-2"
          >
            Ver todas
          </Link>
        </div>
        {txQ.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : recent.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma transação ainda. Que tal registrar a primeira?
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center gap-3 p-4">
                <TxIcon type={t.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-foreground">
                    {t.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="sr-only">
                      {t.type === "income" ? "Receita" : "Despesa"} —{" "}
                    </span>
                    {t.category} · {formatDateBR(t.occurred_on)}
                  </p>
                </div>
                <p
                  className={`shrink-0 text-sm font-semibold ${t.type === "income" ? "text-income" : "text-expense"}`}
                >
                  <span className="sr-only">
                    {t.type === "income" ? "mais" : "menos"}{" "}
                  </span>
                  {t.type === "income" ? "+" : "−"} {formatBRL(t.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Metas */}
      <section aria-labelledby="metas">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="metas" className="font-display text-xl text-foreground">
            Suas metas
          </h2>
          <Link
            to="/metas"
            className="text-sm font-medium text-primary underline underline-offset-2"
          >
            Gerenciar
          </Link>
        </div>
        {glQ.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : goals.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma meta criada ainda.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {goals.slice(0, 4).map((g) => {
              const pct = Math.min(
                100,
                Math.round(
                  (Number(g.current_amount) / Number(g.target_amount)) * 100,
                ),
              );
              return (
                <li
                  key={g.id}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <p className="font-medium text-card-foreground">{g.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatBRL(g.current_amount)} de{" "}
                    {formatBRL(g.target_amount)} — <strong>{pct}%</strong>{" "}
                    concluído
                  </p>
                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Meta ${g.name}: ${pct}%`}
                  >
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "income" | "expense" | "positive" | "negative";
}) {
  const color =
    tone === "income"
      ? "text-income"
      : tone === "expense"
        ? "text-expense"
        : tone === "negative"
          ? "text-expense"
          : "text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${color}`}>
        {value}
      </p>
    </div>
  );
}

function TxIcon({ type }: { type: "income" | "expense" }) {
  return (
    <span
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${
        type === "income"
          ? "bg-income/15 text-income"
          : "bg-expense/15 text-expense"
      }`}
      aria-hidden
    >
      {type === "income" ? (
        <ArrowUpRight className="size-5" />
      ) : (
        <ArrowDownRight className="size-5" />
      )}
    </span>
  );
}
