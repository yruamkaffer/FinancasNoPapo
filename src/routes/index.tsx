import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquareText, KeyboardIcon, Sparkles, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <main id="conteudo" className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <p className="font-display text-xl font-semibold text-primary">
          Finanças no Papo
        </p>
        <nav aria-label="Acesso">
          <Link
            to="/auth"
            className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Entrar
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-16 pt-8 text-center sm:pt-16">
        <p className="mb-4 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wider text-secondary-foreground">
          Controle financeiro em conversa
        </p>
        <h1 className="font-display text-4xl leading-tight text-foreground sm:text-6xl">
          Seu dinheiro,{" "}
          <span className="text-primary">contado do seu jeito</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Registre receitas e despesas conversando naturalmente — ou pela
          interface simples, se preferir. Sem planilhas, sem termos técnicos,
          feito para todo mundo.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            Criar minha conta
          </Link>
          <Link
            to="/auth"
            className="rounded-lg border border-input bg-background px-6 py-3 text-base font-medium text-foreground hover:bg-secondary"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      <section aria-labelledby="como-funciona" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 id="como-funciona" className="font-display text-2xl text-foreground sm:text-3xl">
          Como funciona
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MessageSquareText, title: "Escreva com naturalidade", body: "\"Gastei R$ 42 no mercado ontem.\" O assistente entende e organiza." },
            { icon: KeyboardIcon, title: "Ou use o formulário", body: "Prefere digitar em campos? Está tudo disponível também, sem chat." },
            { icon: Target, title: "Metas simples", body: "Guarde para o que importa. Veja o progresso em texto e porcentagem." },
            { icon: Sparkles, title: "Observações do Agente", body: "Explicações educativas com base nos seus próprios dados." },
          ].map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-2xl border border-border bg-card p-5">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg text-card-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-border bg-secondary/40 py-8">
        <p className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          Finanças no Papo — feito com Design Universal. Nenhuma informação
          aqui é aconselhamento financeiro profissional.
        </p>
      </footer>
    </main>
  );
}
