// The base segment of each linked entity's query keys. Shared by the key
// builders and the link invalidation, so renaming a namespace cannot leave one
// of them silently pointing at a key that no longer exists
export const QUERY_NAMESPACES = {
  mood: "mood-entries",
  trigger: "triggers",
  careAction: "careActions",
} as const;
