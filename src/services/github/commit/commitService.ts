/**
 * GitHub Commit Service
 *
 * This service provides functionality to fetch and process GitHub commit data
 * using the GraphQL API.
 */

import {
  CommitQueryResponse,
  GitHubCommit,
  RepositoryCommitsResponse,
} from "@/types/github";
import {
  COMMIT_WITH_FILES_QUERY,
  executeGitHubGraphQL,
  REPOSITORY_COMMITS_QUERY,
} from "../api/graphqlService";

/**
 * Fetches a specific commit with its file changes
 *
 * @param {string} owner - Repository owner (username or organization)
 * @param {string} repo - Repository name
 * @param {string} commitSha - The commit SHA to fetch
 * @param {string} accessToken - GitHub OAuth access token
 * @returns {Promise<GitHubCommit>} The commit data with file changes
 *
 * @throws {Error} If the commit cannot be found or the request fails
 *
 * @example
 * // Get a specific commit with its file changes
 * const commit = await getCommitWithFiles(
 *   'octocat',
 *   'hello-world',
 *   'abc123def456',
 *   accessToken
 * );
 */
export async function getCommitWithFiles(
  owner: string,
  repo: string,
  commitSha: string,
  accessToken: string
): Promise<GitHubCommit> {
  const response = await executeGitHubGraphQL<CommitQueryResponse>(
    COMMIT_WITH_FILES_QUERY,
    { owner, repo, commitSha },
    accessToken
  );

  // Check if the commit was found
  if (!response.repository.object) {
    throw new Error(`Commit not found: ${commitSha}`);
  }

  return response.repository.object;
}

/**
 * Fetches recent commits from a repository
 *
 * @param {string} owner - Repository owner (username or organization)
 * @param {string} repo - Repository name
 * @param {string} accessToken - GitHub OAuth access token
 * @param {string} [cursor] - Pagination cursor for fetching more commits
 * @returns {Promise<{ commits: GitHubCommit[], hasNextPage: boolean, endCursor: string }>}
 *          The commits and pagination info
 *
 * @throws {Error} If the repository cannot be found or the request fails
 *
 * @example
 * // Get recent commits from a repository
 * const { commits, hasNextPage, endCursor } = await getRepositoryCommits(
 *   'octocat',
 *   'hello-world',
 *   accessToken
 * );
 *
 * // Get the next page of commits
 * if (hasNextPage) {
 *   const nextPage = await getRepositoryCommits(
 *     'octocat',
 *     'hello-world',
 *     accessToken,
 *     endCursor
 *   );
 * }
 */
export async function getRepositoryCommits(
  owner: string,
  repo: string,
  accessToken: string,
  cursor?: string
): Promise<{
  commits: GitHubCommit[];
  hasNextPage: boolean;
  endCursor: string;
}> {
  const response = await executeGitHubGraphQL<RepositoryCommitsResponse>(
    REPOSITORY_COMMITS_QUERY,
    { owner, repo, cursor },
    accessToken
  );

  // Check if the repository exists and has a default branch
  if (!response.repository.defaultBranchRef) {
    throw new Error(
      `Repository not found or has no default branch: ${owner}/${repo}`
    );
  }

  const { nodes, pageInfo } =
    response.repository.defaultBranchRef.target.history;

  return {
    commits: nodes,
    hasNextPage: pageInfo.hasNextPage,
    endCursor: pageInfo.endCursor,
  };
}

/**
 * Formats commit data for AI processing
 *
 * @param {GitHubCommit} commit - The commit data with file changes
 * @returns {string} A formatted string representation of the commit for AI analysis
 *
 * @example
 * const commit = await getCommitWithFiles('octocat', 'hello-world', 'abc123', accessToken);
 * const formattedData = formatCommitForAI(commit);
 * // Use formattedData with an AI service
 */
export function formatCommitForAI(commit: GitHubCommit): string {
  // Create a formatted string with commit details and file changes
  let formatted = `Commit: ${commit.oid}\n`;
  formatted += `Author: ${commit.author.name} <${commit.author.email}>\n`;
  formatted += `Date: ${commit.committedDate}\n`;
  formatted += `Message: ${commit.message}\n\n`;
  formatted += `Changes Summary:\n`;
  formatted += `- ${commit.changedFiles} files changed\n`;
  formatted += `- ${commit.additions} additions\n`;
  formatted += `- ${commit.deletions} deletions\n`;

  return formatted;
}
