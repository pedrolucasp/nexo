import { useInfiniteQuery } from "@tanstack/react-query";

import { apiClient, HistoryKind } from "@/lib/api";

// Each filter is its own cursor stream, so switching pills starts at the
// newest page instead of carrying another filter's cursor
export const historyKeys = {
  all: () => ["history"] as const,
  lists: () => [...historyKeys.all(), "list"] as const,
  infinite: (type?: HistoryKind) =>
    [...historyKeys.lists(), "infinite", type] as const,
};

// The infinite key ends with the active filter, so the cache can tell which
// cursor stream a query belongs to without rebuilding the key
export const historyFilterOf = (
  queryKey: readonly unknown[],
): HistoryKind | undefined => queryKey[3] as HistoryKind | undefined;

// The merged history reads newest-first and pages with an opaque cursor: each
// response carries the next cursor, or null once the last page is reached
export const useHistory = (type?: HistoryKind) => {
  return useInfiniteQuery({
    queryKey: historyKeys.infinite(type),
    queryFn: ({ pageParam }) =>
      apiClient.getHistory({ type, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
};
