import { auth } from "@/auth";
import CommitTester from "@/components/CommitTester";
import { redirect } from "next/navigation";

export default async function CommitTestPage() {
  // Check if the user is authenticated
  const session = await auth();
  
  // Redirect to sign-in if not authenticated
  if (!session) {
    redirect("/api/auth/signin");
  }
  
  return (
    <div className="container mx-auto py-8">
      <CommitTester />
    </div>
  );
} 