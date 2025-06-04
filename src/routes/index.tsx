import { createFileRoute } from "@tanstack/react-router";
import {
  useLiveQuery,
  useOptimisticMutation,
  type PendingMutation,
} from "@tanstack/react-db";
import { createQueryCollection } from "@tanstack/db-collections";
import { QueryClient } from "@tanstack/query-core";
import { z } from "zod";
import React from "react"; // Import React for useState

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

type Todo = z.infer<typeof TodoSchema>;

const queryClient = new QueryClient();

const todoCollection = createQueryCollection<Todo>({
  id: "todos",
  queryKey: ["todos"],
  queryFn: async () => {
    const res = await fetch("/api/todos");
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch todos: ${errorText}`);
    }
    const todos = await res.json();
    return todos.map((todo: any) => ({
      ...todo,
      created_at: todo.created_at ? new Date(todo.created_at) : new Date(),
      updated_at: todo.updated_at ? new Date(todo.updated_at) : new Date(),
    }));
  },
  getId: (todo) => todo.id,
  schema: TodoSchema,
  queryClient,
});

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  // Fetch todos from the database
  const { data: todos } = useLiveQuery((q) =>
    q.from({ todoCollection }).keyBy("@id").select("@*").orderBy("@created_at")
  );

  const [mutationError, setMutationError] = React.useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = React.useState("");

  const createMutation = useOptimisticMutation({
    mutationFn: async ({ transaction }) => {
      setMutationError(null);
      const mutation = transaction.mutations[0] as PendingMutation<Todo>;

      const { modified } = mutation;

      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: modified.title }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const err = `Failed to create todo on server: ${errorText}`;
        setMutationError(err);
        throw new Error(err);
      }

      await (mutation.collection as typeof todoCollection).refetch();
    },
  });

  const updateMutation = useOptimisticMutation({
    mutationFn: async ({ transaction }) => {
      setMutationError(null);
      const mutation = transaction.mutations[0] as PendingMutation<Todo>;

      const { modified } = mutation;

      try {
        const response = await fetch(`/api/todos`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: modified.id,
            completed: modified.completed,
          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to update todo ${modified.id} on server: ${errorText}`
          );
        }
        await (mutation.collection as typeof todoCollection).refetch();
      } catch (error: any) {
        setMutationError(error.message || "Failed to update todo.");
        throw error;
      }
    },
  });

  const deleteMutation = useOptimisticMutation({
    mutationFn: async ({ transaction }) => {
      setMutationError(null);
      const mutation = transaction.mutations[0] as PendingMutation<Todo>;

      const { original } = mutation;

      try {
        console.log("Delete with useOptimisticMutation, sending ID in URL query param");
        const response = await fetch(`/api/todos?id=${original.id}`, {
          method: "DELETE",
          // No Content-Type header or body needed for this DELETE request
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to delete todo ${original.id} on server: ${errorText}`
          );
        }
        await (mutation.collection as typeof todoCollection).refetch();
      } catch (error: any) {
        setMutationError(error.message || "Failed to delete todo.");
        throw error;
      }
    },
  });

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const optimisticTodo: Todo = {
      id: crypto.randomUUID(), // Generate temporary client-side ID
      title: newTodoTitle.trim(),
      completed: false,
      created_at: new Date(), // Optimistic creation date
      updated_at: new Date(), // Optimistic update date
    };

    createMutation.mutate(() => {
      todoCollection.insert(optimisticTodo);
    });
    setNewTodoTitle("");
  };

  const handleToggleComplete = (todoItem: Todo) => {
    updateMutation.mutate(() => {
      todoCollection.update(
        Array.from(todoCollection.state.values()).find(
          (todo) => todo.id === todoItem.id
        )!,
        (draft) => {
          draft.completed = !draft.completed;
          draft.updated_at = new Date();
        }
      );
    });
  };

  const handleDelete = (todoItem: Todo) => {
    deleteMutation.mutate(() => {
      console.log("Delete inside handleDelete -> mutate");
      todoCollection.delete(
        Array.from(todoCollection.state.values()).find(
          (todo) => todo.id === todoItem.id
        )!
      );
    });
  };

  return (
    <div
      className="p-2"
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "auto",
      }}
    >
      <h3 style={{ textAlign: "center", color: "#333" }}>My To-Do List</h3>

      <form
        onSubmit={handleCreateTodo}
        style={{ display: "flex", marginBottom: "20px" }}
      >
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="What needs to be done?"
          style={{
            flexGrow: 1,
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px 0 0 4px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 15px",
            border: "1px solid #007bff",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: "0 4px 4px 0",
            cursor: "pointer",
          }}
        >
          Add Todo
        </button>
      </form>

      {mutationError && (
        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#ffebee",
            border: "1px solid #ffcdd2",
            color: "#c62828",
            borderRadius: "4px",
          }}
        >
          <p>Error: {mutationError}</p>
        </div>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos?.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 15px",
              borderBottom: "1px solid #eee",
              backgroundColor: "#fff",
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleComplete(todo)}
              style={{ marginRight: "15px", transform: "scale(1.2)" }}
            />
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "#aaa" : "#333",
                flexGrow: 1,
              }}
            >
              {todo.title}
            </span>
            <button
              onClick={() => handleDelete(todo)}
              style={{
                marginLeft: "10px",
                color: "#ff4d4d",
                backgroundColor: "transparent",
                border: "1px solid #ff4d4d",
                borderRadius: "4px",
                padding: "5px 10px",
                cursor: "pointer",
                transition: "background-color 0.2s, color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#ff4d4d";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#ff4d4d";
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
