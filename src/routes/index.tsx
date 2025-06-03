import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery, useOptimisticMutation } from "@tanstack/react-db";
import { createQueryCollection } from "@tanstack/db-collections";
import { QueryClient } from "@tanstack/query-core";
import type { QueryCollection } from "@tanstack/db-collections";
import type { Collection, PendingMutation } from "@tanstack/react-db";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>
    </div>
  );
}
