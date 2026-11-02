import { TRPCError } from "@trpc/server";
import { trpcServer } from "@/trpc/server";
import { Modal } from "@/components/Modal";
import { TaskForm } from "@/components/TaskForm";

interface EditTaskModalProps {
  params: Promise<{ id: string }>;
}

export default async function EditTaskModal({ params }: EditTaskModalProps) {
  const { id } = await params;

  try {
    const task = await trpcServer.task.getById({ id });
    return (
      <Modal title="Editar tarefa">
        <TaskForm
          mode="edit"
          taskId={task.id}
          initialTitulo={task.titulo}
          initialDescricao={task.descricao}
        />
      </Modal>
    );
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      // Dentro do modal não faz sentido redirecionar para a página 404
      // inteira: mostramos o erro no próprio diálogo.
      return (
        <Modal title="Tarefa não encontrada">
          <p className="text-sm text-gray-600">
            Essa tarefa pode já ter sido removida.
          </p>
        </Modal>
      );
    }
    throw error;
  }
}
