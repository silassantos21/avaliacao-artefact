import Link from "next/link";
import { trpcServer } from "@/trpc/server";
import { TaskList } from "@/components/TaskList";

// Força renderização no servidor a cada request (SSR real, não SSG):
// a lista de tarefas muda constantemente, então não pode ser cacheada
// como página estática gerada em build time.
export const dynamic = "force-dynamic";

// Server Component: busca a primeira página de tarefas no servidor (SSR)
// antes de responder, então a listagem já chega pronta no HTML inicial.
export default async function HomePage() {
  const initialPage = await trpcServer.task.list({ limit: 10 });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Minhas Tarefas</h1>
        <Link
          href="/tasks/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nova tarefa
        </Link>
      </div>

      <TaskList initialPage={initialPage} />
    </main>
  );
}
