"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/trpc/client";
import { useToast } from "./ToastProvider";
import { ConfirmDialog } from "./ConfirmDialog";
import { getErrorMessage } from "@/lib/getErrorMessage";
import type { Task } from "@/server/db";

const PAGE_SIZE = 10;

interface TaskListProps {
  initialPage: {
    items: Task[];
    nextCursor: number | undefined;
    total: number;
  };
}

export function TaskList({ initialPage }: TaskListProps) {
  const showToast = useToast();
  const utils = trpc.useUtils();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    trpc.task.list.useInfiniteQuery(
      { limit: PAGE_SIZE },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialData: {
          pages: [initialPage],
          pageParams: [0],
        },
      },
    );

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: async () => {
      await utils.task.list.invalidate();
      showToast("success", "Tarefa removida com sucesso.");
    },
    onError: (error) => {
      showToast("error", getErrorMessage(error));
    },
  });

  // Infinite scroll: observa um elemento sentinela no fim da lista e
  // dispara fetchNextPage quando ele entra na viewport.
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tasks = data?.pages.flatMap((page) => page.items) ?? [];

  const [taskPendingDelete, setTaskPendingDelete] = useState<Task | null>(null);

  function confirmDelete() {
    if (!taskPendingDelete) return;
    deleteTask.mutate({ id: taskPendingDelete.id });
    setTaskPendingDelete(null);
  }

  if (isLoading && tasks.length === 0) {
    return <p className="text-sm text-gray-500">Carregando tarefas...</p>;
  }

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Nenhuma tarefa cadastrada ainda. Crie a primeira!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-start justify-between gap-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-1">
              <p className="font-medium text-gray-900">{task.titulo}</p>
              {task.descricao && (
                <p className="text-sm text-gray-600">{task.descricao}</p>
              )}
              <p className="text-xs text-gray-400">
                Criada em {new Date(task.dataCriacao).toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href={`/tasks/${task.id}/edit`}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                Editar
              </Link>
              <button
                type="button"
                onClick={() => setTaskPendingDelete(task)}
                disabled={deleteTask.isPending}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <p className="text-center text-sm text-gray-500">
          Carregando mais tarefas...
        </p>
      )}
      {!hasNextPage && tasks.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          Todas as tarefas foram carregadas ({tasks.length}).
        </p>
      )}

      {taskPendingDelete && (
        <ConfirmDialog
          title="Remover tarefa"
          description={`Remover a tarefa "${taskPendingDelete.titulo}"?`}
          confirmLabel="Excluir"
          onConfirm={confirmDelete}
          onCancel={() => setTaskPendingDelete(null)}
        />
      )}
    </div>
  );
}
