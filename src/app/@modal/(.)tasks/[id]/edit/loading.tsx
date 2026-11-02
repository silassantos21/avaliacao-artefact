import { Modal } from "@/components/Modal";
import { Spinner } from "@/components/Spinner";

export default function Loading() {
  return (
    <Modal title="Editar tarefa">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Spinner />
        Carregando...
      </div>
    </Modal>
  );
}
