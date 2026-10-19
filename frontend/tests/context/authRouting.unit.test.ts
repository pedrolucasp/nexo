import { deriveStatus, routeForStatus } from "@/context/authRouting";
import type { User } from "@/lib/api";

function user(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email: "ana@example.com",
    firstName: "Ana",
    updatedAt: new Date(2025, 0, 15),
    active: true,
    ...overrides,
  };
}

describe("deriveStatus", () => {
  it("stays loading while the session resolves, even with a user in hand", () => {
    expect(deriveStatus(true, null)).toBe("loading");
    expect(deriveStatus(true, user())).toBe("loading");
  });

  it("is signed out without a user", () => {
    expect(deriveStatus(false, null)).toBe("signedOut");
  });

  it("awaits activation for an account that is not active yet", () => {
    expect(deriveStatus(false, user({ active: false }))).toBe(
      "awaitingActivation",
    );
  });

  it("is active for an active account", () => {
    expect(deriveStatus(false, user({ active: true }))).toBe("active");
  });
});

describe("routeForStatus", () => {
  it("stays put while loading, whatever the user shape", () => {
    expect(routeForStatus("loading", null)).toBeNull();
    expect(routeForStatus("loading", user())).toBeNull();
  });

  it("sends a signed-out account to login", () => {
    expect(routeForStatus("signedOut", null)).toBe("/auth/login");
  });

  it("sends an unactivated account to activation", () => {
    expect(routeForStatus("awaitingActivation", user({ active: false }))).toBe(
      "/auth/activate",
    );
  });

  it("sends an active account that finished onboarding to the feed", () => {
    expect(
      routeForStatus("active", user({ onboardingSeenAt: new Date(2025, 0, 15) })),
    ).toBe("/(tabs)/new");
  });

  it("sends an active account that never finished onboarding to onboarding", () => {
    expect(routeForStatus("active", user({ onboardingSeenAt: null }))).toBe(
      "/onboarding",
    );
    expect(routeForStatus("active", user())).toBe("/onboarding");
  });
});
