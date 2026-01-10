'use client';

import { useState } from 'react';
import { Accordion, PageSection } from '@pixelated-tech/components';
import './contentful.css';

interface ContentType {
  sys: {
    id: string;
    type: string;
  };
  name: string;
  description?: string;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
  }>;
}

interface MigrationStatus {
  contentTypes: 'pending' | 'complete' | 'error';
  entries: 'pending' | 'in-progress' | 'complete' | 'error';
  assets: 'pending' | 'in-progress' | 'complete' | 'error';
}

export default function ContentfulMigratePage() {
	// Form states
	const [sourceSpaceId, setSourceSpaceId] = useState('');
	const [sourceAccessToken, setSourceAccessToken] = useState('');
	const [targetSpaceId, setTargetSpaceId] = useState('');
	const [targetAccessToken, setTargetAccessToken] = useState('');

	// UI states
	const [isValidating, setIsValidating] = useState(false);
	const [isLoadingTypes, setIsLoadingTypes] = useState(false);
	const [isMigrating, setIsMigrating] = useState(false);
	const [validationMessage, setValidationMessage] = useState('');
	const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
	const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
	const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
		contentTypes: 'pending',
		entries: 'pending',
		assets: 'pending'
	});

	// Validation functions
	const validateCredentials = async (spaceId: string, accessToken: string, type: 'source' | 'target') => {
		setIsValidating(true);
		setValidationMessage('');

		try {
			const response = await fetch('/api/contentful/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ spaceId, accessToken })
			});

			const result = await response.json();

			if (result.success) {
				setValidationMessage(`${type === 'source' ? 'Source' : 'Target'} credentials are valid!`);
				return true;
			} else {
				setValidationMessage(`${type === 'source' ? 'Source' : 'Target'} validation failed: ${result.error}`);
				return false;
			}
		} catch {
			setValidationMessage(`Error validating ${type} credentials`);
			return false;
		} finally {
			setIsValidating(false);
		}
	};

	const validateBothSpaces = async () => {
		setIsValidating(true);
		setValidationMessage('');

		const sourceValid = await validateCredentials(sourceSpaceId, sourceAccessToken, 'source');
		const targetValid = await validateCredentials(targetSpaceId, targetAccessToken, 'target');

		setIsValidating(false);

		if (sourceValid && targetValid) {
			setValidationMessage('Both spaces validated successfully!');
			// Automatically load content types after successful validation
			await loadContentTypes();
			return true;
		} else {
			setValidationMessage('One or both spaces failed validation. Please check your credentials.');
			return false;
		}
	};

	// Load content types
	const loadContentTypes = async () => {
		if (!sourceSpaceId || !sourceAccessToken) {
			alert('Please enter source credentials first');
			return;
		}

		setIsLoadingTypes(true);
		try {
			const response = await fetch('/api/contentful/content-types', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					spaceId: sourceSpaceId,
					accessToken: sourceAccessToken
				})
			});

			const result = await response.json();

			if (result.success) {
				setContentTypes(result.data);
				setMigrationStatus(prev => ({ ...prev, contentTypes: 'complete' }));
			} else {
				alert(`Error loading content types: ${result.error}`);
			}
		} catch {
			alert('Error loading content types');
		} finally {
			setIsLoadingTypes(false);
		}
	};

	// Start migration
	const startMigration = async () => {
		if (!targetSpaceId || !targetAccessToken) {
			alert('Please enter target credentials');
			return;
		}

		if (selectedContentTypes.length === 0) {
			alert('Please select content types to migrate');
			return;
		}

		setIsMigrating(true);
		setMigrationStatus(prev => ({ ...prev, entries: 'in-progress' }));

		try {
			// Migrate each selected content type
			const selectedContentTypeObjects = contentTypes.filter(ct => selectedContentTypes.includes(ct.sys.id));

			for (const contentType of selectedContentTypeObjects) {
				const response = await fetch('/api/contentful/migrate', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						sourceSpaceId,
						sourceAccessToken,
						targetSpaceId,
						targetAccessToken,
						contentTypeId: contentType.sys.id
					})
				});

				const result = await response.json();

				if (!result.success) {
					alert(`Migration failed for ${contentType.name}: ${result.error}`);
					setMigrationStatus(prev => ({ ...prev, entries: 'error' }));
					return;
				}
			}

			setMigrationStatus(prev => ({ ...prev, entries: 'complete', assets: 'complete' }));
			alert('Migration completed successfully!');
		} catch {
			alert('Migration failed');
			setMigrationStatus(prev => ({ ...prev, entries: 'error' }));
		} finally {
			setIsMigrating(false);
		}
	};

	// Accordion data for configuration
	const accordionItems = [
		{
			title: '1. Configuration & Validation',
			content: (
				<div className="space-y-4">
					<div className="contentful-credentials-grid">
						<div className="contentful-field-group">
							<label className="contentful-label">Source Space ID</label>
							<input
								type="text"
								className="contentful-input"
								value={sourceSpaceId}
								onChange={(e) => setSourceSpaceId(e.target.value)}
								placeholder="Source space ID"
							/>
						</div>
						<div className="contentful-field-group">
							<label className="contentful-label">Source Access Token</label>
							<input
								type="password"
								className="contentful-input"
								value={sourceAccessToken}
								onChange={(e) => setSourceAccessToken(e.target.value)}
								placeholder="Source access token"
							/>
						</div>
						<div className="contentful-field-group">
							<label className="contentful-label">Target Space ID</label>
							<input
								type="text"
								className="contentful-input"
								value={targetSpaceId}
								onChange={(e) => setTargetSpaceId(e.target.value)}
								placeholder="Target space ID"
							/>
						</div>
						<div className="contentful-field-group">
							<label className="contentful-label">Target Access Token</label>
							<input
								type="password"
								className="contentful-input"
								value={targetAccessToken}
								onChange={(e) => setTargetAccessToken(e.target.value)}
								placeholder="Target access token"
							/>
						</div>
					</div>
					<div className="contentful-actions">
						<button
							onClick={validateBothSpaces}
							disabled={isValidating || isLoadingTypes || !sourceSpaceId || !sourceAccessToken || !targetSpaceId || !targetAccessToken}
							className="contentful-button-primary"
						>
							{isValidating ? 'Validating...' : isLoadingTypes ? 'Loading Content Types...' : 'Validate & Load Content Types'}
						</button>
					</div>
					{validationMessage && (
						<div className={`contentful-validation-box ${validationMessage.includes('valid') ? 'contentful-validation-box-success' : 'contentful-validation-box-error'}`}>
							{validationMessage}
						</div>
					)}
				</div>
			),
			open: true
		},
		{
			title: '2. Content Type Selection & Migration',
			content: (
				<div className="space-y-4">
					{contentTypes.length > 0 ? (
						<>
							<div>
								<label className="contentful-label">Select Content Types to Migrate</label>
								<div className="contentful-selection-box space-y-2">
									{contentTypes.map((ct) => (
										<div key={ct.sys.id} className="contentful-selection-item">
											<input
												type="checkbox"
												id={ct.sys.id}
												checked={selectedContentTypes.includes(ct.sys.id)}
												onChange={(e) => {
													if (e.target.checked) {
														setSelectedContentTypes([...selectedContentTypes, ct.sys.id]);
													} else {
														setSelectedContentTypes(selectedContentTypes.filter(id => id !== ct.sys.id));
													}
												}}
												className="contentful-checkbox"
											/>
											<label htmlFor={ct.sys.id} className="cursor-pointer">
												<div className="contentful-selection-item-name">{ct.name}</div>
												<div className="contentful-selection-item-details">{ct.sys.id} • {ct.fields.length} fields</div>
												{ct.description && <div className="contentful-selection-item-description">{ct.description}</div>}
											</label>
										</div>
									))}
								</div>
								<div className="contentful-item-details mt-3">
									{selectedContentTypes.length} of {contentTypes.length} content types selected
								</div>
							</div>
							<div className="contentful-actions">
								<button
									onClick={startMigration}
									disabled={isMigrating || selectedContentTypes.length === 0}
									className="contentful-button-purple"
								>
									{isMigrating ? 'Migrating...' : `Migrate ${selectedContentTypes.length} Content Type${selectedContentTypes.length !== 1 ? 's' : ''}`}
								</button>
							</div>
						</>
					) : (
						<div className="contentful-placeholder-text">
							<div className="contentful-placeholder-title">No content types loaded</div>
							<div className="contentful-status-subtext">Validate your spaces above to load content types</div>
						</div>
					)}
				</div>
			),
			open: contentTypes.length > 0
		}
	];

	return (
		<PageSection maxWidth="1024px" columns={1}>
			<div className="contentful-items">
				<div className="contentful-items-header">
					<h1>Contentful Migration</h1>
					<p>Migrate content types from one Contentful space to another</p>
				</div>

				{/* Migration Status */}
				<div className="contentful-item">
					<div className="contentful-item-body">
						<h2>Migration Status</h2>
						<div className="space-y-4">
							<div className="contentful-status-row">
								<div>
									<div className="contentful-status-label">Content Types</div>
									<div className="contentful-status-subtext">Load and validate content models</div>
								</div>
								<div className={`contentful-status-value ${
									migrationStatus.contentTypes === 'complete' ? 'contentful-status-complete' :
										migrationStatus.contentTypes === 'error' ? 'contentful-status-error' : 'contentful-status-pending'
								}`}>
									{migrationStatus.contentTypes === 'complete' ? 'Complete' :
										migrationStatus.contentTypes === 'error' ? 'Error' : 'Pending'}
								</div>
							</div>

							<div className="contentful-status-row">
								<div>
									<div className="contentful-status-label">Migration</div>
									<div className="contentful-status-subtext">Copy content types to target space</div>
								</div>
								<div className={`contentful-status-value ${
									migrationStatus.entries === 'complete' ? 'contentful-status-complete' :
										migrationStatus.entries === 'error' ? 'contentful-status-error' :
											migrationStatus.entries === 'in-progress' ? 'contentful-status-in-progress' : 'contentful-status-pending'
								}`}>
									{migrationStatus.entries === 'complete' ? 'Complete' :
										migrationStatus.entries === 'error' ? 'Error' :
											migrationStatus.entries === 'in-progress' ? 'In Progress' : 'Pending'}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Migration Configuration */}
				<div className="contentful-item">
					<div className="contentful-item-body">
						<h2>Migration Configuration</h2>
						<Accordion items={accordionItems} />
					</div>
				</div>
			</div>
		</PageSection>
	);
}