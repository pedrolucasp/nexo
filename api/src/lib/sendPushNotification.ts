import { logger } from "@app/lib/logger";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type PushPayload = {
  token: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export async function sendPushNotification({
  token,
  title,
  body,
  data,
}: PushPayload): Promise<void> {
  logger.info(
    { tokenPrefix: token.slice(0, 24), title },
    "[push] sending notification",
  );

  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: token, title, body, data }),
  });

  if (!response.ok) {
    const errBody = await response.text();

    logger.error(
      { status: response.status, body: errBody },
      "[push] Expo API error",
    );
    throw new Error(`Expo push API returned ${response.status}`);
  }
}
