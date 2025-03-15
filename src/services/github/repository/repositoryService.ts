import { fetchFromGitHub } from "@/services/github/api/restService";
import { GitHubRepo } from "@/types/github";

/**
 * Fetches the authenticated user's repositories
 *
 * @param {string} accessToken - GitHub OAuth access token for authentication
 * @param {Object} [options] - Options for filtering repositories
 * @param {string} [options.sort='updated'] - Sort repositories by: 'created', 'updated', 'pushed', 'full_name'
 * @param {string} [options.direction='desc'] - Sort direction: 'asc' or 'desc'
 * @param {number} [options.per_page=30] - Number of repositories per page (max 100)
 * @param {number} [options.page=1] - Page number for pagination
 * @returns {Promise<GitHubRepo[]>} Promise resolving to an array of repository data
 * @throws {Error} If the request fails or the token is invalid
 *
 * @example
 * // Get user's most recently updated repositories
 * const repos = await getUserRepositories(accessToken);
 *
 * @example
 * // Get user's oldest repositories, 10 per page
 * const oldestRepos = await getUserRepositories(accessToken, {
 *   sort: 'created',
 *   direction: 'asc',
 *   per_page: 10
 * });
 */
export async function getUserRepositories(
  accessToken: string,
  options: {
    sort?: string;
    direction?: string;
    per_page?: number;
    page?: number;
  } = {}
): Promise<GitHubRepo[]> {
  const {
    sort = "updated",
    direction = "desc",
    per_page = 30,
    page = 1,
  } = options;
  const query = new URLSearchParams({
    sort,
    direction,
    per_page: per_page.toString(),
    page: page.toString(),
  }).toString();

  return fetchFromGitHub<GitHubRepo[]>(`/user/repos?${query}`, accessToken);
}
