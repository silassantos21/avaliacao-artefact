// src/lib/getErrorMessage.ts
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";

export function getErrorMessage(error: TRPCClientErrorLike<AppRouter>) {
  const fieldErrors = error.data?.zodError?.fieldErrors;
  const first = fieldErrors && Object.values(fieldErrors).flat()[0];
  return first ?? error.message;
}
