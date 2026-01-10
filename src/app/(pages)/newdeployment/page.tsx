'use client';

import { useState } from 'react';
import { FormEngine, Loading, ToggleLoading, PageSection } from '@pixelated-tech/components';
import sites from '@/app/data/sites.json';
import formData from '@/app/data/deployform.json';
import './deployment.css';

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
  onChange?: (_values: string[]) => void;
}

interface RadioFieldProps {
  id?: string;
  checked?: string;
  onChange?: (_value: string) => void;
}

interface TextFieldProps {
  id?: string;
  value?: string;
  onChange?: (_value: string) => void;
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

	const handleSubmit = async () => {
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
					onChange: (value: string) => setCommitMessage(value)
				};
			} else if (field.props.id === 'submit') {
				(baseField.props as ButtonFieldProps) = {
					...field.props,
					disabled: loading || selectedSites.length === 0 || selectedEnvironments.length === 0 || !versionType || !commitMessage.trim(),
					text: loading ? 'Deploying...' : 'Deploy'
				};
			}

			return baseField;
		})
	};

	return (
		<PageSection maxWidth="1024px" columns={1}>
			<div className="deploy-page-wrapper">
				<Loading />
				<div className="deploy-page-container">
					<h1 className="deploy-page-title">New Deployment</h1>
					<div className="deploy-form-card">
						<FormEngine
							formData={dynamicFormData}
							onSubmitHandler={handleSubmit}
						/>
					</div>

					{result && (
						<div className="deploy-results-container">
							<h2 className="deploy-results-title">Deployment Results</h2>
							{result.results && Object.entries(result.results).map(([site, siteResult]) => (
								<div key={site} className="deploy-site-item">
									<h3 className="deploy-site-name">{site}</h3>
									{siteResult.prep && (
										<div className="deploy-step-section">
											<h4 className="deploy-step-title">Prep Steps</h4>
											<pre className="deploy-output-pre">{siteResult.prep as string}</pre>
										</div>
									)}
									{siteResult.environments && Object.entries(siteResult.environments).map(([env, output]: [string, string]) => (
										<div key={env} className="deploy-step-section">
											<h4 className="deploy-step-title-capitalize">{env} Environment</h4>
											<pre className="deploy-output-pre">{output}</pre>
										</div>
									))}
									{siteResult.error && <p className="deploy-error-text">❌ {siteResult.error}</p>}
									{!siteResult.environments && !siteResult.error && siteResult.message && (
										<p className="deploy-info-text">ℹ️ {siteResult.message}</p>
									)}
								</div>
							))}
							{result.error && <p className="deploy-global-error">{result.error}</p>}
						</div>
					)}
				</div>
			</div>
		</PageSection>
	);
}
