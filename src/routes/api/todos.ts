import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { TodoSchema } from "../index";
import { getBindings } from "../../utils/cloudflareBindings";

export const APIRoute = createAPIFileRoute("/api/todos")({
  GET: async ({ request }) => {
    console.info("Fetching todos... @", request.url);
    try {
      const { DB } = await getBindings();
      const { results } = (await DB.prepare(
        "SELECT * FROM todos"
      ).all()) as unknown as { results: Array<typeof TodoSchema._type> };
      return json(results);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
      throw error;
    }
  },

  POST: async ({ request }) => {
    console.info("Creating todo... @", request.url);
    try {
      const { DB } = await getBindings();
      const body = (await request.json()) as { title?: string };

      if (
        !body.title ||
        typeof body.title !== "string" ||
        body.title.trim() === ""
      ) {
        return json(
          { error: "Title is required and must be a non-empty string" },
          { status: 400 }
        );
      }

      const newTodoId = crypto.randomUUID();
      const title = body.title.trim();

      await DB.prepare("INSERT INTO todos (id, title) VALUES (?, ?)")
        .bind(newTodoId, title)
        .run();

      // Construct the object to return, matching the TodoSchema
      // The database defaults will handle created_at, updated_at, and completed.
      // We return values consistent with what the client expects for an optimistic update scenario.
      const newTodo: typeof TodoSchema._type = {
        id: newTodoId,
        title: title,
        completed: false, // Default state for a new todo
        created_at: new Date(), // JS Date object for client
        updated_at: new Date(), // JS Date object for client
      };

      return json(newTodo, { status: 201 });
    } catch (error) {
      console.error("Failed to create todo:", error);
      // Ensure a proper error response format if possible
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return json(
        { error: "Failed to create todo", details: errorMessage },
        { status: 500 }
      );
    }
  },
  PUT: async ({ request }) => {
    console.info("Updating todo... @", request.url);
    try {
      const { DB } = await getBindings();
      const body = (await request.json()) as {
        id: string;
        completed?: boolean;
      };

      if (!body.id || typeof body.id !== "string") {
        return json({ error: "Invalid todo ID" }, { status: 400 });
      }

      const { id, completed } = body;

      await DB.prepare("UPDATE todos SET completed = ? WHERE id = ?")
        .bind(completed, id)
        .run();

      return json({ id, completed });
    } catch (error) {
      console.error("Failed to update todo:", error);
      // Ensure a proper error response format if possible
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return json(
        { error: "Failed to update todo", details: errorMessage },
        { status: 500 }
      );
    }
  },
  DELETE: async ({ request }) => {
    console.info("Deleting todo... @", request.url);
    try {
      const { DB } = await getBindings();
      const body = (await request.json()) as { id: string };

      if (!body.id || typeof body.id !== "string") {
        return json({ error: "Invalid todo ID" }, { status: 400 });
      }

      const { id } = body;

      console.log(`Attempting to delete todo with id: ${id}`);
      await DB.prepare("DELETE FROM todos WHERE id = ? RETURNING id")
        .bind(id)
        .run();
      console.log(`Successfully deleted todo with id: ${id}`);

      return json({ id });
    } catch (error) {
      console.error("Failed to delete todo:", error);
      // Ensure a proper error response format if possible
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return json(
        { error: "Failed to delete todo", details: errorMessage },
        { status: 500 }
      );
    }
  },
});
