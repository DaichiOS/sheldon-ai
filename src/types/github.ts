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
  changes: number;
  status: string; // 'added', 'modified', 'removed', etc.
  patch?: string; // The actual code changes (diff)
  filename: string;
  previous_filename?: string; // For renamed files
  raw_url: string; // URL to view the raw file
  contents_url: string; // URL to get the file contents
  sha: string; // Blob SHA
}

/**
 * Represents detailed commit information from the REST API
 */
export interface GitHubCommitDetail {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
    html_url: string;
  } | null;
  committer: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
    html_url: string;
  } | null;
  parents: Array<{
    sha: string;
    url: string;
    html_url: string;
  }>;
  stats: {
    total: number;
    additions: number;
    deletions: number;
  };
  files: GitHubCommitFile[];
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
