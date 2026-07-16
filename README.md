# 💸 App de Organização de Finanças Pessoais com Vibe Coding

Aprendi a **criar soluções com IA** de forma criativa, guiando ferramentas como o **ChatGPT** e o **Lovable** com uma comunicação simples e natural. O foco é desenvolver o conceito de um **App de Organização de Finanças Pessoais**, mas, acima de tudo, aprender o **jeito Vibe de programar com IA**.

## 🎯 Desafio

Problema: Muitas pessoas não conseguem manter um controle financeiro porque os aplicativos exigem muita entrada de dados manual, e a criação de orçamentos é vista como algo tedioso. 

Precisamos de uma solução que permita **controlar as finanças por meio de uma conversa simples**, com **agentes de IA** capazes de criar **planos de economia personalizados e automatizados**. Você deve utilizar as ideias de **Vibe Coding** e **MVP (Produto Mínimo Viável)** para desenvolver o **conceito de um aplicativo** que resolva o problema citado.

> [!IMPORTANT]
> Você **não precisa construir o código**! O foco está em **usar a IA como sua parceira criativa**, transformando boas ideias e prompts em conceitos funcionais que simulam um produto real.

## 🪄 Etapas do Desafio

### 1. Saber o que Pedir é a Chave! Otimize seus Prompts!

Antes de pedir para a IA "criar um app", é importante definir com clareza o que você quer construir e por quê. Para isso, você vai criar um **PRD (Product Requirements Document)** simplificado, uma especificação que serve como _briefing_ para a IA entender sua ideia.

Um bom PRD deve descrever o problema, quem será beneficiado, as principais funcionalidades e o que você espera que a IA entregue. **Prompt final** (PRD) gerado pela IA com base no modelo apresentado em aula:

```txt
# PRD - Assistente de Finanças Pessoais

## 1. Informações gerais

Nome provisório: Finanças no Papo

Versão: 1.0

Etapa: MVP

Plataforma inicial: Aplicação web responsiva

Idioma: Português do Brasil

Moeda inicial: Real brasileiro (BRL)


## 2. Contexto

O produto será uma aplicação de organização financeira pessoal que permitirá registrar receitas e despesas por meio de conversas em linguagem natural.

A proposta é facilitar o controle financeiro para pessoas que não gostam de planilhas ou aplicativos complexos.

Exemplos de mensagens:

- "Gastei R$ 42,90 no mercado ontem."
- "Recebi R$ 1.000 de um trabalho freelancer."
- "Paguei R$ 89,90 de internet hoje."
- "Quero guardar R$ 5.000 até dezembro."

A aplicação deverá interpretar as mensagens, apresentar os dados identificados e solicitar a confirmação do usuário antes de salvar qualquer informação.


## 3. Problema

Muitas pessoas começam a controlar suas finanças, mas abandonam o hábito porque os aplicativos tradicionais exigem:

- Preenchimento de muitos campos.
- Classificação manual das transações.
- Conhecimento prévio sobre finanças.
- Navegação por relatórios difíceis de entender.
- Interações pouco personalizadas.
- Interfaces que não consideram diferentes necessidades de acessibilidade.

A hipótese do produto é:

"Se o usuário puder registrar suas movimentações conversando naturalmente e receber informações fáceis de compreender, ele terá menos esforço e mais chances de manter o hábito de controlar suas finanças."


## 4. Público-alvo

O produto será desenvolvido principalmente para pessoas que:

- Estão começando a organizar suas finanças.
- Não gostam ou não sabem utilizar planilhas.
- Possuem pouco conhecimento financeiro.
- Querem entender para onde o dinheiro está indo.
- Preferem uma experiência simples e educativa.
- Possuem pouca familiaridade com tecnologia.
- Podem precisar de recursos de acessibilidade.

O MVP não será direcionado inicialmente para:

- Empresas.
- Contadores.
- Investidores profissionais.
- Usuários que necessitem de controles contábeis avançados.


## 5. Proposta de valor

Permitir que o usuário organize sua vida financeira conversando com um assistente que:

- Entende receitas e despesas escritas naturalmente.
- Classifica automaticamente as transações.
- Apresenta um resumo financeiro fácil de compreender.
- Ajuda no acompanhamento de metas.
- Oferece observações baseadas nos dados registrados.
- Explica conceitos financeiros com linguagem acessível.
- Pode ser utilizado por pessoas com diferentes necessidades e níveis de experiência.


## 6. Princípio de Design Universal

A solução deverá ser desenvolvida com base em Design Universal.

O objetivo é oferecer uma experiência simples, segura e agradável para a maior diversidade possível de usuários, sem exigir versões separadas sempre que isso puder ser evitado.

O produto deverá considerar pessoas com:

- Diferentes níveis de conhecimento financeiro.
- Diferentes níveis de familiaridade com tecnologia.
- Deficiências visuais, auditivas, motoras ou cognitivas.
- Limitações temporárias ou situacionais.
- Dificuldade de leitura ou compreensão de termos técnicos.
- Idade avançada.
- Diferentes dispositivos e tamanhos de tela.
- Diferentes formas de interação, como teclado, mouse, toque ou tecnologias assistivas.

O Design Universal deverá ser considerado desde o início do desenvolvimento, e não somente como uma adaptação posterior.

A conversa será a principal maneira de registrar movimentações, mas não deverá ser a única.

O usuário também deverá conseguir registrar, conferir e corrigir informações utilizando uma interface estruturada, simples e acessível.

A aplicação deverá buscar conformidade com as diretrizes da WCAG 2.2 no nível AA.


## 7. Objetivos do MVP

O MVP deverá permitir que o usuário:

1. Crie uma conta e mantenha seus dados salvos.
2. Registre receitas e despesas pelo chat.
3. Registre receitas e despesas por uma interface estruturada alternativa.
4. Confirme ou corrija as informações interpretadas.
5. Consulte, edite e exclua transações.
6. Visualize receitas, despesas e saldo do mês.
7. Crie e acompanhe metas financeiras.
8. Consulte relatórios financeiros simples.
9. Receba observações educativas do Agente Financeiro.
10. Utilize os principais recursos com diferentes dispositivos e formas de interação.
11. Compreenda as informações sem depender exclusivamente de cores, gráficos ou termos técnicos.


## 8. Escopo funcional do MVP

### RF-01 - Cadastro e acesso

O usuário deverá conseguir:

- Criar uma conta.
- Entrar no aplicativo.
- Sair do aplicativo.
- Recuperar sua sessão ao retornar.
- Visualizar somente seus próprios dados.

Para um primeiro protótipo visual, o login poderá ser simulado.

Antes da disponibilização para usuários reais, a autenticação deverá estar funcionando corretamente.


### RF-02 - Registro de transações pelo chat

O usuário poderá escrever uma movimentação financeira em linguagem natural.

A inteligência artificial deverá identificar:

- Tipo da movimentação: receita ou despesa.
- Valor.
- Descrição.
- Categoria.
- Data da transação.

Exemplo de mensagem:

"Gastei 35 reais no mercado ontem."

Resultado esperado:

- Tipo: Despesa.
- Valor: R$ 35,00.
- Descrição: Mercado.
- Categoria: Alimentação.
- Data: Dia anterior.

Antes de salvar, o aplicativo deverá apresentar um cartão de confirmação com as informações interpretadas.

O usuário poderá:

- Confirmar o lançamento.
- Corrigir as informações.
- Cancelar o lançamento.

Nenhuma transação deverá ser salva sem a confirmação do usuário.

Se alguma informação obrigatória estiver faltando, o assistente deverá perguntar somente o que precisa.

Exemplo:

Usuário: "Paguei a internet."

Assistente: "Qual foi o valor do pagamento?"


### RF-03 - Registro alternativo de transações

O chat será a principal forma de registro, mas o usuário também poderá utilizar uma interface estruturada.

Essa interface deverá ser simples e conter apenas os campos necessários:

- Tipo da movimentação.
- Valor.
- Descrição.
- Categoria.
- Data.

Essa alternativa deverá estar disponível para usuários que:

- Preferem não utilizar o chat.
- Utilizam tecnologias assistivas.
- Encontram dificuldades na interpretação de linguagem natural.
- Desejam corrigir informações manualmente.


### RF-04 - Classificação automática

Categorias iniciais de despesas:

- Alimentação.
- Moradia.
- Transporte.
- Saúde.
- Educação.
- Lazer.
- Compras.
- Assinaturas e serviços.
- Outros.

Categorias iniciais de receitas:

- Salário.
- Freelancer.
- Vendas.
- Rendimentos.
- Outros.

Caso a inteligência artificial não consiga determinar uma categoria, deverá utilizar "Outros".

O usuário poderá alterar a categoria antes ou depois de confirmar a transação.


### RF-05 - Dashboard financeiro

A tela inicial deverá apresentar:

- Saldo do período.
- Total de receitas.
- Total de despesas.
- Categoria com maior gasto.
- Transações recentes.
- Progresso das metas.
- Observação do Agente Financeiro.
- Acesso rápido ao registro pelo chat.
- Acesso rápido ao registro estruturado.

O período padrão será o mês atual.

Os cálculos financeiros deverão ser realizados pelo sistema, e não pela inteligência artificial.


### RF-06 - Gerenciamento de transações

O usuário deverá conseguir:

- Visualizar todas as transações.
- Filtrar por período.
- Filtrar por tipo.
- Filtrar por categoria.
- Editar uma transação.
- Excluir uma transação mediante confirmação.
- Identificar receitas e despesas de forma clara.

As receitas e despesas não poderão ser diferenciadas somente pela cor.

Também deverão possuir:

- Ícones.
- Textos.
- Símbolos.
- Identificações acessíveis para leitores de tela.

Qualquer alteração deverá atualizar automaticamente o dashboard e os relatórios.


### RF-07 - Metas financeiras

O usuário poderá criar uma meta informando:

- Nome da meta.
- Valor desejado.
- Valor já acumulado.
- Prazo opcional.

Exemplo:

"Reserva de emergência: guardar R$ 5.000 até dezembro."

O aplicativo deverá apresentar:

- Valor desejado.
- Valor acumulado.
- Valor restante.
- Percentual concluído.
- Prazo da meta.

O progresso não poderá ser comunicado somente por uma barra visual.

O percentual e os valores também deverão ser apresentados em texto.

No MVP, o progresso poderá ser atualizado manualmente.

A vinculação automática entre transações e metas ficará para versões futuras.


### RF-08 - Agente Financeiro

O Agente Financeiro deverá apresentar observações baseadas exclusivamente nos dados registrados pelo usuário.

Exemplos:

- "Alimentação foi sua maior categoria de gastos neste mês."
- "Seus gastos com assinaturas somaram R$ 149,70."
- "Você já completou 60% da sua meta de reserva."

O agente deverá:

- Utilizar linguagem simples.
- Explicar termos financeiros quando necessário.
- Evitar julgamentos sobre os hábitos do usuário.
- Explicar quais dados originaram a observação.
- Informar quando não houver dados suficientes.
- Não inventar valores ou movimentações.
- Não recomendar investimentos específicos.
- Não prometer ganhos ou resultados financeiros.
- Não apresentar suas respostas como aconselhamento financeiro profissional.

A inteligência artificial poderá redigir as explicações, mas os valores deverão ser previamente calculados e validados pelo sistema.


### RF-09 - Relatórios financeiros

O usuário deverá conseguir visualizar:

- Receitas do período.
- Despesas do período.
- Saldo.
- Gastos por categoria.
- Maiores despesas.
- Evolução mensal, quando houver dados suficientes.

Os relatórios deverão utilizar:

- Gráficos simples.
- Textos explicativos.
- Resumos em números.
- Visualização alternativa em lista ou tabela.

Nenhuma informação deverá depender exclusivamente da interpretação de um gráfico.


## 9. Principais telas

### 9.1. Boas-vindas e acesso

Elementos principais:

- Apresentação resumida do produto.
- Botão para criar conta.
- Botão para entrar.
- Explicação simples sobre o funcionamento.


### 9.2. Onboarding

O onboarding deverá:

- Explicar como registrar receitas e despesas.
- Mostrar exemplos de mensagens.
- Informar que o usuário poderá revisar tudo antes de salvar.
- Apresentar a opção de registro sem utilizar o chat.
- Ser curto e permitir que o usuário pule as explicações.


### 9.3. Início

Elementos principais:

- Saldo do mês.
- Total de receitas.
- Total de despesas.
- Campo de registro pelo chat.
- Botão para registro estruturado.
- Transações recentes.
- Metas.
- Observação do Agente Financeiro.


### 9.4. Chat

Elementos principais:

- Histórico da conversa.
- Campo de mensagem.
- Botão para enviar.
- Sugestões de mensagens.
- Cartão para confirmar uma transação.
- Opções para editar ou cancelar.
- Mensagens de carregamento e erro.


### 9.5. Transações

Elementos principais:

- Lista de receitas e despesas.
- Filtros.
- Pesquisa.
- Edição.
- Exclusão.
- Identificação textual do tipo da movimentação.


### 9.6. Metas

Elementos principais:

- Lista de metas.
- Criação de uma nova meta.
- Edição.
- Atualização do progresso.
- Valores e percentuais em texto.
- Indicador visual de progresso.


### 9.7. Relatórios

Elementos principais:

- Seleção do período.
- Resumo financeiro.
- Gastos por categoria.
- Evolução financeira.
- Gráficos.
- Resumos textuais.
- Alternativa em lista ou tabela.


## 10. Fluxo principal

1. O usuário entra no aplicativo.
2. Acessa o chat.
3. Escreve: "Gastei R$ 70 de gasolina hoje."
4. A inteligência artificial interpreta a mensagem.
5. O sistema valida os dados identificados.
6. O aplicativo apresenta uma prévia da transação.
7. O usuário confirma ou corrige as informações.
8. A transação é salva.
9. O dashboard e os relatórios são atualizados.
10. O Agente Financeiro poderá gerar uma nova observação.


## 11. Fluxo alternativo acessível

1. O usuário entra no aplicativo.
2. Seleciona a opção "Registrar sem o chat".
3. Escolhe entre receita e despesa.
4. Informa o valor, a descrição, a categoria e a data.
5. Revisa as informações.
6. Confirma o lançamento.
7. A transação é salva.
8. O dashboard e os relatórios são atualizados.


## 12. Diretrizes de experiência e acessibilidade

A interface deverá:

- Utilizar linguagem simples e direta.
- Explicar termos financeiros.
- Possuir textos legíveis.
- Permitir ampliação sem perda de conteúdo ou funcionalidade.
- Apresentar contraste adequado.
- Não utilizar somente cores para transmitir informações.
- Funcionar com teclado, mouse e toque.
- Possuir ordem de navegação lógica pelo teclado.
- Apresentar foco visível nos elementos selecionados.
- Possuir campos e botões corretamente identificados.
- Ser compatível com leitores de tela.
- Apresentar áreas de toque confortáveis.
- Evitar excesso de informações na mesma tela.
- Evitar animações desnecessárias.
- Respeitar a preferência do usuário por redução de movimento.
- Não reproduzir sons automaticamente.
- Não impor limites de tempo desnecessários.
- Apresentar mensagens de erro claras.
- Explicar como o usuário pode corrigir um erro.
- Solicitar confirmação antes de ações destrutivas.
- Manter padrões de navegação consistentes.
- Apresentar gráficos acompanhados de textos ou tabelas.
- Mostrar estados de carregamento, sucesso, erro e ausência de dados.
- Não depender exclusivamente de gestos complexos.
- Funcionar adequadamente em celulares, tablets e computadores.


## 13. Critérios de aceitação

O MVP será considerado funcional quando:

- Uma mensagem completa gerar uma prévia correta da transação.
- Informações ausentes fizerem o assistente solicitar esclarecimento.
- Nenhuma transação for salva sem confirmação.
- O usuário conseguir corrigir uma interpretação incorreta.
- O usuário conseguir registrar uma transação sem utilizar o chat.
- Receitas e despesas atualizarem o saldo corretamente.
- Edições e exclusões atualizarem todos os totais.
- Cada usuário conseguir acessar somente seus próprios dados.
- As dicas utilizarem somente informações existentes no sistema.
- Os principais fluxos puderem ser concluídos somente com o teclado.
- Campos e botões possuírem nomes compreensíveis para leitores de tela.
- Nenhuma informação importante depender exclusivamente de cor, som ou animação.
- O texto puder ser ampliado sem esconder conteúdos ou funcionalidades.
- Os gráficos possuírem um resumo textual ou uma alternativa em tabela.
- As mensagens de erro explicarem o problema e como corrigi-lo.
- As telas funcionarem adequadamente em celular e computador.
- A interface apresentar estados de carregamento e ausência de dados.


## 14. Requisitos não funcionais

- Interface responsiva com prioridade para dispositivos móveis.
- Linguagem visual limpa, acolhedora e consistente.
- Valores formatados em real brasileiro.
- Datas apresentadas no padrão brasileiro.
- Compatibilidade com tecnologias assistivas.
- Conformidade desejada com a WCAG 2.2 no nível AA.
- Proteção dos dados de cada usuário.
- Comunicação segura entre aplicação, banco de dados e serviço de IA.
- Chaves de serviços externos nunca expostas no navegador.
- Validação dos dados interpretados antes da gravação.
- Cálculos financeiros executados pelo sistema.
- Tratamento de erros e indisponibilidade da inteligência artificial.
- Possibilidade futura de exportar ou excluir os dados pessoais.


## 15. Fora do escopo do MVP

Não serão incluídos inicialmente:

- Integração bancária.
- Open Finance.
- Leitura automática de extratos.
- Pagamento de contas.
- Recomendações de investimentos.
- Controle avançado de cartões e parcelas.
- Contas familiares compartilhadas.
- Registro por áudio.
- Integração com WhatsApp.
- Múltiplas moedas.
- Previsões financeiras complexas.
- Consultoria financeira profissional.

Essas funcionalidades poderão ser avaliadas depois da validação do MVP.


## 16. Recursos necessários

- Interface web responsiva.
- Sistema de autenticação.
- Banco de dados.
- Serviço de inteligência artificial.
- Serviço seguro no backend para comunicação com a IA.
- Respostas estruturadas da IA, preferencialmente em JSON.
- Validação dos dados antes da gravação.
- Biblioteca de gráficos acessíveis.
- Registro básico de erros.
- Registro de eventos importantes de uso.
- Testes de acessibilidade.

Entidades principais do banco de dados:

- Usuários.
- Transações.
- Metas financeiras.

O histórico completo do chat não precisará ser armazenado no MVP, desde que isso não prejudique o funcionamento da experiência.


## 17. Validação inicial

O protótipo deverá ser testado com aproximadamente 5 a 8 pessoas do público-alvo.

Os participantes deverão representar diferentes perfis, incluindo, quando possível:

- Pessoas idosas.
- Pessoas com deficiência.
- Pessoas com pouca experiência digital.
- Pessoas com diferentes níveis de conhecimento financeiro.
- Usuários de teclado ou tecnologias assistivas.
- Pessoas que utilizam texto ampliado.
- Usuários de celulares com telas pequenas.

Cada participante deverá realizar as seguintes tarefas:

1. Registrar uma despesa pelo chat.
2. Corrigir uma categoria interpretada incorretamente.
3. Registrar uma despesa sem utilizar o chat.
4. Criar uma meta financeira.
5. Descobrir sua maior categoria de gastos.
6. Excluir uma transação.
7. Consultar um relatório sem depender somente do gráfico.

Também deverão ser realizados testes de:

- Navegação somente pelo teclado.
- Compatibilidade com leitores de tela.
- Ampliação do texto.
- Contraste.
- Compreensão sem depender das cores.
- Redução de movimento.
- Mensagens de erro.
- Correção de dados interpretados incorretamente.


## 18. Indicadores iniciais de sucesso

- Pelo menos 80% dos participantes concluem as tarefas sem ajuda.
- Uma transação pode ser registrada em até 30 segundos.
- A facilidade de uso recebe nota média igual ou superior a 4 de 5.
- Pelo menos 80% das mensagens de teste são interpretadas corretamente.
- Os usuários compreendem os relatórios sem depender somente dos gráficos.
- Os principais fluxos podem ser concluídos com teclado.
- A maioria dos participantes afirma que utilizaria o produto semanalmente.

Também deverão ser registradas:

- Dúvidas frequentes.
- Partes em que os usuários tiveram dificuldade.
- Termos que não foram compreendidos pela IA.
- Barreiras de acessibilidade encontradas.
- Funcionalidades solicitadas espontaneamente.


## 19. Ordem sugerida de construção

### Etapa 1 - Interface com dados simulados

Criar as principais telas utilizando dados fictícios.

Objetivos:

- Validar a organização das informações.
- Testar a navegação.
- Verificar a responsividade.
- Aplicar os princípios de Design Universal desde o início.


### Etapa 2 - Dados reais

Adicionar:

- Autenticação.
- Banco de dados.
- Cadastro de transações.
- Edição e exclusão.
- Metas financeiras.
- Cálculos do dashboard.


### Etapa 3 - Chat inteligente

Adicionar:

- Integração com a inteligência artificial.
- Interpretação das mensagens.
- Respostas estruturadas.
- Perguntas para informações ausentes.
- Cartão de confirmação.
- Tratamento de erros da IA.


### Etapa 4 - Relatórios e Agente Financeiro

Adicionar:

- Gráficos acessíveis.
- Resumos em texto.
- Filtros por período.
- Observações financeiras personalizadas.
- Alternativas aos conteúdos visuais.


### Etapa 5 - Testes e validação

Realizar:

- Testes funcionais.
- Testes de usabilidade.
- Testes de acessibilidade.
- Validação com usuários diversos.
- Correções antes da evolução do produto.


## 20. Regra central da arquitetura

A inteligência artificial deverá interpretar e explicar.

O sistema deverá calcular, validar e armazenar.

A inteligência artificial não poderá:

- Alterar saldos diretamente.
- Inventar transações.
- Salvar informações sem confirmação.
- Realizar cálculos financeiros sem validação.
- Apresentar recomendações como aconselhamento profissional.


## 21. Resumo do MVP

O MVP será uma aplicação web responsiva de finanças pessoais que permitirá registrar receitas e despesas por conversa ou por uma interface estruturada.

O sistema apresentará resumos financeiros, metas, relatórios acessíveis e observações educativas.

A solução será desenvolvida com Design Universal para proporcionar uma boa experiência ao maior número possível de usuários, considerando diferentes idades, capacidades, conhecimentos, dispositivos e formas de interação.
```

### 2. Resumo do que o **App de Finanças Pessoais**
 
### 3. Prints do **App de Finanças Pessoais**

### 4. Reflexão sobre o processo**

## 💬 Conclusão

Vibe Coding é sobre clareza, curiosidade e criatividade, não sobre perfeição técnica. O verdadeiro objetivo aqui é aprender a pensar junto com a IA, transformando ideias em conceitos reais e enxergando a tecnologia como uma extensão do seu raciocínio criativo. Cada interação é um experimento, quanto mais clara for sua intenção, mais surpreendente será o resultado.
