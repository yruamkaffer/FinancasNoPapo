import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { listGoals, createGoal, updateGoal, deleteGoal } from "@/lib/finance.functions";
import { formatBRL, formatDateBR } from "@/lib/finance";
import { Plus, Pencil, Trash2, X, Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/metas")({
  component: GoalsPage,
});

type Goal = {
  id: string;
  name: string;
  target_amount: number | string;
  current_amount: number | string;
  deadline: string | null;
};

function GoalsPage() {
  const list = useServerFn(listGoals);
  const q = useQuery({ queryKey: ["goals"], queryFn: () => list() });
  const [editing, setEditing] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(false);

  const goals = (q.data ?? []) as Goal[];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">Metas</h1>
          <p className="text-sm text-muted-foreground">Guarde dinheiro para o que importa.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="size-4" aria-hidden /> Nova meta
        </button>
      </div>

      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : goals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Target className="mx-auto size-8 text-muted-foreground" aria-hidden />
          <p className="mt-3 text-sm text-muted-foreground">Você ainda não tem metas. Crie a primeira.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g}
              onEdit={() => { setEditing(g); setShowForm(true); }} />
          ))}
        </ul>
      )}

      {showForm && <GoalDialog initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function GoalCard({ goal, onEdit }: { goal: Goal; onEdit: () => void }) {
  const del = useServerFn(deleteGoal);
  const update = useServerFn(updateGoal);
  const qc = useQueryClient();
  const [addAmt, setAddAmt] = useState("");
  const [confirming, setConfirming] = useState(false);

  const target = Number(goal.target_amount);
  const current = Number(goal.current_amount);
  const remaining = Math.max(0, target - current);
  const pct = Math.min(100, Math.round((current / target) * 100));

  async function handleDelete() {
    try {
      await del({ data: { id: goal.id } });
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Meta excluída.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(addAmt.replace(",", "."));
    if (!v || v <= 0) return;
    try {
      await update({ data: {
        id: goal.id, name: goal.name, target_amount: target,
        current_amount: current + v, deadline: goal.deadline,
      }});
      qc.invalidateQueries({ queryKey: ["goals"] });
      setAddAmt("");
      toast.success("Progresso atualizado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar.");
    }
  }

  return (
    <li className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-lg text-card-foreground">{goal.name}</h2>
          {goal.deadline && (
            <p className="text-xs text-muted-foreground">Prazo: {formatDateBR(goal.deadline)}</p>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-input bg-background hover:bg-secondary"
            aria-label={`Editar ${goal.name}`}>
            <Pencil className="size-4" aria-hidden />
          </button>
          <button onClick={() => setConfirming(true)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-input bg-background hover:bg-secondary"
            aria-label={`Excluir ${goal.name}`}>
            <Trash2 className="size-4 text-destructive" aria-hidden />
          </button>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Guardado</dt>
          <dd className="font-medium text-foreground">{formatBRL(current)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Meta</dt>
          <dd className="font-medium text-foreground">{formatBRL(target)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Restam</dt>
          <dd className="font-medium text-foreground">{formatBRL(remaining)}</dd>
        </div>
      </dl>

      <p className="mt-3 text-sm">
        <strong>{pct}%</strong> concluído
      </p>
      <div
        className="mt-1 h-2 overflow-hidden rounded-full bg-secondary"
        role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
        aria-label={`Progresso de ${goal.name}: ${pct}%`}
      >
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>

      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <label htmlFor={`add-${goal.id}`} className="sr-only">Adicionar valor à meta</label>
        <input id={`add-${goal.id}`} type="number" step="0.01" min="0.01"
          placeholder="Adicionar R$"
          value={addAmt} onChange={(e) => setAddAmt(e.target.value)}
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        <button type="submit"
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Somar
        </button>
      </form>

      {confirming && (
        <div role="dialog" aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg">
            <h3 className="font-display text-lg text-card-foreground">Excluir meta?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {goal.name}. Essa ação não pode ser desfeita.
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

function GoalDialog({ initial, onClose }: { initial: Goal | null; onClose: () => void }) {
  const create = useServerFn(createGoal);
  const update = useServerFn(updateGoal);
  const qc = useQueryClient();

  const [name, setName] = useState(initial?.name ?? "");
  const [target, setTarget] = useState(initial ? String(initial.target_amount) : "");
  const [current, setCurrent] = useState(initial ? String(initial.current_amount) : "0");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = Number(target.replace(",", "."));
    const c = Number(current.replace(",", "."));
    if (!name.trim() || !t || t <= 0) { toast.error("Informe nome e valor da meta."); return; }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        target_amount: t,
        current_amount: c || 0,
        deadline: deadline || null,
      };
      if (initial) {
        await update({ data: { id: initial.id, ...payload } });
        toast.success("Meta atualizada.");
      } else {
        await create({ data: payload });
        toast.success("Meta criada.");
      }
      qc.invalidateQueries({ queryKey: ["goals"] });
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="goal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4">
      <form onSubmit={submit}
        className="w-full max-w-lg rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <h2 id="goal-title" className="font-display text-xl text-card-foreground">
            {initial ? "Editar meta" : "Nova meta"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar"
            className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-secondary">
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="col-span-full">
            <label htmlFor="g-name" className="mb-1 block text-xs font-medium text-muted-foreground">Nome da meta</label>
            <input id="g-name" type="text" required maxLength={100} value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Reserva de emergência"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="g-target" className="mb-1 block text-xs font-medium text-muted-foreground">Valor da meta (R$)</label>
            <input id="g-target" type="number" step="0.01" min="0.01" required value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="g-current" className="mb-1 block text-xs font-medium text-muted-foreground">Já guardado (R$)</label>
            <input id="g-current" type="number" step="0.01" min="0" value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="col-span-full">
            <label htmlFor="g-deadline" className="mb-1 block text-xs font-medium text-muted-foreground">
              Prazo (opcional)
            </label>
            <input id="g-deadline" type="date" value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {saving ? "Salvando…" : initial ? "Salvar" : "Criar meta"}
          </button>
        </div>
      </form>
    </div>
  );
}
