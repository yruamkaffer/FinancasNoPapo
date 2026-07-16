import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const txInputSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive().max(1_000_000_000),
  description: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(60),
  occurred_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const goalInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  target_amount: z.number().positive().max(1_000_000_000),
  current_amount: z.number().min(0).max(1_000_000_000).default(0),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
});

// -------- Transactions --------

export const listTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("transactions")
      .select("*")
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => txInputSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("transactions")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    txInputSchema.extend({ id: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { data: row, error } = await context.supabase
      .from("transactions")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("transactions")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- Goals --------

export const listGoals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => goalInputSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("goals")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    goalInputSchema.extend({ id: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { data: row, error } = await context.supabase
      .from("goals")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("goals").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// -------- AI: interpret a natural-language message --------
// System calculates; AI only interprets and returns structured data.

const partialDraftSchema = z
  .object({
    type: z.enum(["income", "expense"]).nullable().optional(),
    amount: z.number().nullable().optional(),
    description: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    occurred_on: z.string().nullable().optional(),
  })
  .optional();

const historyMsgSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(2000),
});

const aiInputSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  history: z.array(historyMsgSchema).max(20).optional(),
  partial: partialDraftSchema,
});

const EXPENSE_CATS = [
  "Alimentação","Moradia","Transporte","Saúde","Educação","Lazer","Compras","Assinaturas e serviços","Outros",
];
const INCOME_CATS = ["Salário","Freelancer","Vendas","Rendimentos","Outros"];

export const interpretTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => aiInputSchema.parse(i))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI indisponível. Tente novamente em instantes.");

    const systemPrompt = `Você é um assistente que extrai transações financeiras de conversas em português brasileiro (inclusive gírias, erros de digitação e mensagens curtas).

Sua tarefa: combinar TODO o histórico da conversa com a nova mensagem do usuário para preencher um rascunho de transação. Respostas curtas como "foi hoje", "ontem", "no débito", "35 reais" complementam o que já foi dito antes — NUNCA trate a nova mensagem isoladamente.

Retorne SOMENTE um JSON válido:
{
  "status": "ok" | "incomplete" | "unclear",
  "type": "income" | "expense" | null,
  "amount": number | null,
  "description": string | null,
  "category": string | null,
  "occurred_on": "YYYY-MM-DD" | null,
  "missing": string[],
  "explanation": string
}

Regras:
- Hoje é ${data.today}. Interprete "hoje", "ontem", "anteontem", "sexta passada" etc. com base nessa data.
- "gastei", "paguei", "comprei", "torrei" → despesa. "Recebi", "ganhei", "caiu", "entrou" → receita.
- Corrija erros de digitação silenciosamente ("chienlo" → "chinelo", "merkado" → "mercado").
- Se o usuário citou um item (ex.: "chinelo"), use como description mesmo que tipo/valor ainda faltem. Comprar um item físico é despesa por padrão.
- Categorias de despesa permitidas: ${EXPENSE_CATS.join(", ")}.
- Categorias de receita permitidas: ${INCOME_CATS.join(", ")}.
- Se não souber a categoria, use "Outros".
- Só use "ok" quando type, amount, description, category e occurred_on estiverem TODOS preenchidos com dados vindos do usuário (nunca invente valor).
- Se faltar algo, use "incomplete" e liste em "missing" apenas nomes amigáveis dos campos faltantes: "valor", "tipo", "data", "descrição". Em "explanation" faça UMA pergunta curta e natural pedindo só o que falta (ex.: "Quanto custou o chinelo?").
- Use "unclear" apenas se a mensagem nada tem a ver com finanças.
- "explanation" sempre em português, tom acolhedor, no máximo 1 frase.`;

    const historyMessages = (data.history ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const partialSummary = data.partial
      ? `Rascunho parcial já entendido: ${JSON.stringify(data.partial)}`
      : "Rascunho parcial já entendido: (vazio)";

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...historyMessages,
          { role: "system", content: partialSummary },
          { role: "user", content: data.message },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Muitas mensagens seguidas. Aguarde um instante e tente novamente.");
    if (res.status === 402) throw new Error("Sem créditos de IA disponíveis. Adicione créditos para continuar.");
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Erro ao consultar assistente: ${text || res.status}`);
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Não consegui entender a mensagem. Tente reformular.");
    }

    // Merge with previous partial so short follow-ups don't lose earlier info
    const prev = data.partial ?? {};
    const type = (parsed.type as "income" | "expense" | null) ?? prev.type ?? null;
    const amount =
      typeof parsed.amount === "number" && parsed.amount > 0
        ? parsed.amount
        : typeof prev.amount === "number"
          ? prev.amount
          : null;
    const description = (parsed.description as string | null) ?? prev.description ?? null;
    const occurred_on = (parsed.occurred_on as string | null) ?? prev.occurred_on ?? null;

    const cats = type === "income" ? INCOME_CATS : type === "expense" ? EXPENSE_CATS : [];
    let category = (parsed.category as string | null) ?? prev.category ?? null;
    if (category && cats.length && !cats.includes(category)) category = "Outros";
    if (!category && cats.length) category = "Outros";

    const missingLabels: string[] = [];
    if (!type) missingLabels.push("tipo");
    if (!amount) missingLabels.push("valor");
    if (!description) missingLabels.push("descrição");
    if (!occurred_on) missingLabels.push("data");

    const status: "ok" | "incomplete" | "unclear" =
      missingLabels.length === 0
        ? "ok"
        : (parsed.status as string) === "unclear"
          ? "unclear"
          : "incomplete";

    return {
      status,
      type,
      amount,
      description,
      category,
      occurred_on,
      missing: missingLabels,
      explanation: (parsed.explanation as string) ?? "",
    };
  });
