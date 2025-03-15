"use client";
import { GitHubRepo, GitHubUser } from "@/types/github";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Profile() {
    const [profile, setProfile] = useState<GitHubUser | null>(null);
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Fetch the user's GitHub profile data
    useEffect(() => {
        async function fetchProfile() {
            try {
                // Makes a GET request to the /api/github/user route
                const response = await fetch("/api/github/user");
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch profile");
                }
                
                const data = await response.json();
                setProfile(data);
            } catch (error) {
                setError(error as Error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    // Fetch the user's GitHub repositories data
    useEffect(() => {
        async function fetchRepos() {
            try {
                const response = await fetch("/api/github/repos");
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch repositories");
                }

                const data = await response.json();
                setRepos(data);
            } catch (error) {
                setError(error as Error);
            } finally {
                setLoading(false);
            }
        }
        fetchRepos();
    }, []);
    
    return (
        <div>
            {/* Sign out button */}
            <button 
                onClick={() => signOut()}
                className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Sign Out
            </button>
            
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error.message}</p>
            ) : (
                <div>
                    <h1>Name: {profile?.name}</h1>
                    <p>Bio: {profile?.bio}</p>
                    <p>Created Date: {profile?.created_at}</p>
                    <p>Followers: {profile?.followers}</p>
                    <p>Following: {profile?.following}</p>
                    <h2>Repositories</h2>
                    <ul>
                        {repos.map((repo) => (
                            <li key={repo.id}>{repo.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
