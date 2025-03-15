import { auth } from "@/auth";
import SignInButton from "@/components/auth/SignInButton";

export default async function Home() {
  const session = await auth();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      {session ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome, {session.user?.name}</h1>
          <p>You are signed in with GitHub</p>
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