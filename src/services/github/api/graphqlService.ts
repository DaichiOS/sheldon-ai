// GraphQL service will need to handle:
// 1. Making authenticated requests to GitHub's GraphQL API
// 2. Executing GraphQL queries and handling responses
// 3. Error handling and type safety

/**
 * GitHub GraphQL API Service
 *
 * This service provides functionality to interact with GitHub's GraphQL API.
 */

/**
 * Executes a GraphQL query against the GitHub API
 *
 * @template T - The expected return type of the query
 * @param {string} query - The GraphQL query string
 * @param {Record<string, unknown>} variables - Variables to use in the query
 * @param {string} accessToken - GitHub OAuth access token
 * @returns {Promise<T>} - The query result data
 *
 * @throws {Error} If the request fails or returns GraphQL errors
 *
 * @example
 * // Fetch a commit with its file changes
 * const data = await executeGitHubGraphQL<CommitQueryResponse>(
 *   COMMIT_WITH_FILES_QUERY,
 *   { owner: 'octocat', repo: 'hello-world', commitSha: 'abc123' },
 *   accessToken
 * );
 */
export async function executeGitHubGraphQL<T>(
  query: string,
  // Record is a TypeScript type that represents an object where the keys are strings and the values can be of any type
  // It's used for the variables parameter because GraphQL queries can have various variables with different
  variables: Record<string, unknown>,
  accessToken: string
): Promise<T> {
  const url = "https://api.github.com/graphql";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      // Try to get error details from the response
      try {
        const errorData = await response.json();
        throw new Error(
          `GitHub GraphQL error (${response.status}): ${JSON.stringify(
            errorData
          )}`
        );
      } catch {
        throw new Error(
          `GitHub GraphQL error: ${response.statusText} (${response.status})`
        );
      }
    }

    const result = await response.json();

    // GraphQL can return errors even with a 200 status code
    if (result.errors) {
      throw new Error(`GitHub GraphQL error: ${JSON.stringify(result.errors)}`);
    }

    return result.data as T;
  } catch (error) {
    // Re-throw the error with additional context if it's not already a custom error
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to execute GraphQL query: ${String(error)}`);
  }
}

/**
 * Common GraphQL queries used throughout the application
 */

/**
 * Query to fetch a specific commit with its file changes
 */
export const COMMIT_WITH_FILES_QUERY = `
  query GetCommitWithFiles($owner: String!, $repo: String!, $commitSha: String!) {
    repository(owner: $owner, name: $repo) {
      object(expression: $commitSha) {
        ... on Commit {
          oid
          message
          committedDate
          author {
            name
            email
          }
          additions
          deletions
          changedFiles
        }
      }
    }
  }
`;

/**
 * Query to fetch recent commits from a repository
 */
export const REPOSITORY_COMMITS_QUERY = `
  query GetRepositoryCommits($owner: String!, $repo: String!, $cursor: String) {
    repository(owner: $owner, name: $repo) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 10, after: $cursor) {
              nodes {
                oid
                message
                committedDate
                author {
                  name
                  email
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      }
    }
  }
`;
