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
  const [detailedCommit, setDetailedCommit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'detailed'>('basic');

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
      setDetailedCommit(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific commit (basic info)
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
      setDetailedCommit(null);
      setActiveTab('basic');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed commit information with file changes and diffs
  const fetchDetailedCommit = async (sha: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the new detailed commit endpoint
      const response = await fetch(`/api/github/commits/${sha}?owner=${owner}&repo=${repo}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch detailed commit");
      }
      
      const data = await response.json();
      setDetailedCommit(data);
      setActiveTab('detailed');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Get file status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added': return 'bg-green-100 text-green-800';
      case 'modified': return 'bg-blue-100 text-blue-800';
      case 'removed': return 'bg-red-100 text-red-800';
      case 'renamed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
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
            Fetch Basic
          </button>
          
          <button
            onClick={() => commitSha && fetchDetailedCommit(commitSha)}
            disabled={loading || !commitSha}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Fetch Detailed
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => fetchCommit(commit.oid)}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Basic info
                    </button>
                    <button
                      onClick={() => fetchDetailedCommit(commit.oid)}
                      className="text-sm text-purple-500 hover:underline"
                    >
                      Detailed info
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Commit details (spans 2 columns) */}
        <div className="border rounded-lg p-4 bg-white md:col-span-2">
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 ${activeTab === 'basic' 
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                : 'text-gray-600'}`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`px-4 py-2 ${activeTab === 'detailed' 
                ? 'border-b-2 border-purple-500 text-purple-600 font-medium' 
                : 'text-gray-600'}`}
            >
              Detailed Info
            </button>
          </div>
          
          {activeTab === 'basic' ? (
            // Basic commit info
            !selectedCommit ? (
              <p className="text-gray-500">Select a commit to view basic details</p>
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
                  Click the "Detailed Info" tab to view specific file changes.
                </div>
              </div>
            )
          ) : (
            // Detailed commit info
            !detailedCommit ? (
              <p className="text-gray-500">Select a commit to view detailed changes</p>
            ) : (
              <div>
                <div className="mb-2">
                  <div className="font-mono text-sm">{detailedCommit.sha}</div>
                  <div className="font-medium text-lg">{detailedCommit.commit.message.split("\n")[0]}</div>
                  <div className="text-sm text-gray-600">
                    {detailedCommit.commit.author.name} &lt;{detailedCommit.commit.author.email}&gt; • 
                    {new Date(detailedCommit.commit.author.date).toLocaleString()}
                  </div>
                </div>
                
                <h3 className="font-medium mt-4 mb-2">Changes Summary</h3>
                <div className="p-3 bg-gray-50 rounded mb-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-green-600 font-medium">+{detailedCommit.stats.additions}</div>
                      <div className="text-xs text-gray-500">Additions</div>
                    </div>
                    <div>
                      <div className="text-red-600 font-medium">-{detailedCommit.stats.deletions}</div>
                      <div className="text-xs text-gray-500">Deletions</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-medium">{detailedCommit.files.length}</div>
                      <div className="text-xs text-gray-500">Files Changed</div>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-medium mt-4 mb-2">Files Changed</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {detailedCommit.files.map((file: any, index: number) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(file.status)}`}>
                          {file.status}
                        </span>
                        <span className="font-mono text-sm truncate">{file.filename}</span>
                      </div>
                      
                      <div className="flex gap-4 text-sm mb-2">
                        <div className="text-green-600">+{file.additions}</div>
                        <div className="text-red-600">-{file.deletions}</div>
                        <div className="text-gray-600">Changes: {file.changes}</div>
                      </div>
                      
                      {file.patch && (
                        <div className="mt-2">
                          <details>
                            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                              View code changes
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                              {file.patch}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
} 