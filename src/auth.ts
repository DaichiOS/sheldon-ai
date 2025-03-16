/**
 * Central authentication configuration for the application.
 * This file sets up GitHub OAuth and exports authentication utilities.
 */

import NextAuth, { Account, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";

/**
 * NextAuth.js configuration and exported authentication utilities
 *
 * @returns Authentication utilities and handlers
 * @property {Object} handlers - HTTP request handlers for authentication routes
 * @property {Function} handlers.GET - Handles GET requests for retrieving authentication pages and information
 *                                    (sign-in page, session data, provider list, etc.)
 * @property {Function} handlers.POST - Handles POST requests for authentication actions
 *                                     (submitting credentials, initiating OAuth, sign-out, etc.)
 * @property {Function} signIn - Function to programmatically sign a user in
 * @property {Function} signOut - Function to programmatically sign a user out
 * @property {Function} auth - Function to verify authentication status and return the session
 *                            Returns null if no session exists, or a session object with user data if authenticated
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: {
        params: {
          // Request the following OAuth scopes during sign-in
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    jwt: jwtCallback,
    session: sessionCallback,
  },
  debug: false,
});

/**
 * Session Callback - Called whenever a session is checked
 *
 * This callback is used to customize the session object that is
 * made available to the client. It runs whenever a session is accessed.
 */
export async function sessionCallback({
  session,
  token,
}: {
  session: Session;
  token: JWT;
}): Promise<Session> {
  // Make the token available in the session
  session.accessToken = token.accessToken;
  return session;
}

/**
 * Refreshes an access token using the refresh token
 *
 * This function attempts to get a new access token from GitHub using the refresh token.
 * If successful, it returns an updated token object with the new access token and expiration.
 * If unsuccessful, it returns the original token with an error flag.
 *
 * @example
 * // Inside the jwt callback
 * if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
 *   return token; // Token still valid
 * }
 * return refreshAccessToken(token); // Token expired, refresh it
 */
export async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return {
      ...token,
      error: "RefreshTokenMissing",
    };
  }

  try {
    const url = "https://github.com/login/oauth/access_token";
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.GITHUB_ID || "",
        client_secret: process.env.GITHUB_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    // Example response:
    // {
    //   "access_token": "gho_16C7e42F292c6912E7710c838347Ae178B4a",  // New access token
    //   "token_type": "bearer",                                      // Type of token (almost always "bearer")
    //   "scope": "read:user,user:email,repo",                        // Scopes granted to this token
    //   "refresh_token": "r1.590c2b73d4292389d8bcf3dbbe37662afb832324", // New refresh token (may be provided)
    //   "expires_in": 28800                                          // Expiration time in seconds (8 hours)
    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error("Error refreshing token:", refreshedTokens);
      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    }

    // Return the new token
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      accessTokenExpires:
        Date.now() + (refreshedTokens.expires_in ?? 8 * 60 * 60) * 1000,
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export async function jwtCallback({
  token,
  account,
  user,
}: {
  token: JWT;
  account?: Account | null;
  user?: User | null;
}): Promise<JWT> {
  /**
   * JWT Callback - Called whenever a JWT is created or updated
   *
   * This callback is invoked in the following scenarios:
   * 1. When a user signs in (account and user are available)
   * 2. When a session is accessed and the JWT needs verification
   * 3. When a token is refreshed
   *
   * @param {Object} params - The callback parameters
   * @param {JWT} params.token - The current JWT token
   * @param {Object|null} params.account - OAuth account data (only available during sign-in)
   * @param {Object|null} params.user - User profile data (only available during sign-in)
   * @returns {Promise<JWT>} The updated JWT token
   */
  // Only executes on the initial sign-in to populate the jwt token object for future requests
  if (account && user) {
    return {
      accessToken: account.access_token,
      refreshToken: account.refresh_token,
      accessTokenExpires: account.expires_at
        ? account.expires_at * 1000
        : Date.now() + 8 * 60 * 60 * 1000, // Default to 8 hours (GitHub's default expiration),
      user,
    };
  }

  // Return previous token if the access token has not expired yet
  if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
    return token;
  }
  // Access token has expired, try to refresh it
  return refreshAccessToken(token);
}
