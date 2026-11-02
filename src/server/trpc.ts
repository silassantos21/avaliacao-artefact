import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError, flattenError } from "zod";

const t = initTRPC.create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // error.cause instanceof ZodError perde o generic <T> do schema original,
    // então flattenError() infere fieldErrors como `{}` (keyof unknown = never).
    // Anotamos o shape concreto aqui pra isso não voltar a escorregar.
    const zodError =
      error.cause instanceof ZodError
        ? (flattenError(error.cause) as {
            formErrors: string[];
            fieldErrors: Record<string, string[] | undefined>;
          })
        : null;

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export { TRPCError };
