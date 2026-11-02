"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { trpc } from "@/trpc/client";
import { useToast } from "./ToastProvider";
import { useModalClose } from "./Modal";
import { getErrorMessage } from "@/lib/getErrorMessage";

interface TaskFormProps {
  mode: "create" | "edit";
  taskId?: string;
  initialTitulo?: string;
  initialDescricao?: string;
}

export function TaskForm({
  mode,
  taskId,
  initialTitulo = "",
  initialDescricao = "",
}: TaskFormProps) {
  const router = useRouter();
  const showToast = useToast();
  const utils = trpc.useUtils();

  // Dentro do modal (rota interceptada), fechar precisa ser router.back(),
  // não router.push: um push não garante que a parallel route "@modal"
  // volte ao default.tsx em navegação client-side. Fora do modal (página
  // cheia /tasks/new ou /tasks/[id]/edit), voltamos para a listagem.
  const modalClose = useModalClose();
  const close = modalClose ?? (() => router.push("/"));

  const [titulo, setTitulo] = useState(initialTitulo);
  const [descricao, setDescricao] = useState(initialDescricao);
  // Erro de validação local (frontend), separado do erro vindo do backend.
  const [clientError, setClientError] = useState<string | null>(null);

  const createTask = trpc.task.create.useMutation({
    onSuccess: async () => {
      await utils.task.list.invalidate();
      showToast("success", "Tarefa criada com sucesso.");
      close();
    },
    onError: (error) => {
      showToast("error", getErrorMessage(error));
    },
  });

  const updateTask = trpc.task.update.useMutation({
    onSuccess: async () => {
      await utils.task.list.invalidate();
      showToast("success", "Tarefa atualizada com sucesso.");
      close();
    },
    onError: (error) => {
      showToast("error", getErrorMessage(error));
    },
  });

  const isSubmitting = createTask.isPending || updateTask.isPending;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    // Validação no frontend: impede o envio com título vazio antes mesmo
    // de bater no backend (que também valida, como segunda barreira).
    if (!titulo.trim()) {
      setClientError("O título é obrigatório.");
      return;
    }
    setClientError(null);

    if (mode === "create") {
      createTask.mutate({ titulo: titulo.trim(), descricao: descricao.trim() || undefined });
    } else if (taskId) {
      updateTask.mutate({
        id: taskId,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
      <div className="flex flex-col gap-1">
        <label htmlFor="titulo" className="text-sm font-medium">
          Título <span className="text-red-600">*</span>
        </label>
        <input
          id="titulo"
          name="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Revisar proposta comercial"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="descricao" className="text-sm font-medium">
          Descrição
        </label>
        <textarea
          id="descricao"
          name="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Opcional"
          disabled={isSubmitting}
        />
      </div>

      {clientError && (
        <p className="text-sm text-red-600" role="alert">
          {clientError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting
            ? "Salvando..."
            : mode === "create"
              ? "Criar tarefa"
              : "Salvar alterações"}
        </button>
        <button
          type="button"
          onClick={close}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
