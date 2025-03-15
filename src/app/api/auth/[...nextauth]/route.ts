/**
 * NextAuth.js API Route Handler
 *
 * This file exports HTTP handlers that process all authentication-related requests.
 * The dynamic route [...nextauth] captures all auth-related paths and directs them
 * to the appropriate handler.
 *
 * Automatically creates these endpoints:
 * - /api/auth/signin - Shows sign-in options or redirects to the provider
 * - /api/auth/callback/github - Processes the callback from GitHub after authentication
 * - /api/auth/session - Returns the current session data
 * - /api/auth/signout - Handles sign-out requests
 * - /api/auth/csrf - Provides CSRF tokens for secure form submissions
 * - /api/auth/providers - Lists available authentication providers
 */

import { handlers } from "@/auth";

/**
 * GET handler for authentication routes
 *
 * Handles requests that retrieve information or display pages:
 * - Displaying the sign-in page
 * - Processing OAuth callbacks (with query parameters)
 * - Retrieving session information
 * - Getting the list of providers
 * - Showing the sign-out page
 *
 * OAuth Flow Example:
 * 1. User clicks "Sign in with GitHub", a request goes to the GET handler
 * 2. User is redirected to GitHub's authorization page
 * 3. After authorization, GitHub redirects back to your callback URL
 * 4. The GET handler processes this callback, creates a session, and redirects to your app
 * 5. The session is then available via the auth() function
 */
export const GET = handlers.GET;

/**
 * POST handler for authentication routes
 *
 * Handles requests that change authentication state:
 * - Submitting credentials
 * - Initiating the OAuth flow with a provider
 * - Processing sign-out actions
 * - Handling form submissions with CSRF tokens
 *
 * Security Note:
 * - All POST requests require a valid CSRF token
 * - This prevents cross-site request forgery attacks
 * - The token is obtained from the /api/auth/csrf endpoint
 *
 * Sign-out Flow Example:
 * 1. User clicks "Sign out", a request goes to the POST handler
 * 2. The POST handler invalidates the session
 * 3. User is redirected to the specified URL or home page
 */
export const POST = handlers.POST;
