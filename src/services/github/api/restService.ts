import { GitHubCommitDetail, GitHubRepo } from "@/types/github";

/**
 * Makes an authenticated request to the GitHub API
 *
 * @template T - The expected return type of the API response
 * @param {string} endpoint - The GitHub API endpoint (starting with '/'), e.g., '/user' or '/repos'
 * @param {string} accessToken - The GitHub OAuth access token for authentication
 * @param {RequestInit} [options={}] - Additional fetch options to customize the request
 * @param {string} [options.method] - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {HeadersInit} [options.headers] - Additional HTTP headers to include
 * @param {BodyInit} [options.body] - Request body for POST/PUT requests
 * @param {RequestCache} [options.cache] - Cache mode: 'default', 'no-store', 'reload', 'no-cache', 'force-cache', or 'only-if-cached'
 * @param {RequestCredentials} [options.credentials] - Credentials mode: 'omit', 'same-origin', or 'include'
 * @param {RequestMode} [options.mode] - CORS mode: 'cors', 'no-cors', or 'same-origin'
 * @param {RequestRedirect} [options.redirect] - Redirect mode: 'follow', 'error', or 'manual'
 * @param {AbortSignal} [options.signal] - AbortSignal to abort the request
 *
 * @returns {Promise<T>} A promise that resolves to the API response data with type T
 *
 * @throws {Error} Throws an error if the request fails, the token is invalid/expired,
 *                 or if the rate limit is exceeded
 *
 * @example
 * // Get the authenticated user's profile
 * const user = await fetchFromGitHub<GitHubUser>('/user', accessToken);
 *
 * @example
 * // Create a new repository with custom options
 * const newRepo = await fetchFromGitHub<GitHubRepo>('/user/repos', accessToken, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ name: 'new-repo', private: true })
 * });
 */
export async function fetchFromGitHub<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint.substring(1)
    : endpoint;
  const url = `https://api.github.com/${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("GitHub token expired or invalid");
      }
      if (
        response.status === 403 &&
        response.headers.get("X-RateLimit-Remaining") === "0"
      ) {
        throw new Error("GitHub API rate limit exceeded");
      }

      // Get error details but without excessive logging
      try {
        const errorData = await response.json();
        throw new Error(
          `GitHub REST API error (${response.status}): ${JSON.stringify(
            errorData
          )}`
        );
      } catch {
        throw new Error(
          `GitHub REST API error: ${response.statusText} (${response.status})`
        );
      }
    }

    return response.json() as Promise<T>;
  } catch (error) {
    throw error;
  }
}

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

/**
 * Fetches detailed information about a specific commit, including file changes and diffs
 *
 * @param {string} owner - Repository owner (username or organization)
 * @param {string} repo - Repository name
 * @param {string} commitSha - The commit SHA to fetch details for
 * @param {string} accessToken - GitHub OAuth access token
 * @returns {Promise<GitHubCommitDetail>} Detailed commit information including file changes
 * @throws {Error} If the commit cannot be found or the request fails
 *
 * @example
 * // Get detailed information about a specific commit
 * const commitDetail = await getCommitDetail('octocat', 'hello-world', 'abc123def456', accessToken);
 * console.log(`Files changed: ${commitDetail.files.length}`);
 * console.log(`Total changes: ${commitDetail.stats.total}`);
 */
export async function getCommitDetail(
  owner: string,
  repo: string,
  commitSha: string,
  accessToken: string
): Promise<GitHubCommitDetail> {
  // GitHub REST API endpoint for commit details
  const endpoint = `/repos/${owner}/${repo}/commits/${commitSha}`;

  try {
    // Make the API request with the 'application/vnd.github.v3.diff' media type to get diffs
    return await fetchFromGitHub<GitHubCommitDetail>(endpoint, accessToken, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });
  } catch (error) {
    console.error(`Error fetching commit detail for ${commitSha}:`, error);
    throw error;
  }
}
