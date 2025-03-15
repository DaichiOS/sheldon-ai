import { GitHubEvent } from "@/types/github";
import { fetchFromGitHub } from "../api/restService";

/**
 * Fetches the authenticated user's recent activity events
 *
 * @param {string} accessToken - GitHub OAuth access token for authentication
 * @param {Object} [options] - Options for filtering events
 * @param {number} [options.per_page=30] - Number of events per page (max 100)
 * @param {number} [options.page=1] - Page number for pagination
 * @returns {Promise<GitHubEvent[]>} Promise resolving to an array of user events
 * @throws {Error} If the request fails or the token is invalid
 *
 * @example
 * // Get user's recent activity
 * const events = await getActivity(accessToken);
 * console.log(`You have ${events.length} recent activities`);
 */
export async function getActivity(
  accessToken: string,
  options: { per_page?: number; page?: number } = {}
): Promise<GitHubEvent[]> {
  const { per_page = 30, page = 1 } = options;
  const query = new URLSearchParams({
    per_page: per_page.toString(),
    page: page.toString(),
  }).toString();

  return fetchFromGitHub<GitHubEvent[]>(`/user/events?${query}`, accessToken);
}
