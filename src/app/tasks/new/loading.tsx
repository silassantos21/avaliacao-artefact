import { Spinner } from "@/components/Spinner";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Spinner />
        Carregando...
      </div>
    </main>
  );
}
