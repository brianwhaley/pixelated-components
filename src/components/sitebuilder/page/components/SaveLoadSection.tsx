"use client";

import React, { useState, useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import type { PageData } from '../lib/types';

/**
 * SaveLoadSection — UI for saving and loading page JSON to/from the configured API endpoint.
 *
 * @param {object} [props.pageData] - Current page data object to be saved.
 * @param {function} [props.onLoad] - Callback invoked with loaded page data when a saved page is selected.
 * @param {string} [props.apiEndpoint] - Base API endpoint used for save/load operations.
 */
SaveLoadSection.propTypes = {
/** Current page data object to save */
	pageData: PropTypes.object.isRequired,
	/** Callback invoked when a saved page is loaded */
	onLoad: PropTypes.func.isRequired,
	/** API endpoint base for save/load interactions */
	apiEndpoint: PropTypes.string,
};
export type SaveLoadSectionType = InferProps<typeof SaveLoadSection.propTypes>;
export function SaveLoadSection({ pageData, onLoad, apiEndpoint = '/api/pagebuilder' }: SaveLoadSectionType) {
	const [pageName, setPageName] = useState('');
	const [savedPages, setSavedPages] = useState<string[]>([]);
	const [message, setMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showLoadList, setShowLoadList] = useState(false);

	// Fetch list of saved pages on mount
	useEffect(() => {
		fetchPages();
	}, [apiEndpoint]);

	async function fetchPages() {
		try {
			const response = await fetch(`${apiEndpoint}/list`);
			const result = await response.json();
			if (result.success) {
				setSavedPages(result.pages);
			}
		} catch (error) {
			console.error('Failed to fetch pages:', error);
		}
	}

	async function handleSave() {
		if (!pageName.trim()) {
			setMessage('Please enter a page name');
			return;
		}

		setIsLoading(true);
		setMessage('');

		try {
			const response = await fetch(`${apiEndpoint}/save`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: pageName, data: pageData })
			});

			const result = await response.json();
			
			if (result.success) {
				setMessage(`✓ ${result.message}`);
				fetchPages(); // Refresh list
				setTimeout(() => setMessage(''), 3000);
			} else {
				setMessage(`✗ ${result.message}`);
			}
		} catch (error) {
			setMessage(`✗ Failed to save: ${error}`);
		} finally {
			setIsLoading(false);
		}
	}

	async function handleLoad(name: string) {
		setIsLoading(true);
		setMessage('');

		try {
			const response = await fetch(`${apiEndpoint}/load?name=${encodeURIComponent(name)}`);
			const result = await response.json();
			
			if (result.success && result.data) {
				onLoad(result.data as PageData);
				setPageName(name);
				setShowLoadList(false);
				setMessage(`✓ Loaded "${name}"`);
				setTimeout(() => setMessage(''), 3000);
			} else {
				setMessage(`✗ ${result.message}`);
			}
		} catch (error) {
			setMessage(`✗ Failed to load: ${error}`);
		} finally {
			setIsLoading(false);
		}
	}

	async function handleDelete(name: string) {
		if (!confirm(`Delete page "${name}"? This cannot be undone.`)) {
			return;
		}

		setIsLoading(true);
		setMessage('');

		try {
			const response = await fetch(`${apiEndpoint}/delete?name=${encodeURIComponent(name)}`, {
				method: 'DELETE'
			});

			const result = await response.json();
			
			if (result.success) {
				setMessage(`✓ ${result.message}`);
				fetchPages(); // Refresh list
				setTimeout(() => setMessage(''), 3000);
			} else {
				setMessage(`✗ ${result.message}`);
			}
		} catch (error) {
			setMessage(`✗ Failed to delete: ${error}`);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '4px' }}>
			<div style={{ marginBottom: '0.5rem' }}>
				<label htmlFor="page-name" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
					Page Name:
				</label>
				<input
					id="page-name"
					type="text"
					value={pageName}
					onChange={(e) => setPageName(e.target.value)}
					placeholder="my-landing-page"
					disabled={isLoading}
					style={{
						width: '100%',
						padding: '0.5rem',
						border: '1px solid #ccc',
						borderRadius: '4px',
						fontSize: '1rem'
					}}
				/>
			</div>

			<div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
				<button
					onClick={handleSave}
					disabled={isLoading || !pageName.trim()}
					className="button"
					style={{
						flex: 1,
						background: '#4CAF50',
						color: 'white',
						opacity: isLoading || !pageName.trim() ? 0.5 : 1
					}}
				>
					<span role="img" aria-label="save">💾</span> Save Page
				</button>
				<button
					onClick={() => setShowLoadList(!showLoadList)}
					disabled={isLoading}
					className="button"
					style={{
						flex: 1,
						background: '#2196F3',
						color: 'white',
						opacity: isLoading ? 0.5 : 1
					}}
				>
					<span role="img" aria-label="folder">📁</span> {showLoadList ? 'Hide' : 'Load Page'}
				</button>
			</div>

			{showLoadList && (
				<div style={{
					marginTop: '0.5rem',
					padding: '0.5rem',
					border: '1px solid #ddd',
					borderRadius: '4px',
					background: 'white',
					maxHeight: '200px',
					overflowY: 'auto'
				}}>
					{savedPages.length === 0 ? (
						<p style={{ color: '#666', fontStyle: 'italic' }}>No saved pages</p>
					) : (
						<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
							{savedPages.map(page => (
								<li key={page} style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									padding: '0.5rem',
									borderBottom: '1px solid #eee'
								}}>
									<button
										onClick={() => handleLoad(page)}
										style={{
											flex: 1,
											textAlign: 'left',
											background: 'none',
											border: 'none',
											color: '#2196F3',
											cursor: 'pointer',
											padding: '0.25rem',
											fontSize: '1rem'
										}}
									>
										{page}
									</button>
									<button
										onClick={() => handleDelete(page)}
										style={{
											background: '#f44336',
											color: 'white',
											border: 'none',
											borderRadius: '4px',
											padding: '0.25rem 0.5rem',
											cursor: 'pointer',
											fontSize: '0.875rem'
										}}
									>
										<span role="img" aria-label="delete">🗑️</span>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			)}

			{message && (
				<div style={{
					marginTop: '0.5rem',
					padding: '0.5rem',
					borderRadius: '4px',
					background: message.startsWith('✓') ? '#d4edda' : '#f8d7da',
					color: message.startsWith('✓') ? '#155724' : '#721c24',
					fontSize: '0.875rem'
				}}>
					{message}
				</div>
			)}
		</div>
	);
}
