import { auth } from "@/auth";
import CommitTester from "@/components/CommitTester";
import { redirect } from "next/navigation";

export default async function CommitDetailsPage() {
  // Check if the user is authenticated
  const session = await auth();
  
  // Redirect to sign-in if not authenticated
  if (!session) {
    redirect("/api/auth/signin");
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">GitHub Commit Details Tester</h1>
      <p className="text-center mb-8 text-gray-600">
        This page demonstrates fetching detailed commit information including file changes and diffs.
      </p>
      <CommitTester />
    </div>
  );
} 