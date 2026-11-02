# Task Manager — NextJS + tRPC

Sistema simples de gerenciamento de tarefas. Backend em memória (sem banco de
dados), exposto via tRPC, consumido por um frontend NextJS.

## Stack

- Next.js 15 (App Router)
- tRPC 11 + React Query
- Zod (validação)
- Tailwind CSS
- TypeScript

## Como executar

Requer Node.js 18.18 ou mais recente.

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` (se a porta estiver ocupada, o terminal mostra
qual porta o Next.js usou no lugar).

> Os dados ficam só em memória (`src/server/db.ts`) e somem a cada reinício do
> servidor — assim mesmo, por pedido do desafio.

## Decisões de arquitetura

- **Listagem com SSR real:** a página inicial busca as tarefas direto no
  servidor (sem passar por HTTP), então a lista já chega pronta no HTML. Por
  isso também forcei `dynamic = "force-dynamic"` nela — sem isso o Next
  tentaria gerar essa página como estática, e a lista mudaria sem ela
  atualizar.
- **Mesma rota para SSR e infinite scroll:** o procedure `task.list` aceita um
  cursor e serve tanto a primeira carga quanto o scroll infinito, pra não
  duplicar lógica de paginação.
- **Validação em duas camadas:** o formulário bloqueia título vazio na hora,
  e o backend valida de novo (o cliente nunca é confiável sozinho).
- **Título duplicado não é permitido:** criar ou editar uma tarefa com um
  título já existente (ignorando maiúsculas/espaços) dá erro.
- **Erros com mensagem clara:** editar/excluir uma tarefa que não existe mais
  retorna um erro explicado, mostrado num toast.
- **Criar/editar abre como modal:** mas `/tasks/new` e `/tasks/[id]/edit`
  continuam sendo páginas de verdade (funcionam com refresh ou link direto).
  É o padrão de "intercepting routes" do Next — ao fechar o modal, uso
  `router.back()` em vez de navegar pra "/", porque só assim o Next
  realmente desfaz o modal.

## Estrutura

```
src/
  server/
    db.ts                       # "banco" em memória
    routers/task.ts              # CRUD de tarefas
  trpc/
    client.ts                    # hooks usados nos componentes
    server.ts                     # acesso direto ao backend (usado no SSR)
  components/
    TaskList.tsx                  # listagem + infinite scroll + exclusão
    TaskForm.tsx                   # formulário de criação/edição
    Modal.tsx                       # dialog usado pelas rotas interceptadas
    ToastProvider.tsx                # feedback de sucesso/erro
    Spinner.tsx                       # loading
  app/
    page.tsx                         # listagem (SSR)
    tasks/new/, tasks/[id]/edit/       # páginas reais de criação/edição
    @modal/(.)tasks/...                 # as mesmas telas, como modal
```

## Bônus implementados

- Infinite scroll na listagem.
- Comentários nos pontos menos óbvios e este README.

## O que faria diferente com mais tempo

- Persistência real (hoje os dados somem a cada restart, por pedido do
  desafio).
- Testes automatizados.
- Autenticação, se o sistema deixasse de ser de um usuário só.
