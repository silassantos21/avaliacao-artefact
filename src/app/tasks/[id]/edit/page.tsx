import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { trpcServer } from "@/trpc/server";
import { TaskForm } from "@/components/TaskForm";

interface EditTaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;

  let task;
  try {
    task = await trpcServer.task.getById({ id });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Editar tarefa</h1>
      <TaskForm
        mode="edit"
        taskId={task.id}
        initialTitulo={task.titulo}
        initialDescricao={task.descricao}
      />
    </main>
  );
}
