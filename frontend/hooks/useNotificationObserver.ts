import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter, useRootNavigationState } from "expo-router";

export function useNotificationObserver() {
  const router = useRouter();
  const rootNavState = useRootNavigationState();
  const routerReady = !!rootNavState?.key;
  const handled = useRef(false);
  const lastHandledId = useRef<string | null>(null);

  useEffect(() => {
    if (!routerReady) return;
    if (handled.current) return;

    let isMounted = true;

    function handleResponse(
      response: Notifications.NotificationResponse | null,
      coldLaunch: boolean,
    ) {
      if (!response || !isMounted) return;

      const id = response.notification.request.identifier;
      const { request } = response.notification;
      const { content } = request;
      const { title, body, subtitle, data } = content;

      if (lastHandledId.current === id) return;
      lastHandledId.current = id;

      // XXX: Looks so dumb, actually
      const { screen, ...params } = (data ?? {}) as Record<string, any>;

      if (!screen) return;

      const payload = { body, title, ...params };

      if (coldLaunch) {
        router.replace({
          pathname: screen as any,
          params: payload,
        });
      } else {
        router.push({
          pathname: screen as any,
          params: payload,
        });
      }
    }

    // Cold launch
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!handled.current) {
        handled.current = true;
        handleResponse(response, true);
      }
    });

    // Warm/foreground
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleResponse(response, false);
      },
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [routerReady, router]);
}
