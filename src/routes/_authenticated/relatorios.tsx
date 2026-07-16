import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { listTransactions } from "@/lib/finance.functions";
import { formatBRL } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/relatorios")({
  component: ReportsPage,
});

type Period = "current" | "last" | "3m" | "all";

function periodStart(p: Period): string | null {
  const now = new Date();
  if (p === "current") {
    return isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }
  if (p === "last") {
    return isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  }
  if (p === "3m") {
    return isoDate(new Date(now.getFullYear(), now.getMonth() - 2, 1));
  }
  return null;
}

function periodEnd(p: Period): string | null {
  const now = new Date();
  if (p === "last") {
    return isoDate(new Date(now.getFullYear(), now.getMonth(), 0));
  }
  return null;
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ReportsPage() {
  const list = useServerFn(listTransactions);
  const q = useQuery({ queryKey: ["transactions"], queryFn: () => list() });
  const [period, setPeriod] = useState<Period>("current");
  const [view, setView] = useState<"chart" | "table">("chart");

  const filtered = useMemo(() => {
    const start = periodStart(period);
    const end = periodEnd(period);
    return (q.data ?? []).filter((t) => {
      if (start && t.occurred_on < start) return false;
      if (end && t.occurred_on > end) return false;
      return true;
    });
  }, [q.data, period]);

  const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of filtered.filter((t) => t.type === "expense")) {
      map[t.category] = (map[t.category] ?? 0) + Number(t.amount);
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const totalExpense = byCategory.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl text-foreground">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Veja para onde o dinheiro foi. Todos os números também aparecem em texto.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="p" className="mb-1 block text-xs font-medium text-muted-foreground">Período</label>
          <select id="p" value={period} onChange={(e) => setPeriod(e.target.value as Period)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="current">Este mês</option>
            <option value="last">Mês passado</option>
            <option value="3m">Últimos 3 meses</option>
            <option value="all">Tudo</option>
          </select>
        </div>
        <fieldset>
          <legend className="mb-1 text-xs font-medium text-muted-foreground">Visualização</legend>
          <div className="inline-flex overflow-hidden rounded-lg border border-input">
            {(["chart", "table"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`px-3 py-2 text-sm font-medium ${view === v ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-secondary"}`}>
                {v === "chart" ? "Gráfico" : "Tabela"}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Resumo */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Receitas" value={formatBRL(income)} />
        <SummaryCard label="Despesas" value={formatBRL(expense)} />
        <SummaryCard label="Saldo" value={formatBRL(balance)} highlight={balance >= 0 ? "positive" : "negative"} />
      </div>

      {/* Gastos por categoria */}
      <section aria-labelledby="cats">
        <h2 id="cats" className="mb-3 font-display text-xl text-foreground">Gastos por categoria</h2>
        {q.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : byCategory.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma despesa registrada no período.
          </p>
        ) : view === "chart" ? (
          <ul className="space-y-3" aria-label="Gráfico de barras por categoria">
            {byCategory.map(([cat, val]) => {
              const pct = totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0;
              return (
                <li key={cat}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-foreground">{cat}</span>
                    <span className="text-muted-foreground">
                      {formatBRL(val)} — <strong>{pct}%</strong>
                    </span>
                  </div>
                  <div
                    className="mt-1 h-3 overflow-hidden rounded-full bg-secondary"
                    role="progressbar"
                    aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                    aria-label={`${cat}: ${pct} por cento das despesas, ${formatBRL(val)}`}
                  >
                    <div className="h-full bg-expense" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <caption className="sr-only">Gastos por categoria</caption>
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  <th scope="col" className="p-3 text-left">Categoria</th>
                  <th scope="col" className="p-3 text-right">Valor</th>
                  <th scope="col" className="p-3 text-right">% do total</th>
                </tr>
              </thead>
              <tbody>
                {byCategory.map(([cat, val]) => {
                  const pct = totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0;
                  return (
                    <tr key={cat} className="border-t border-border">
                      <td className="p-3 font-medium">{cat}</td>
                      <td className="p-3 text-right">{formatBRL(val)}</td>
                      <td className="p-3 text-right">{pct}%</td>
                    </tr>
                  );
                })}
                <tr className="border-t border-border bg-secondary/40 font-medium">
                  <td className="p-3">Total</td>
                  <td className="p-3 text-right">{formatBRL(totalExpense)}</td>
                  <td className="p-3 text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Maiores despesas */}
      <section aria-labelledby="top">
        <h2 id="top" className="mb-3 font-display text-xl text-foreground">Maiores despesas do período</h2>
        {filtered.filter((t) => t.type === "expense").length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Sem despesas neste período.
          </p>
        ) : (
          <ol className="divide-y divide-border rounded-2xl border border-border bg-card">
            {filtered
              .filter((t) => t.type === "expense")
              .sort((a, b) => Number(b.amount) - Number(a.amount))
              .slice(0, 5)
              .map((t, i) => (
                <li key={t.id} className="flex items-center justify-between gap-3 p-4">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{t.description}</span>
                      <span className="text-xs text-muted-foreground">{t.category}</span>
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold text-expense">− {formatBRL(t.amount)}</span>
                </li>
              ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: "positive" | "negative" }) {
  const color = highlight === "positive" ? "text-income" : highlight === "negative" ? "text-expense" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
