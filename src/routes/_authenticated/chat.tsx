import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  interpretTransaction,
  createTransaction,
} from "@/lib/finance.functions";
import {
  categoriesFor,
  formatBRL,
  formatDateBR,
  todayISO,
} from "@/lib/finance";
import { Send, Sparkles, Check, X, Pencil } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatPage,
});

type Msg =
  | { id: string; role: "assistant" | "user"; kind: "text"; text: string }
  | { id: string; role: "assistant"; kind: "confirm"; draft: Draft }
  | { id: string; role: "assistant"; kind: "saved"; summary: string };

type Draft = {
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  occurred_on: string;
};

type HistoryMessage = {
  role: "assistant" | "user";
  content: string;
};

const SUGGESTIONS = [
  "Gastei R$ 42,90 no mercado ontem",
  "Recebi R$ 1.000 de um freela",
  "Paguei R$ 89,90 de internet hoje",
];

function uid() {
  return Math.random().toString(36).slice(2);
}

const DEFAULT_MESSAGES: Msg[] = [
  {
    id: "welcome",
    role: "assistant",
    kind: "text",
    text: "Oi! Me conte sua movimentação em palavras simples. Por exemplo: “gastei 35 reais no mercado ontem”. Vou te mostrar o que entendi antes de salvar.",
  },
];

const DEMO_MESSAGES: Msg[] = [
  {
    id: "demo-welcome",
    role: "assistant",
    kind: "text",
    text: "Oi! Pode me contar suas movimentações do jeito que você fala. Eu organizo tudo e confirmo com você.",
  },
  {
    id: "demo-salary-user",
    role: "user",
    kind: "text",
    text: "Recebi R$ 5.800 do meu salário no dia 5.",
  },
  {
    id: "demo-salary-saved",
    role: "assistant",
    kind: "saved",
    summary: "Receita de R$ 5.800,00 — Salário mensal",
  },
  {
    id: "demo-market-user",
    role: "user",
    kind: "text",
    text: "Paguei R$ 489,90 no supermercado no sábado.",
  },
  {
    id: "demo-market-saved",
    role: "assistant",
    kind: "saved",
    summary: "Despesa de R$ 489,90 — Supermercado do mês",
  },
  {
    id: "demo-transport-user",
    role: "user",
    kind: "text",
    text: "E também R$ 96,50 de transporte por aplicativo ontem.",
  },
  {
    id: "demo-transport-saved",
    role: "assistant",
    kind: "saved",
    summary: "Despesa de R$ 96,50 — Transporte por aplicativo",
  },
  {
    id: "demo-insight",
    role: "assistant",
    kind: "text",
    text: "Tudo certo! Registrei as movimentações. Seu saldo do mês continua positivo em R$ 4.250,15.",
  },
];

function initialMessages(): Msg[] {
  return import.meta.env.VITE_DEMO_MODE === "true"
    ? DEMO_MESSAGES
    : DEFAULT_MESSAGES;
}

function ChatPage() {
  const interpret = useServerFn(interpretTransaction);
  const create = useServerFn(createTransaction);
  const qc = useQueryClient();

  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [partial, setPartial] = useState<Partial<Draft> | null>(null);
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, [messages]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function send(text: string) {
    const clean = text.trim();
    const hasPendingConfirmation = messages.some(
      (message) => message.kind === "confirm",
    );
    if (!clean || busy || hasPendingConfirmation) return;
    setInput("");
    setMessages((m) => [
      ...m,
      { id: uid(), role: "user", kind: "text", text: clean },
    ]);
    setBusy(true);
    try {
      const res = await interpret({
        data: {
          message: clean,
          today: todayISO(),
          history,
          partial: partial ?? undefined,
        },
      });

      if (
        res.status === "ok" &&
        res.type &&
        res.amount &&
        res.description &&
        res.category &&
        res.occurred_on
      ) {
        const draft: Draft = {
          type: res.type,
          amount: res.amount,
          description: res.description,
          category: res.category,
          occurred_on: res.occurred_on,
        };
        setPartial(null);
        setHistory([]);
        setMessages((m) => [
          ...m,
          { id: uid(), role: "assistant", kind: "confirm", draft },
        ]);
      } else {
        // Save whatever we have so far so the next reply can complete it
        setPartial({
          type: res.type ?? undefined,
          amount: res.amount ?? undefined,
          description: res.description ?? undefined,
          category: res.category ?? undefined,
          occurred_on: res.occurred_on ?? undefined,
        });
        const question =
          res.explanation?.trim() ||
          (res.missing?.length
            ? `Ainda preciso saber: ${res.missing.join(", ")}.`
            : "Pode me contar com um pouco mais de detalhe?");
        if (res.status === "unclear") {
          setPartial(null);
          setHistory([]);
        } else {
          setHistory((current) =>
            [
              ...current,
              { role: "user" as const, content: clean },
              { role: "assistant" as const, content: question },
            ].slice(-12),
          );
        }
        setMessages((m) => [
          ...m,
          { id: uid(), role: "assistant", kind: "text", text: question },
        ]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro inesperado.";
      setMessages((m) => [
        ...m,
        { id: uid(), role: "assistant", kind: "text", text: msg },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  async function confirmDraft(msgId: string, draft: Draft) {
    if (savingId) return;
    setSavingId(msgId);
    try {
      await create({ data: draft });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setPartial(null);
      setMessages((m) =>
        m.map((x) =>
          x.id === msgId
            ? {
                id: x.id,
                role: "assistant",
                kind: "saved",
                summary: `${draft.type === "income" ? "Receita" : "Despesa"} de ${formatBRL(draft.amount)} — ${draft.description}`,
              }
            : x,
        ),
      );
      toast.success("Transação salva.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível salvar.",
      );
    } finally {
      setSavingId(null);
    }
  }

  function cancelDraft(msgId: string) {
    setPartial(null);
    setHistory([]);
    setMessages((m) =>
      m.map((x) =>
        x.id === msgId
          ? {
              id: x.id,
              role: "assistant",
              kind: "text",
              text: "Tudo bem, não salvei nada. Pode me contar de novo?",
            }
          : x,
      ),
    );
  }

  function updateDraft(msgId: string, next: Draft) {
    setMessages((m) =>
      m.map((x) =>
        x.id === msgId && x.kind === "confirm" ? { ...x, draft: next } : x,
      ),
    );
  }

  const hasPendingConfirmation = messages.some(
    (message) => message.kind === "confirm",
  );

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col lg:h-[calc(100dvh-6rem)]">
      <div>
        <h1 className="font-display text-3xl text-foreground">Chat</h1>
        <p className="text-sm text-muted-foreground">
          Conte sua movimentação. Vou mostrar o que entendi antes de salvar.
        </p>
      </div>

      <div
        className="mt-4 flex-1 overflow-x-hidden overflow-y-auto rounded-2xl border border-border bg-card p-4"
        role="log"
        aria-live="polite"
        aria-label="Conversa"
      >
        <ul className="min-w-0 space-y-4">
          {messages.map((m) => (
            <li
              key={m.id}
              className={
                m.role === "user"
                  ? "flex min-w-0 justify-end"
                  : "flex min-w-0 justify-start"
              }
            >
              {m.kind === "text" ? (
                <div
                  className={`min-w-0 max-w-[85%] break-words rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {m.text}
                </div>
              ) : m.kind === "saved" ? (
                <div className="flex min-w-0 max-w-[85%] items-center gap-2 break-words rounded-2xl border border-income/40 bg-income/10 px-4 py-2.5 text-sm text-foreground">
                  <Check className="size-4 text-income" aria-hidden /> Salvo:{" "}
                  {m.summary}
                </div>
              ) : (
                <ConfirmCard
                  draft={m.draft}
                  onChange={(d) => updateDraft(m.id, d)}
                  onConfirm={() => confirmDraft(m.id, m.draft)}
                  onCancel={() => cancelDraft(m.id)}
                  disabled={savingId === m.id}
                />
              )}
            </li>
          ))}
          {busy && (
            <li className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-sm text-secondary-foreground">
                <Sparkles className="size-4 animate-pulse" aria-hidden />{" "}
                Pensando…
              </div>
            </li>
          )}
        </ul>
        <div ref={endRef} />
      </div>

      {/* Sugestões */}
      {messages.length <= 2 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-end gap-2 rounded-2xl border border-border bg-card p-2"
      >
        <label htmlFor="chat-input" className="sr-only">
          Sua mensagem
        </label>
        <textarea
          id="chat-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={2}
          placeholder="Ex: Gastei R$ 35 no mercado ontem"
          className="min-h-11 flex-1 resize-none rounded-lg bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          disabled={busy || hasPendingConfirmation}
        />
        <button
          type="submit"
          disabled={busy || hasPendingConfirmation || !input.trim()}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          aria-label="Enviar mensagem"
        >
          <Send className="size-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}

function ConfirmCard({
  draft,
  onChange,
  onConfirm,
  onCancel,
  disabled,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onConfirm: () => void;
  onCancel: () => void;
  disabled: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const cats = categoriesFor(draft.type);
  const valid =
    Number.isFinite(draft.amount) &&
    draft.amount > 0 &&
    Boolean(draft.description.trim()) &&
    Boolean(draft.category) &&
    /^\d{4}-\d{2}-\d{2}$/.test(draft.occurred_on);

  return (
    <div className="w-full max-w-[92%] rounded-2xl border border-border bg-background p-4">
      <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
        Confira antes de salvar
      </p>
      {!editing ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted-foreground">Tipo</dt>
          <dd className="font-medium">
            {draft.type === "income" ? "Receita" : "Despesa"}
          </dd>
          <dt className="text-muted-foreground">Valor</dt>
          <dd className="font-medium">{formatBRL(draft.amount)}</dd>
          <dt className="text-muted-foreground">Descrição</dt>
          <dd className="font-medium">{draft.description}</dd>
          <dt className="text-muted-foreground">Categoria</dt>
          <dd className="font-medium">{draft.category}</dd>
          <dt className="text-muted-foreground">Data</dt>
          <dd className="font-medium">{formatDateBR(draft.occurred_on)}</dd>
        </dl>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Tipo">
            <select
              value={draft.type}
              onChange={(e) =>
                onChange({
                  ...draft,
                  type: e.target.value as "income" | "expense",
                  category: categoriesFor(
                    e.target.value as "income" | "expense",
                  )[0],
                })
              }
              className="w-full rounded-lg border border-input bg-background px-2 py-2 text-sm"
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </Field>
          <Field label="Valor (R$)">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={draft.amount}
              onChange={(e) =>
                onChange({ ...draft, amount: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-input bg-background px-2 py-2 text-sm"
            />
          </Field>
          <Field label="Descrição">
            <input
              type="text"
              value={draft.description}
              onChange={(e) =>
                onChange({ ...draft, description: e.target.value })
              }
              className="w-full rounded-lg border border-input bg-background px-2 py-2 text-sm"
            />
          </Field>
          <Field label="Categoria">
            <select
              value={draft.category}
              onChange={(e) => onChange({ ...draft, category: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-2 py-2 text-sm"
            >
              {cats.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data">
            <input
              type="date"
              value={draft.occurred_on}
              onChange={(e) =>
                onChange({ ...draft, occurred_on: e.target.value })
              }
              className="w-full rounded-lg border border-input bg-background px-2 py-2 text-sm"
            />
          </Field>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled || !valid}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Check className="size-4" aria-hidden />{" "}
          {disabled ? "Salvando…" : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-secondary"
        >
          <Pencil className="size-4" aria-hidden />{" "}
          {editing ? "Concluir edição" : "Corrigir"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-secondary"
        >
          <X className="size-4" aria-hidden /> Cancelar
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
