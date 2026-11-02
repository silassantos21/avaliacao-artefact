export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: number;
}

// Guardamos o "banco" em `globalThis` para sobreviver ao hot-reload do
// Next.js em desenvolvimento (cada reload re-executaria este módulo e
// zeraria o array, apagando as tarefas criadas durante os testes manuais).
const globalForDb = globalThis as unknown as { __tasks?: Task[] };

export const tasks: Task[] = globalForDb.__tasks ?? (globalForDb.__tasks = []);
