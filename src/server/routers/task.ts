import { randomUUID } from "crypto";
import { z } from "zod";
import { publicProcedure, router, TRPCError } from "../trpc";
import { tasks } from "../db";

const titleSchema = z
  .string()
  .trim()
  .min(1, "O título é obrigatório.");

// Comparação de título "sem distinção de maiúsculas/espaços", para
// considerar "Comprar pão" e "comprar pão " como a mesma tarefa.
const normalizeTitle = (titulo: string) => titulo.trim().toLowerCase();

function assertTitleIsUnique(titulo: string, ignoreId?: string) {
  const exists = tasks.some(
    (t) => t.id !== ignoreId && normalizeTitle(t.titulo) === normalizeTitle(titulo),
  );
  if (exists) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `Já existe uma tarefa com o título "${titulo}".`,
    });
  }
}

export const taskRouter = router({
  // Listagem paginada por cursor, usada tanto no SSR inicial quanto no
  // infinite scroll do cliente (mesmo endpoint, só muda o cursor enviado).
  list: publicProcedure
    .input(
      z.object({
        cursor: z.number().int().min(0).optional(),
        limit: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(({ input }) => {
      const sorted = [...tasks].sort((a, b) => b.dataCriacao - a.dataCriacao);
      const start = input.cursor ?? 0;
      const page = sorted.slice(start, start + input.limit);
      const nextCursor: number | undefined =
        start + input.limit < sorted.length ? start + input.limit : undefined;

      return {
        items: page,
        nextCursor,
        total: sorted.length,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const task = tasks.find((t) => t.id === input.id);
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Tarefa com id "${input.id}" não encontrada.`,
        });
      }
      return task;
    }),

  create: publicProcedure
    .input(
      z.object({
        titulo: titleSchema,
        descricao: z.string().trim().optional(),
      }),
    )
    .mutation(({ input }) => {
      assertTitleIsUnique(input.titulo);
      const task = {
        id: randomUUID(),
        titulo: input.titulo,
        descricao: input.descricao || undefined,
        dataCriacao: Date.now(),
      };
      tasks.push(task);
      return task;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        titulo: titleSchema,
        descricao: z.string().trim().optional(),
      }),
    )
    .mutation(({ input }) => {
      const task = tasks.find((t) => t.id === input.id);
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Não foi possível atualizar: tarefa com id "${input.id}" não existe.`,
        });
      }
      assertTitleIsUnique(input.titulo, input.id);
      task.titulo = input.titulo;
      task.descricao = input.descricao || undefined;
      return task;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const index = tasks.findIndex((t) => t.id === input.id);
      if (index === -1) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Não foi possível remover: tarefa com id "${input.id}" não existe.`,
        });
      }
      const [removed] = tasks.splice(index, 1);
      return removed;
    }),
});
