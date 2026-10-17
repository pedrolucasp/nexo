import { useInfiniteQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";

export const notificationKeys = {
  all: () => ["notifications"] as const,
  lists: () => [...notificationKeys.all(), "list"] as const,
  infinite: () => [...notificationKeys.lists(), "infinite"] as const,
};

// The inbox reads newest-first and pages with a cursor: each response carries
// the next cursor, or null once the last page is reached
export const useNotificationsInfinite = (limit = 30) => {
  return useInfiniteQuery({
    queryKey: notificationKeys.infinite(),
    queryFn: ({ pageParam }) =>
      apiClient.getNotifications({ cursor: pageParam, limit }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as number | undefined,
  });
};
