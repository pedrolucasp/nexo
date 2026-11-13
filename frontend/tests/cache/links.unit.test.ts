import { QueryClient } from "@tanstack/react-query";

import { invalidateLinkedEntities, type LinkedEntity } from "@/lib/cache/links";
import { QUERY_NAMESPACES } from "@/lib/cache/namespaces";

const NAMESPACES = QUERY_NAMESPACES;

// Every namespace that could be invalidated, including two the helper must
// never reach
const ALL_KEYS = {
  mood: [NAMESPACES.mood, "list", undefined],
  trigger: [NAMESPACES.trigger, "list", undefined],
  careAction: [NAMESPACES.careAction, "list", undefined],
  sleep: ["sleep-records", "list", undefined],
  insight: ["insights", "list", undefined],
} as const;

let client: QueryClient;

function seedAll(): void {
  for (const key of Object.values(ALL_KEYS)) {
    client.setQueryData(key, { entries: [] });
  }
}

const isInvalidated = (entity: keyof typeof ALL_KEYS): boolean =>
  client.getQueryState(ALL_KEYS[entity])?.isInvalidated ?? false;

beforeEach(() => {
  client = new QueryClient();
  seedAll();
});

afterEach(() => {
  client.clear();
});

describe("invalidateLinkedEntities", () => {
  const cases: {
    written: LinkedEntity;
    refreshed: (keyof typeof ALL_KEYS)[];
  }[] = [
    { written: "mood", refreshed: ["trigger", "careAction"] },
    { written: "trigger", refreshed: ["mood", "careAction"] },
    { written: "careAction", refreshed: ["mood", "trigger"] },
  ];

  it.each(cases)(
    "refreshes exactly the other two screens after a $written write",
    ({ written, refreshed }) => {
      invalidateLinkedEntities(client, written);

      for (const entity of Object.keys(ALL_KEYS)) {
        expect(isInvalidated(entity as keyof typeof ALL_KEYS)).toBe(
          refreshed.includes(entity as keyof typeof ALL_KEYS),
        );
      }
    },
  );

  it("reaches detail keys and not just one list key", () => {
    client.setQueryData([NAMESPACES.trigger, "detail", "7"], { id: 7 });

    invalidateLinkedEntities(client, "careAction");

    expect(
      client.getQueryState([NAMESPACES.trigger, "detail", "7"])?.isInvalidated,
    ).toBe(true);
  });
});

describe("QUERY_NAMESPACES", () => {
  // Key builders read the same constant, so this pins the wire format that
  // the persisted MMKV cache and the query keys agree on
  it("keeps the published key roots stable", () => {
    expect(NAMESPACES).toStrictEqual({
      mood: "mood-entries",
      trigger: "triggers",
      careAction: "careActions",
    });
  });
});
