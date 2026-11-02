import "server-only";
import { appRouter } from "@/server/routers/_app";

// Em Server Components não precisamos ir até HTTP: criamos um "caller"
// que invoca os procedures do tRPC diretamente em memória. É isso que
// viabiliza o SSR da listagem (os dados já chegam prontos no primeiro HTML).
const createCaller = appRouter.createCaller;

export const trpcServer = createCaller({});
