import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { TodoSchema } from "../index";

export const APIRoute = createAPIFileRoute("/api/todos")({
  GET: async ({ request }) => {
    console.info("Fetching todos... @", request.url);
    const res = await fetch("https://jsonplaceholder.typicode.com/todos");
    if (!res.ok) {
      throw new Error("Failed to fetch todos");
    }

    const data = (await res.json()) as Array<typeof TodoSchema._type>;

    const list = data.slice(0, 10);

    return json(
      list.map((u) => ({
        id: u.id,
        title: u.title,
        completed: u.completed,
        created_at: u.created_at,
        updated_at: u.updated_at,
      }))
    );
  },

  POST: async ({ request }) => {
    console.info("Creating todo... @", request.url);
    const data = await request.json();
    return json(data);
  },
});
