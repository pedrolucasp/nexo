import type { QueryClient } from "@tanstack/react-query";

import { QUERY_NAMESPACES } from "@/lib/cache/namespaces";

// A link is stored on one side but rendered from both, so a write can leave a
// stale edge on any screen that shows the relationship. The whole namespace is
// refreshed rather than one detail key: the screen holding the stale edge is
// often keyed by the other end's id, which the write never saw
export type LinkedEntity = "mood" | "trigger" | "careAction";

const OTHER_ENTITIES: Record<LinkedEntity, LinkedEntity[]> = {
  mood: ["trigger", "careAction"],
  trigger: ["mood", "careAction"],
  careAction: ["mood", "trigger"],
};

// Refreshes the entities that can render a link to the one just written
export function invalidateLinkedEntities(
  queryClient: QueryClient,
  written: LinkedEntity,
): void {
  for (const entity of OTHER_ENTITIES[written]) {
    queryClient.invalidateQueries({ queryKey: [QUERY_NAMESPACES[entity]] });
  }
}
