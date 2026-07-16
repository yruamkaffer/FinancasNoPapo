import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/finance.functions";
import {
  categoriesFor, formatBRL, formatDateBR, todayISO,
  EXPENSE_CATEGORIES, INCOME_CATEGORIES,
} from "@/lib/finance";
import { ArrowDownRight, ArrowUpRight, Pencil, Plus, Trash2, X } from "lucide-react";

const searchSchema = z.object({ novo: z.coerce.number().optional() });

export const Route = createFileRoute("/_authenticated/transacoes")({
  validateSearch: (s: Record<string, unknown>) => searchSchema.parse(s),
  component: TransactionsPage,
});

type Tx = {
  id: string;
  type: "income" | "expense";
  amount: number | string;
  description: string;
  category: string;
  occurred_on: string;
};

function TransactionsPage() {
  const { novo } = Route.useSearch();
  const list = useServerFn(listTransactions);
  const q = useQuery({ queryKey: ["transactions"], queryFn: () => list() });

  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState<Boolean>(Boolean(novo));
  const [editing, setEditing] = useState<Tx | null>(null);

  const data = q.data ?? [];
  const filtered = useMemo(() => {
    return data.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterCat !== "all" && t.category !== filterCat) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data, filterType, filterCat, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">Transações</h1>
          <p className="text-sm text-muted-foreground">Todas as suas receitas e despesas.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden /> Nova transação
        </button>
      </div>

      {/* Filtros */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="f-type" className="mb-1 block text-xs font-medium text-muted-foreground">Tipo</label>
          <select id="f-type" value={filterType} onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="all">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-cat" className="mb-1 block text-xs font-medium text-muted-foreground">Categoria</label>
          <select id="f-cat" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="all">Todas</option>
            <optgroup label="Despesas">
              {EXPENSE_CATEGORIES.map((c) => <option key={"e-" + c} value={c}>{c}</option>)}
            </optgroup>
            <optgroup label="Receitas">
              {INCOME_CATEGORIES.map((c) => <option key={"i-" + c} value={c}>{c}</option>)}
            </optgroup>
          </select>
        </div>
        <div>
          <label htmlFor="f-q" className="mb-1 block text-xs font-medium text-muted-foreground">Buscar</label>
          <input id="f-q" type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Descrição…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Lista */}
      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhuma transação encontrada.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card" aria-label="Lista de transações">
          {filtered.map((t) => (
            <TxRow key={t.id} tx={t as Tx} onEdit={() => { setEditing(t as Tx); setShowForm(true); }} />
          ))}
        </ul>
      )}

      {showForm && (
        <TxDialog
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function TxRow({ tx, onEdit }: { tx: Tx; onEdit: () => void }) {
  const del = useServerFn(deleteTransaction);
  const qc = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    try {
      await del({ data: { id: tx.id } });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transação excluída.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  }

  return (
    <li className="flex items-center gap-3 p-4">
      <span
        className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${
          tx.type === "income" ? "bg-income/15 text-income" : "bg-expense/15 text-expense"
        }`}
        aria-hidden
      >
        {tx.type === "income" ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-card-foreground">
          <span className="sr-only">{tx.type === "income" ? "Receita: " : "Despesa: "}</span>
          {tx.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {tx.category} · {formatDateBR(tx.occurred_on)}
        </p>
      </div>
      <p className={`shrink-0 text-sm font-semibold ${tx.type === "income" ? "text-income" : "text-expense"}`}>
        {tx.type === "income" ? "+" : "−"} {formatBRL(tx.amount)}
      </p>
      <div className="ml-1 flex shrink-0 gap-1">
        <button onClick={onEdit}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-input bg-background hover:bg-secondary"
          aria-label={`Editar ${tx.description}`}>
          <Pencil className="size-4" aria-hidden />
        </button>
        <button onClick={() => setConfirming(true)}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-input bg-background hover:bg-secondary"
          aria-label={`Excluir ${tx.description}`}>
          <Trash2 className="size-4 text-destructive" aria-hidden />
        </button>
      </div>

      {confirming && (
        <div role="dialog" aria-modal="true" aria-labelledby={`del-${tx.id}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg">
            <h2 id={`del-${tx.id}`} className="font-display text-lg text-card-foreground">Excluir transação?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tx.description} — {formatBRL(tx.amount)}. Essa ação não pode ser desfeita.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setConfirming(false)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-secondary">Cancelar</button>
              <button onClick={() => { setConfirming(false); handleDelete(); }}
                className="rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function TxDialog({ initial, onClose }: { initial: Tx | null; onClose: () => void }) {
  const create = useServerFn(createTransaction);
  const update = useServerFn(updateTransaction);
  const qc = useQueryClient();

  const [type, setType] = useState<"income" | "expense">(initial?.type ?? "expense");
  const [amount, setAmount] = useState<string>(initial ? String(initial.amount) : "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? categoriesFor(initial?.type ?? "expense")[0]);
  const [occurredOn, setOccurredOn] = useState(initial?.occurred_on ?? todayISO());
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount.replace(",", "."));
    if (!amt || amt <= 0) { toast.error("Informe um valor maior que zero."); return; }
    if (!description.trim()) { toast.error("Informe uma descrição."); return; }
    setSaving(true);
    try {
      const payload = { type, amount: amt, description: description.trim(), category, occurred_on: occurredOn };
      if (initial) {
        await update({ data: { id: initial.id, ...payload } });
        toast.success("Transação atualizada.");
      } else {
        await create({ data: payload });
        toast.success("Transação criada.");
      }
      qc.invalidateQueries({ queryKey: ["transactions"] });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="tx-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4">
      <form onSubmit={submit}
        className="w-full max-w-lg rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <h2 id="tx-title" className="font-display text-xl text-card-foreground">
            {initial ? "Editar transação" : "Nova transação"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar"
            className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-secondary">
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <fieldset className="col-span-full">
            <legend className="mb-2 text-xs font-medium text-muted-foreground">Tipo</legend>
            <div className="flex gap-2">
              {(["expense", "income"] as const).map((t) => (
                <label key={t}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
                    type === t ? "border-primary bg-primary/10 text-primary" : "border-input bg-background text-foreground"
                  }`}>
                  <input type="radio" name="tx-type" value={t} checked={type === t}
                    onChange={() => { setType(t); setCategory(categoriesFor(t)[0]); }} className="sr-only" />
                  {t === "expense" ? "Despesa" : "Receita"}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="amt" className="mb-1 block text-xs font-medium text-muted-foreground">Valor (R$)</label>
            <input id="amt" type="number" step="0.01" min="0.01" required value={amount}
              onChange={(e) => setAmount(e.target.value)} inputMode="decimal"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>

          <div>
            <label htmlFor="date" className="mb-1 block text-xs font-medium text-muted-foreground">Data</label>
            <input id="date" type="date" required value={occurredOn}
              onChange={(e) => setOccurredOn(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>

          <div className="col-span-full">
            <label htmlFor="desc" className="mb-1 block text-xs font-medium text-muted-foreground">Descrição</label>
            <input id="desc" type="text" required maxLength={200} value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>

          <div className="col-span-full">
            <label htmlFor="cat" className="mb-1 block text-xs font-medium text-muted-foreground">Categoria</label>
            <select id="cat" value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
              {categoriesFor(type).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {saving ? "Salvando…" : initial ? "Salvar alterações" : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
