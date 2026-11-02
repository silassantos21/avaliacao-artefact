import { TaskForm } from "@/components/TaskForm";

export default function NewTaskPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Nova tarefa</h1>
      <TaskForm mode="create" />
    </main>
  );
}
