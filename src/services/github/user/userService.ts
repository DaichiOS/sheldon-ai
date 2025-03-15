import { fetchFromGitHub } from "@/services/github/api/restService";
import { GitHubUser } from "@/types/github";

/**
 * Fetches the authenticated user's GitHub profile information
 *
 * @param {string} accessToken - GitHub OAuth access token for authentication
 * @returns {Promise<GitHubUser>} Promise resolving to the user's profile data
 * @throws {Error} If the request fails or the token is invalid
 *
 * @example
 * // Get the authenticated user's profile
 * const user = await getUser(accessToken);
 * console.log(`Hello, ${user.name || user.login}!`);
 */
export async function getUser(accessToken: string): Promise<GitHubUser> {
  return fetchFromGitHub<GitHubUser>("/user", accessToken);
}
