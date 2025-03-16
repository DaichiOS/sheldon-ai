import { jwtCallback, sessionCallback } from "@/auth";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";

// Mock the entire next-auth module
jest.mock("next-auth", () => ({}));
jest.mock("next-auth/jwt", () => ({}));

// Mock the global fetch function without declaring a global type
// @ts-ignore - Ignore TypeScript errors for the fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        expires_in: 3600,
      }),
  })
);

describe("Authentication System", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  test("JWT callback should store tokens during sign-in", async () => {
    // ARRANGE: Set up your test data
    const mockAccount = {
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now in seconds
      // Add required properties to satisfy the Account type
      provider: "github",
      providerAccountId: "12345",
      type: "oauth",
    };

    const mockUser = {
      name: "Test User",
      email: "test@example.com",
    };

    const mockToken = {}; // Empty token object for initial sign in

    // ACT: Call the function you're testing
    const result = await jwtCallback({
      token: mockToken,
      account: mockAccount as any,
      user: mockUser,
    });

    // ASSERT: Verify the function behaved as expected
    expect(result.accessToken).toBe("test-access-token");
    expect(result.refreshToken).toBe("test-refresh-token");
    expect(result.accessTokenExpires).toBeDefined();
  });

  test("Session callback should add accessToken to session", async () => {
    // ARRANGE: Set up your test data
    const mockToken = {
      accessToken: "test-access-token",
    };

    const mockSession = {
      user: {
        name: "Test User",
        email: "test@example.com",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    // ACT: Call the function you're testing
    const result = await sessionCallback({
      session: mockSession,
      token: mockToken,
    });

    // ASSERT: Verify the function behaved as expected
    expect(result.accessToken).toBe("test-access-token");
  });

  test("JWT callback should return existing token when not expired", async () => {
    // ARRANGE: Set up your test data
    // Create a token that hasn't expired yet (expires 1 hour from now)
    const futureTime = Date.now() + 60 * 60 * 1000; // 1 hour in the future
    const mockToken = {
      accessToken: "existing-access-token",
      refreshToken: "existing-refresh-token",
      accessTokenExpires: futureTime,
      user: { name: "Existing User" },
    };

    // No account or user provided since this simulates a token check, not initial sign-in

    // ACT: Call the function you're testing
    const result = await jwtCallback({ token: mockToken });

    // ASSERT: Verify the function returned the existing token unchanged
    expect(result).toBe(mockToken);
    expect(result.accessToken).toBe("existing-access-token");
    expect(result.accessTokenExpires).toBe(futureTime);
  });

  test("JWT callback should return original token with error when refresh token is missing", async () => {
    // ARRANGE: Set up your test data
    const mockToken = {
      accessToken: "existing-access-token",
      accessTokenExpires: Date.now() - 1000, // Expired token (1 second ago)
    };
    // ACT: Call the function you're testing
    const result = await jwtCallback({ token: mockToken });

    // ASSERT: Verify the function returned the existing token with an error
    expect(result.accessToken).toBe("existing-access-token");
    expect(result.error).toBe("RefreshTokenMissing");
  });

  test("JWT callback should attempt to refresh token when expired", async () => {
    // ARRANGE: Set up your test data
    const mockToken = {
      accessToken: "expired-access-token",
      refreshToken: "valid-refresh-token",
      accessTokenExpires: Date.now() - 1000, // Expired token
    };

    // ACT: Call the function you're testing
    const result = await jwtCallback({ token: mockToken });

    // ASSERT: Verify the token was refreshed
    expect(result.accessToken).toBe("new-access-token");
    expect(result.refreshToken).toBe("new-refresh-token");
    expect(result.accessTokenExpires).toBeGreaterThan(Date.now());

    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://github.com/login/oauth/access_token",
      expect.objectContaining({
        method: "POST",
      })
    );
  });
});
