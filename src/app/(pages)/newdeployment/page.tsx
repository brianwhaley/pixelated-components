'use client';

import { useState } from 'react';
import { FormEngine, Loading, ToggleLoading, PageSection } from '@pixelated-tech/components';
import sites from '@/app/data/sites.json';
import formData from '@/app/data/deployform.json';

export default function DeployPage() {
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
  const [versionType, setVersionType] = useState('patch');
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    ToggleLoading({ show: true });
    setResult(null);

    try {
      // Deploy to each selected site
      const results: any = {};
      for (const site of selectedSites) {
        try {
          const response = await fetch('/api/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              site,
              environments: selectedEnvironments,
              versionType,
              commitMessage,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          results[site] = data;
        } catch (fetchError) {
          results[site] = { error: `Failed to call API: ${(fetchError as Error).message}` };
        }
      }
      
      setResult({ results });
    } catch (error) {
      setResult({ error: 'Error: ' + (error as Error).message });
    } finally {
      setLoading(false);
      ToggleLoading({ show: false });
    }
  };

  // Merge static formData with dynamic values and functions
  const dynamicFormData = {
    ...formData,
    fields: formData.fields.map((field: any) => ({
      ...field,
      props: {
        ...field.props,
        // Override dynamic properties
        ...(field.props.id === 'sites' && {
          options: sites.map(site => ({ value: site.name, text: site.name })),
          checked: selectedSites,
          onChange: (values: string[]) => {
            setSelectedSites(values);
          }
        }),
        ...(field.props.id === 'environments' && {
          checked: selectedEnvironments,
          onChange: (values: string[]) => {
            setSelectedEnvironments(values);
          }
        }),
        ...(field.props.id === 'versionType' && {
          checked: versionType,
          onChange: (value: string) => setVersionType(value)
        }),
        ...(field.props.id === 'commitMessage' && {
          value: commitMessage,
          onChange: (value: string) => setCommitMessage(value)
        }),
        ...(field.props.id === 'submit' && {
          disabled: loading || selectedSites.length === 0 || selectedEnvironments.length === 0 || !versionType || !commitMessage.trim(),
          text: loading ? 'Deploying...' : 'Deploy',
          onClick: handleSubmit
        })
      }
    }))
  };

  return (
    <PageSection maxWidth="1024px" columns={1}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
        <div className="max-w-2xl w-full mx-4">
        <h1 className="text-2xl font-bold mb-6 text-center">New Deployment</h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <FormEngine
            formData={dynamicFormData as any}
          />
        </div>

        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Deployment Results</h2>
            {result.results && Object.entries(result.results).map(([site, siteResult]: [string, any]) => (
              <div key={site} className="mb-4">
                <h3 className="font-medium">{site}</h3>
                {siteResult.prep && (
                  <div className="ml-4 mt-2">
                    <h4 className="text-sm font-medium">Prep Steps</h4>
                    <pre className="text-black bg-white p-2 rounded border text-sm overflow-x-auto whitespace-pre-wrap mt-1">{siteResult.prep as string}</pre>
                  </div>
                )}
                {siteResult.environments && Object.entries(siteResult.environments).map(([env, output]: [string, any]) => (
                  <div key={env} className="ml-4 mt-2">
                    <h4 className="text-sm font-medium capitalize">{env} Environment</h4>
                    <pre className="text-black bg-white p-2 rounded border text-sm overflow-x-auto whitespace-pre-wrap mt-1">{output as string}</pre>
                  </div>
                ))}
                {siteResult.error && <p className="text-red-600 ml-4">❌ {siteResult.error}</p>}
                {!siteResult.environments && !siteResult.error && siteResult.message && (
                  <p className="text-blue-600 ml-4">ℹ️ {siteResult.message}</p>
                )}
              </div>
            ))}
            {result.error && <p className="text-red-600">{result.error}</p>}
          </div>
        )}
        </div>
      </div>
    </PageSection>
  );
}
