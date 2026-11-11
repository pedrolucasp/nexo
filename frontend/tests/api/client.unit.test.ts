import * as SecureStore from "expo-secure-store";

import { ApiError, apiClient } from "@/lib/api/client";

const TOKEN = "stored-token";
const RANGE_QUERY = "from=2025-01-01&to=2025-01-31&page=2&limit=10";

let fetchMock: jest.Mock;

beforeEach(() => {
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
  apiClient.registerUnauthorizedHandler(() => {});
  fetchMock = jest.fn();
  globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

function jsonResponse(
  body: unknown,
  { ok = true, status = 200 }: { ok?: boolean; status?: number } = {},
) {
  return {
    ok,
    status,
    json: jest.fn(async () => body),
  } as unknown as Response;
}

function unparseableResponse(status: number) {
  return {
    ok: false,
    status,
    json: jest.fn(async () => {
      throw new SyntaxError("Unexpected end of JSON input");
    }),
  } as unknown as Response;
}

function bufferResponse(buffer: ArrayBuffer) {
  return {
    ok: true,
    status: 200,
    arrayBuffer: jest.fn(async () => buffer),
  } as unknown as Response;
}

const capture = (promise: Promise<unknown>) =>
  promise.catch((caught) => caught) as Promise<ApiError>;

const requestUrl = () => fetchMock.mock.calls[0][0] as string;
const requestPath = () =>
  requestUrl().replace(/^https?:\/\/[^/]+/, "");
const requestInit = () => fetchMock.mock.calls[0][1] as RequestInit;
const requestHeaders = () =>
  requestInit().headers as Record<string, string>;

describe("request headers", () => {
  it("sends the stored token as a bearer authorization header", async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(TOKEN);
    fetchMock.mockResolvedValue(jsonResponse({ user: { id: 1 } }));

    await apiClient.getMe();

    expect(requestPath()).toBe("/users/me");
    expect(requestHeaders()).toStrictEqual({
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    });
  });

  it("omits the authorization header without a stored token", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiClient.getMe();

    expect(requestHeaders()).toStrictEqual({
      "Content-Type": "application/json",
    });
  });

  it("omits the JSON content type for a FormData body", async () => {
    const form = new FormData();
    form.append("avatar", "file");
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiClient.avatar(form);

    expect(requestInit().body).toBe(form);
    expect(requestHeaders()).toStrictEqual({});
  });
});

describe("request error mapping", () => {
  it("maps a fetch rejection to the connection error with status zero", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network request failed"));

    const error = await capture(apiClient.getMe());

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Sem conexão com o servidor");
    expect(error.status).toBe(0);
  });

  it("maps a non-OK response to an API error with message, status, and fields", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { error: "Invalid email", fields: { email: "Invalid email" } },
        { ok: false, status: 422 },
      ),
    );

    const error = await capture(apiClient.getMe());

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Invalid email");
    expect(error.status).toBe(422);
    expect(error.fields).toStrictEqual({ email: "Invalid email" });
  });

  it("invokes the unauthorized handler on a 401 and still throws", async () => {
    const onUnauthorized = jest.fn();
    apiClient.registerUnauthorizedHandler(onUnauthorized);
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "No token provided" }, { ok: false, status: 401 }),
    );

    await expect(apiClient.getMe()).rejects.toBeInstanceOf(ApiError);

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("falls back to the status when the body carries no error", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { ok: false, status: 503 }));

    const error = await capture(apiClient.getMe());

    expect(error.message).toBe("HTTP 503");
    expect(error.status).toBe(503);
  });

  it("keeps the status when the body cannot be parsed", async () => {
    fetchMock.mockResolvedValue(unparseableResponse(502));

    const error = await capture(apiClient.getMe());

    expect(error.message).toBe("Network error");
    expect(error.status).toBe(502);
  });

  it("returns the parsed body on success", async () => {
    const body = { user: { id: 9, email: "ana@example.com" } };
    fetchMock.mockResolvedValue(jsonResponse(body));

    await expect(apiClient.getMe()).resolves.toStrictEqual(body);
  });

  it("does not log on any request path", async () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {});
    const error = jest.spyOn(console, "error").mockImplementation(() => {});

    fetchMock.mockResolvedValueOnce(jsonResponse({}));
    await apiClient.getMe();

    fetchMock.mockRejectedValueOnce(new TypeError("Network request failed"));
    await capture(apiClient.getMe());

    fetchMock.mockResolvedValueOnce(jsonResponse({}, { ok: false, status: 500 }));
    await capture(apiClient.getMe());

    fetchMock.mockResolvedValueOnce(bufferResponse(new ArrayBuffer(1)));
    await apiClient.generateReport("2025-01-01", "2025-01-31");

    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});

describe("generateReport", () => {
  const periodStart = "2025-01-01";
  const periodEnd = "2025-01-31";

  it("sends the token and JSON body, and returns the array buffer", async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(TOKEN);
    const buffer = new ArrayBuffer(8);
    fetchMock.mockResolvedValue(bufferResponse(buffer));

    await expect(
      apiClient.generateReport(periodStart, periodEnd),
    ).resolves.toBe(buffer);

    expect(requestPath()).toBe("/reports");
    expect(requestInit()).toStrictEqual({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ periodStart, periodEnd }),
    });
  });

  it("maps a fetch rejection to the connection error with status zero", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network request failed"));

    const error = await capture(apiClient.generateReport(periodStart, periodEnd));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Sem conexão com o servidor");
    expect(error.status).toBe(0);
  });

  it("maps a non-OK response and invokes the unauthorized handler on 401", async () => {
    const onUnauthorized = jest.fn();
    apiClient.registerUnauthorizedHandler(onUnauthorized);
    fetchMock.mockResolvedValue(
      jsonResponse(
        { error: "Invalid or expired token" },
        { ok: false, status: 401 },
      ),
    );

    const error = await capture(apiClient.generateReport(periodStart, periodEnd));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Invalid or expired token");
    expect(error.status).toBe(401);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("falls back to the status when the body cannot be parsed", async () => {
    fetchMock.mockResolvedValue(unparseableResponse(500));

    const error = await capture(apiClient.generateReport(periodStart, periodEnd));

    expect(error.message).toBe("HTTP 500");
    expect(error.status).toBe(500);
  });
});

const listCases = [
  {
    name: "moods",
    filtered: () =>
      apiClient.getMoodEntries({
        from: "2025-01-01",
        to: "2025-01-31",
        page: 2,
        limit: 10,
      }),
    unfiltered: () => apiClient.getMoodEntries(),
    filteredPath: `/moods?${RANGE_QUERY}`,
    emptyPath: "/moods",
  },
  {
    name: "sleep records",
    filtered: () =>
      apiClient.getSleepRecords({
        from: "2025-01-01",
        to: "2025-01-31",
        page: 2,
        limit: 10,
      }),
    unfiltered: () => apiClient.getSleepRecords(),
    filteredPath: `/sleep_records?${RANGE_QUERY}`,
    emptyPath: "/sleep_records",
  },
  {
    name: "triggers",
    filtered: () =>
      apiClient.getTriggers({
        from: "2025-01-01",
        to: "2025-01-31",
        page: 2,
        limit: 10,
      }),
    unfiltered: () => apiClient.getTriggers(),
    filteredPath: `/triggers?${RANGE_QUERY}`,
    emptyPath: "/triggers",
  },
  {
    name: "insights",
    filtered: () =>
      apiClient.getInsights({
        type: "DAILY_SLEEP",
        period: "WEEKLY",
        limit: 5,
      }),
    unfiltered: () => apiClient.getInsights(),
    filteredPath: "/insights?type=DAILY_SLEEP&period=WEEKLY&limit=5",
    emptyPath: "/insights",
  },
  {
    name: "notifications",
    filtered: () => apiClient.getNotifications({ limit: 20, cursor: 7 }),
    unfiltered: () => apiClient.getNotifications(),
    filteredPath: "/notifications?limit=20&cursor=7",
    emptyPath: "/notifications",
  },
  {
    name: "care actions",
    filtered: () =>
      apiClient.getCareActions({
        type: "ACTIVITY",
        from: "2025-01-01",
        to: "2025-01-31",
        page: 2,
        limit: 10,
      }),
    unfiltered: () => apiClient.getCareActions(),
    filteredPath: `/care-actions?type=ACTIVITY&${RANGE_QUERY}`,
    emptyPath: "/care-actions",
  },
];

describe.each(listCases)("$name", ({ filtered, unfiltered, filteredPath, emptyPath }) => {
  it("builds the query string from its filters", async () => {
    const body = { data: [] };
    fetchMock.mockResolvedValue(jsonResponse(body));

    await expect(filtered()).resolves.toStrictEqual(body);

    expect(requestPath()).toBe(filteredPath);
  });

  it("omits the query string with no filters", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await unfiltered();

    expect(requestPath()).toBe(emptyPath);
  });
});
