/**
 * Central authentication configuration for the application.
 * This file sets up GitHub OAuth and exports authentication utilities.
 */

import NextAuth from "next-auth";
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
    async jwt({ token, account }) {
      // Initial sign-in: account contains the access_token
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Make the token available in the session
      session.accessToken = token.accessToken;
      return session;
    },
  },
  debug: false,
});
