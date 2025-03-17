/**
 * GitHub Commit Service
 *
 * This service provides functionality to fetch and process GitHub commit data
 * using the GraphQL API.
 */

import {
  COMMIT_WITH_FILES_QUERY,
  executeGitHubGraphQL,
  REPOSITORY_COMMITS_QUERY,
} from "@/services/github/api/graphqlService";
import { getCommitDetail } from "@/services/github/api/restService";
import {
  CommitQueryResponse,
  GitHubCommit,
  GitHubCommitDetail,
  RepositoryCommitsResponse,
} from "@/types/github";

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
 * Fetches detailed commit information including file changes and diffs using the REST API
 *
 * @param {string} owner - Repository owner (username or organization)
 * @param {string} repo - Repository name
 * @param {string} commitSha - The commit SHA to fetch details for
 * @param {string} accessToken - GitHub OAuth access token
 * @returns {Promise<GitHubCommitDetail>} Detailed commit information including file changes
 *
 * @throws {Error} If the commit cannot be found or the request fails
 *
 * @example
 * // Get detailed information about a specific commit
 * const commitDetail = await getCommitDetailWithDiffs(
 *   'octocat',
 *   'hello-world',
 *   'abc123def456',
 *   accessToken
 * );
 */
export async function getCommitDetailWithDiffs(
  owner: string,
  repo: string,
  commitSha: string,
  accessToken: string
): Promise<GitHubCommitDetail> {
  return getCommitDetail(owner, repo, commitSha, accessToken);
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

/**
 * Formats detailed commit data for AI processing
 *
 * @param {GitHubCommitDetail} commitDetail - The detailed commit data with file changes and diffs
 * @returns {string} A formatted string representation of the commit for AI analysis
 *
 * @example
 * const commitDetail = await getCommitDetailWithDiffs('octocat', 'hello-world', 'abc123', accessToken);
 * const formattedData = formatDetailedCommitForAI(commitDetail);
 * // Use formattedData with an AI service
 */
export function formatDetailedCommitForAI(
  commitDetail: GitHubCommitDetail
): string {
  // Create a formatted string with commit details and file changes
  let formatted = `Commit: ${commitDetail.sha}\n`;
  formatted += `Author: ${commitDetail.commit.author.name} <${commitDetail.commit.author.email}>\n`;
  formatted += `Date: ${commitDetail.commit.author.date}\n`;
  formatted += `Message: ${commitDetail.commit.message}\n\n`;

  formatted += `Changes Summary:\n`;
  formatted += `- ${commitDetail.files.length} files changed\n`;
  formatted += `- ${commitDetail.stats.additions} additions\n`;
  formatted += `- ${commitDetail.stats.deletions} deletions\n\n`;

  formatted += `File Changes:\n`;

  // Add details for each changed file
  for (const file of commitDetail.files) {
    formatted += `\nFile: ${file.filename}\n`;
    formatted += `Status: ${file.status}\n`;
    formatted += `Changes: +${file.additions} -${file.deletions}\n`;

    // Include the actual code diff if available
    if (file.patch) {
      formatted += `Diff:\n${file.patch}\n`;
    }
  }

  return formatted;
}
