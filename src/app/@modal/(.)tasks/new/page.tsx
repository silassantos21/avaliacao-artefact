import { Modal } from "@/components/Modal";
import { TaskForm } from "@/components/TaskForm";

export default function NewTaskModal() {
  return (
    <Modal title="Nova tarefa">
      <TaskForm mode="create" />
    </Modal>
  );
}
