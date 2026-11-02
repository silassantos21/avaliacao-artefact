"use client";

interface DialogShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

// Estrutura visual (overlay + card) compartilhada pelo Modal (rotas
// interceptadas) e pelo ConfirmDialog (confirmação controlada por estado).
export function DialogShell({ title, onClose, children }: DialogShellProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-lg flex-col gap-4 rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="dialog-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
