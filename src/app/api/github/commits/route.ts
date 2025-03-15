import { auth } from "@/auth";
import {
  getCommitWithFiles,
  getRepositoryCommits,
} from "@/services/github/commit/commitService";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/github/commits
 *
 * Fetches commits from a GitHub repository
 * Requires authentication with GitHub OAuth
 *
 * Query parameters:
 * - owner: Repository owner (username or organization)
 * - repo: Repository name
 * - sha: (Optional) Specific commit SHA to fetch
 * - cursor: (Optional) Pagination cursor for fetching more commits
 */
export async function GET(request: NextRequest) {
  // Get the user's session
  const session = await auth();

  // Check if the user is authenticated and has a GitHub access token
  if (!session?.accessToken) {
    return NextResponse.json(
      { error: "Not authenticated with GitHub" },
      { status: 401 }
    );
  }

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const commitSha = searchParams.get("sha");
  const cursor = searchParams.get("cursor");

  // Validate required parameters
  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing required parameters: owner and repo" },
      { status: 400 }
    );
  }

  try {
    // If a specific commit SHA is provided, fetch that commit with file changes
    if (commitSha) {
      const commit = await getCommitWithFiles(
        owner,
        repo,
        commitSha,
        session.accessToken
      );
      return NextResponse.json(commit);
    }

    // Otherwise, fetch recent commits from the repository
    const commits = await getRepositoryCommits(
      owner,
      repo,
      session.accessToken,
      cursor || undefined
    );
    return NextResponse.json(commits);
  } catch (error) {
    console.error("Error fetching GitHub commits:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch GitHub commits",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
