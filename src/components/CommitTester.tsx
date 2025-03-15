"use client";

import { useState } from "react";

export default function CommitTester() {
  // State for form inputs
  const [owner, setOwner] = useState("facebook");
  const [repo, setRepo] = useState("react");
  const [commitSha, setCommitSha] = useState("");
  
  // State for API responses
  const [commits, setCommits] = useState<any[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch recent commits
  const fetchCommits = async () => {
    if (!owner || !repo) {
      setError("Owner and repo are required");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/github/commits?owner=${owner}&repo=${repo}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch commits");
      }
      
      const data = await response.json();
      setCommits(data.commits || []);
      setSelectedCommit(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific commit
  const fetchCommit = async (sha: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/github/commits?owner=${owner}&repo=${repo}&sha=${sha}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch commit");
      }
      
      const data = await response.json();
      setSelectedCommit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">GitHub Commits API Tester</h1>
      
      {/* Form */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Owner</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., facebook"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Repository</label>
            <input
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., react"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchCommits}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Fetch Recent Commits"}
          </button>
          
          <div className="flex-1">
            <input
              type="text"
              value={commitSha}
              onChange={(e) => setCommitSha(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Commit SHA (optional)"
            />
          </div>
          
          <button
            onClick={() => commitSha && fetchCommit(commitSha)}
            disabled={loading || !commitSha}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Fetch Commit
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Commits list */}
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-2">Recent Commits</h2>
          {commits.length === 0 ? (
            <p className="text-gray-500">No commits to display</p>
          ) : (
            <ul className="divide-y">
              {commits.map((commit) => (
                <li key={commit.oid} className="py-2">
                  <div className="font-mono text-xs text-gray-500">{commit.oid.substring(0, 7)}</div>
                  <div className="font-medium">{commit.message.split("\n")[0]}</div>
                  <div className="text-sm text-gray-600">
                    {commit.author.name} • {new Date(commit.committedDate).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => fetchCommit(commit.oid)}
                    className="mt-1 text-sm text-blue-500 hover:underline"
                  >
                    View details
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Selected commit details */}
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-2">Commit Details</h2>
          {!selectedCommit ? (
            <p className="text-gray-500">Select a commit to view details</p>
          ) : (
            <div>
              <div className="mb-2">
                <div className="font-mono text-sm">{selectedCommit.oid}</div>
                <div className="font-medium text-lg">{selectedCommit.message.split("\n")[0]}</div>
                <div className="text-sm text-gray-600">
                  {selectedCommit.author.name} &lt;{selectedCommit.author.email}&gt; • 
                  {new Date(selectedCommit.committedDate).toLocaleString()}
                </div>
              </div>
              
              <h3 className="font-medium mt-4 mb-2">Changes Summary</h3>
              <div className="p-3 bg-gray-50 rounded mb-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-green-600 font-medium">+{selectedCommit.additions}</div>
                    <div className="text-xs text-gray-500">Additions</div>
                  </div>
                  <div>
                    <div className="text-red-600 font-medium">-{selectedCommit.deletions}</div>
                    <div className="text-xs text-gray-500">Deletions</div>
                  </div>
                  <div>
                    <div className="text-blue-600 font-medium">{selectedCommit.changedFiles}</div>
                    <div className="text-xs text-gray-500">Files Changed</div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 italic">
                Note: Detailed file changes are not available through the GraphQL API in this implementation.
                To view specific file changes, you would need to use GitHub's REST API or visit the commit on GitHub.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 