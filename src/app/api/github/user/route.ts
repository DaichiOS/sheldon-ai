import { auth } from "@/auth";
import { getUser } from "@/services/github/githubService";
import { NextResponse } from "next/server";

/**
 * GET /api/github/user
 *
 * Fetches the authenticated user's GitHub profile
 * Requires authentication with GitHub OAuth
 */
export async function GET() {
  // Get the user's session
  const session = await auth();
  // Check if the user is authenticated and has a GitHub access token
  if (!session?.accessToken) {
    // The NextResponse object is a key part of Next.js's API route handling.
    // It allows you to create HTTP responses with various status codes, headers, and body content.
    return NextResponse.json(
      { error: "Not authenticated with GitHub" },
      { status: 401 }
    );
  }

  // Try to fetch the user's profile from GitHub
  try {
    const user = await getUser(session.accessToken);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching GitHub user:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub profile" },
      { status: 500 }
    );
  }
}
