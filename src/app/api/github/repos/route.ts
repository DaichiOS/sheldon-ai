import { auth } from "@/auth";
import { getUserRepositories } from "@/services/github/repository/repositoryService";
import { NextResponse } from "next/server";

/**
 * GET /api/github/repos
 *
 * Fetches the authenticated user's GitHub repositories
 * Requires authentication with GitHub OAuth
 */

export async function GET() {
  // Get the user's session
  const session = await auth();
  // Check if the user is authenticated and has a GitHub access token
  if (!session?.accessToken) {
    return NextResponse.json(
      { error: "Not authenticated with GitHub" },
      { status: 401 }
    );
  }

  // Try to fetch the user's repositories from Github
  try {
    const repos = await getUserRepositories(session.accessToken);
    return NextResponse.json(repos);
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub repositories" },
      { status: 500 }
    );
  }
}
