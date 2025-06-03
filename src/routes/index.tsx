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
  const { data: todos } = useLiveQuery((q) =>
    q.from({ todoCollection }).keyBy("@id").select("@*").orderBy("@created_at")
  );
  return (
    <div
      className="p-2"
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "auto",
      }}
    >
      <h3 style={{ textAlign: "center" }}>My To-Do List</h3>

      {/* {mutationError && (
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', borderRadius: '4px' }}>
          <p>Error: {mutationError}</p>
        </div>
      )} */}

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
              // Optimistic updates provide immediate visual feedback.
              // No specific 'isPending' styling here as it's not directly available from the hook.
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              // onChange={() => handleToggleComplete(todo)}
              style={{ marginRight: "15px", transform: "scale(1.2)" }}
              // No direct 'isPending' for individual items from this hook.
              // Disabling during any server operation might be too broad if not desired.
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
              // onClick={() => handleDelete(todo.id)}
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
