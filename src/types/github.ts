export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    display_login: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  created_at: string;
  payload: any;
}

// GraphQL API Types

/**
 * Represents a file changed in a commit
 */
export interface GitHubCommitFile {
  path: string;
  additions: number;
  deletions: number;
  patch?: string; // The actual code changes
}

/**
 * Represents a commit from the GraphQL API
 */
export interface GitHubCommit {
  oid: string; // Commit hash
  message: string;
  committedDate: string;
  author: {
    name: string;
    email: string;
  };
  additions: number;
  deletions: number;
  changedFiles: number;
}

/**
 * Response structure for a commit query
 */
export interface CommitQueryResponse {
  repository: {
    object: GitHubCommit;
  };
}

/**
 * Response structure for a repository commits query
 */
export interface RepositoryCommitsResponse {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          nodes: GitHubCommit[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
          };
        };
      };
    };
  };
}
