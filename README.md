# Finanças no Papo

Aplicação web de finanças pessoais para registrar receitas, despesas e metas por formulário ou por conversa em português brasileiro.

## Recursos

- autenticação por e-mail/senha e Google com Supabase Auth;
- registro e edição de transações;
- chat que interpreta movimentações com a API Gemini;
- confirmação humana antes de salvar uma transação sugerida pela IA;
- metas financeiras, resumo mensal e relatórios por categoria;
- Row Level Security (RLS) para isolar os dados de cada usuário.

## Tecnologias

- React 19 e TanStack Start;
- TypeScript, Vite e Tailwind CSS;
- Supabase (Auth e Postgres);
- Gemini API para extração estruturada das transações.

## Configuração local

Requisitos: Node.js 22 ou superior e um projeto Supabase.

```bash
npm ci
copy .env.example .env
npm run dev
```

Preencha o `.env` com:

- `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` para o navegador;
- `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` para as funções do servidor;
- `GEMINI_API_KEY` para o chat;
- `GEMINI_MODEL` opcionalmente (o padrão é `gemini-2.5-flash`).

Nunca use uma chave `service_role` ou `sb_secret_...` em variáveis iniciadas por `VITE_`.

## Banco de dados

As migrations estão em `supabase/migrations`. Aplique-as pelo fluxo do Supabase CLI usado no seu ambiente.

Para o login Google, habilite o provedor no Supabase, configure o Client ID/Secret do Google e adicione as URLs da aplicação à lista de redirecionamentos permitidos. O fluxo retorna para `/inicio`.

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

O chat usa saída JSON estruturada e valida novamente todos os campos no servidor. A IA nunca grava diretamente: o usuário sempre revisa e confirma o rascunho.

## Segurança

- chaves privadas da IA ficam apenas no servidor;
- todas as funções financeiras exigem um token válido;
- consultas e mutações são limitadas ao usuário autenticado;
- as tabelas públicas têm RLS e políticas de propriedade;
- respostas de serviços externos não são repassadas integralmente para a interface.
