'use client';

import { useState } from 'react';
import sites from '@/data/sites.json';

export default function DeployPage() {
  const [selectedSite, setSelectedSite] = useState('');
  const [environments, setEnvironments] = useState<string[]>([]);
  const [versionType, setVersionType] = useState('patch');
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleEnvironmentChange = (env: string) => {
    setEnvironments(prev =>
      prev.includes(env) ? prev.filter(e => e !== env) : [...prev, env]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: selectedSite,
          environments,
          versionType,
          commitMessage,
        }),
      });

      const data = await response.json();
      setResult(data.message || 'Deployment completed');
    } catch (error) {
      setResult('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">New Deployment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Site</label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a site</option>
            {sites.map((site) => (
              <option key={site.name} value={site.name}>
                {site.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Environments</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={environments.includes('dev')}
                onChange={() => handleEnvironmentChange('dev')}
                className="mr-2"
              />
              Dev
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={environments.includes('prod')}
                onChange={() => handleEnvironmentChange('prod')}
                className="mr-2"
              />
              Prod
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={environments.length === 2}
                onChange={() => setEnvironments(environments.length === 2 ? [] : ['dev', 'prod'])}
                className="mr-2"
              />
              Both
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Version Type</label>
          <div className="space-y-2">
            {['patch', 'minor', 'major'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  value={type}
                  checked={versionType === type}
                  onChange={(e) => setVersionType(e.target.value)}
                  className="mr-2"
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="commitMessage" className="block text-sm font-medium mb-1">Commit Message</label>
          <textarea
            id="commitMessage"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Deploying...' : 'Deploy'}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}