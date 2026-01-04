'use client';

import React, { useState } from 'react';
import { FormEngine, Loading, ToggleLoading, PageSection } from '@pixelated-tech/components';
import sites from '@/app/data/sites.json';
import formData from '@/app/data/deployform.json';

interface DeploymentResult {
  error?: string;
  success?: boolean;
  message?: string;
  prep?: string;
  environments?: { [env: string]: string };
}

interface DeploymentResults {
  [siteName: string]: DeploymentResult;
}

interface DeploymentResponse {
  results?: DeploymentResults;
  error?: string;
}

interface FormField {
  component: string;
  props: {
    id: string;
    [key: string]: unknown;
  };
}

interface CheckboxFieldProps {
  id?: string;
  options?: Array<{ value: string; text: string }>;
  checked?: string[];
  onChange?: (values: string[]) => void;
}

interface RadioFieldProps {
  id?: string;
  checked?: string;
  onChange?: (value: string) => void;
}

interface TextFieldProps {
  id?: string;
  value?: string;
  onChange?: (value: string | React.ChangeEvent<HTMLTextAreaElement>) => void;
}

interface ButtonFieldProps {
  id?: string;
  disabled?: boolean;
  text?: string;
  onClick?: () => void;
}

export default function DeployPage() {
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
  const [versionType, setVersionType] = useState('patch');
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeploymentResponse | null>(null);

  const handleSubmit = async (_event: React.FormEvent) => {
    setLoading(true);
    ToggleLoading({ show: true });
    setResult(null);

    try {
      // Deploy to each selected site
      const results: DeploymentResults = {};
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
    fields: formData.fields.map((field: FormField) => {
      const baseField = { ...field };

      // Handle different field types with their specific props
      if (field.props.id === 'sites') {
        (baseField.props as CheckboxFieldProps) = {
          ...field.props,
          options: sites.map(site => ({ value: site.name, text: site.name })),
          checked: selectedSites,
          onChange: (values: string[]) => setSelectedSites(values)
        };
      } else if (field.props.id === 'environments') {
        (baseField.props as CheckboxFieldProps) = {
          ...field.props,
          checked: selectedEnvironments,
          onChange: (values: string[]) => setSelectedEnvironments(values)
        };
      } else if (field.props.id === 'versionType') {
        (baseField.props as RadioFieldProps) = {
          ...field.props,
          checked: versionType,
          onChange: (value: string) => setVersionType(value)
        };
      } else if (field.props.id === 'commitMessage') {
        (baseField.props as TextFieldProps) = {
          ...field.props,
          value: commitMessage,
          onChange: (value: string | React.ChangeEvent<HTMLTextAreaElement>) => {
            const stringValue = typeof value === 'string' ? value : value.target?.value || '';
            setCommitMessage(stringValue);
          }
        };
      } else if (field.props.id === 'submit') {
        (baseField.props as ButtonFieldProps) = {
          ...field.props,
          disabled: loading || selectedSites.length === 0 || selectedEnvironments.length === 0 || !versionType || !String(commitMessage || '').trim(),
          text: loading ? 'Deploying...' : 'Deploy'
        };
      }

      return baseField;
    })
  };

  return (
    <PageSection maxWidth="1024px" columns={1}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading />
        <div className="max-w-2xl w-full mx-4">
        <h1 className="text-2xl font-bold mb-6 text-center">New Deployment</h1>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <FormEngine
            formData={dynamicFormData}
            onSubmitHandler={handleSubmit}
          />
        </div>

        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Deployment Results</h2>
            {result.results && Object.entries(result.results).map(([site, siteResult]) => (
              <div key={site} className="mb-4">
                <h3 className="font-medium">{site}</h3>
                {siteResult.prep && (
                  <div className="ml-4 mt-2">
                    <h4 className="text-sm font-medium">Prep Steps</h4>
                    <pre className="text-black bg-white p-2 rounded border text-sm overflow-x-auto whitespace-pre-wrap mt-1">{siteResult.prep as string}</pre>
                  </div>
                )}
                {siteResult.environments && Object.entries(siteResult.environments).map(([env, output]: [string, string]) => (
                  <div key={env} className="ml-4 mt-2">
                    <h4 className="text-sm font-medium capitalize">{env} Environment</h4>
                    <pre className="text-black bg-white p-2 rounded border text-sm overflow-x-auto whitespace-pre-wrap mt-1">{output}</pre>
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
