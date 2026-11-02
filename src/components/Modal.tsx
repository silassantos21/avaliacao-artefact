"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect } from "react";
import { DialogShell } from "./DialogShell";

interface ModalProps {
  title: string;
  children: React.ReactNode;
}

// Fecha o modal via router.back() (não router.push): como "@modal" é uma
// parallel route, um push para outra URL não garante que o slot volte ao
// default.tsx em navegação client-side (o Next preserva o último estado
// renderizado do slot). back() restaura corretamente o histórico anterior.
const ModalCloseContext = createContext<(() => void) | null>(null);

// Usado por quem está dentro do modal (ex: TaskForm) para saber como se
// fechar sem precisar receber isso via props vindas de um Server Component.
export function useModalClose() {
  return useContext(ModalCloseContext);
}

// Usado pelas rotas interceptadas (src/app/@modal/(.)...) para renderizar
// a criação/edição como diálogo sobre a listagem, sem perder a página real
// por trás (acesso direto por URL/refresh continua funcionando normalmente).
export function Modal({ title, children }: ModalProps) {
  const router = useRouter();
  const close = () => router.back();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModalCloseContext.Provider value={close}>
      <DialogShell title={title} onClose={close}>
        {children}
      </DialogShell>
    </ModalCloseContext.Provider>
  );
}
