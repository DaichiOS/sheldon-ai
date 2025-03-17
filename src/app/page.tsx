import { auth } from "@/auth";
import SignInButton from "@/components/auth/SignInButton";
import Profile from "@/components/ui/profile/Profile";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      {session ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome, {session.user?.name}</h1>
          <p>You are signed in with GitHub</p>
          <Profile />
          
          <div className="mt-6 flex flex-col gap-3">
            <Link 
              href="/test/commits" 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test GitHub Commits API
            </Link>
            
            <Link 
              href="/test/commit-details" 
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Test Detailed Commit API
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to the App</h1>
          <p className="mb-4">Please sign in to continue</p>
          <SignInButton />
        </div>
      )}
    </div>
  );
}