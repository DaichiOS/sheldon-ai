import { auth } from "@/auth";
import {
  formatDetailedCommitForAI,
  getCommitDetailWithDiffs,
} from "@/services/github/commit/commitService";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/github/commits/[sha]/analyze
 *
 * Fetches detailed commit information and formats it for AI analysis
 * Requires authentication with GitHub OAuth
 *
 * Path parameters:
 * - sha: The commit SHA to analyze
 *
 * Query parameters:
 * - owner: Repository owner (username or organization)
 * - repo: Repository name
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sha: string } }
) {
  // Get the user's session
  const session = await auth();

  // Check if the user is authenticated and has a GitHub access token
  if (!session?.accessToken) {
    return NextResponse.json(
      { error: "Not authenticated with GitHub" },
      { status: 401 }
    );
  }

  // Get the commit SHA from the path parameter
  const commitSha = params.sha;

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  // Validate required parameters
  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing required parameters: owner and repo" },
      { status: 400 }
    );
  }

  try {
    // Fetch detailed commit information with diffs
    const commitDetail = await getCommitDetailWithDiffs(
      owner,
      repo,
      commitSha,
      session.accessToken
    );

    // Format the commit data for AI analysis
    const formattedData = formatDetailedCommitForAI(commitDetail);

    return NextResponse.json({
      commit: commitDetail,
      formatted_data: formattedData,
      // Note: In a real application, you would likely send this formatted data
      // to an AI service here and return the AI's analysis
    });
  } catch (error) {
    console.error(`Error analyzing commit ${commitSha}:`, error);
    return NextResponse.json(
      {
        error: "Failed to analyze commit",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
