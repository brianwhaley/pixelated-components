"use client";

import React, { useState, useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { Modal } from '../../general/modal';
import { Tab } from '../../general/tab';
import { Accordion } from '../../general/accordion';
import { createGeminiApiService, GeminiRecommendationResponse } from '../../integrations/gemini-api.client';
import { FormEngine } from '../form/formengine';
import { FormValidationProvider } from '../form/formvalidator';
import * as FC from '../form/formcomponents';
import siteInfoForm from './siteinfo-form.json';
import visualDesignForm from './visualdesignform.json';
import routesForm from './routes-form.json';
import servicesForm from './services-form.json';
import defaultConfigData from '../../../data/routes.json';
import './ConfigBuilder.css';

// Debug logging: set to true to surface verbose AI/debug actions locally
const debug = false;


const RoutePropTypes = {
	name: PropTypes.string,
	path: PropTypes.string.isRequired,
	title: PropTypes.string,
	description: PropTypes.string,
	keywords: PropTypes.arrayOf(PropTypes.string),
	hidden: PropTypes.bool,
};
export type RouteType = InferProps<typeof RoutePropTypes>;

const SiteInfoPropTypes = {
	name: PropTypes.string.isRequired,
	author: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	email: PropTypes.string.isRequired,
	favicon: PropTypes.string.isRequired,
	favicon_sizes: PropTypes.string.isRequired,
	favicon_type: PropTypes.string.isRequired,
	theme_color: PropTypes.string.isRequired,
	background_color: PropTypes.string.isRequired,
	default_locale: PropTypes.string.isRequired,
	display: PropTypes.string.isRequired,
	image: PropTypes.string,
	image_height: PropTypes.string,
	image_width: PropTypes.string,
	telephone: PropTypes.string,
	address: PropTypes.shape({
		streetAddress: PropTypes.string.isRequired,
		addressLocality: PropTypes.string.isRequired,
		addressRegion: PropTypes.string.isRequired,
		postalCode: PropTypes.string.isRequired,
		addressCountry: PropTypes.string.isRequired,
	}),
	priceRange: PropTypes.string,
	sameAs: PropTypes.arrayOf(PropTypes.string.isRequired),
	keywords: PropTypes.string,
	openingHours: PropTypes.string,
	publisherType: PropTypes.string,
	copyrightYear: PropTypes.number,
	potentialAction: PropTypes.shape({
		'@type': PropTypes.string,
		target: PropTypes.string.isRequired,
		'query-input': PropTypes.string,
		queryInput: PropTypes.string,
	}),
	services: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		url: PropTypes.string,
		areaServed: PropTypes.arrayOf(PropTypes.string.isRequired),
	})),
};
export type SiteInfoType = InferProps<typeof SiteInfoPropTypes>;

const VisualDesignVariable = {
	value: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	group: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired
};
const VisualDesignPropTypes = {
	'primary-color': PropTypes.shape(VisualDesignVariable).isRequired,
	'secondary-color': PropTypes.shape(VisualDesignVariable).isRequired,
	'accent1-color': PropTypes.shape(VisualDesignVariable).isRequired,
	'accent2-color': PropTypes.shape(VisualDesignVariable).isRequired,
	'bg-color': PropTypes.shape(VisualDesignVariable).isRequired,
	'text-color': PropTypes.shape(VisualDesignVariable).isRequired,
	'header-font': PropTypes.shape(VisualDesignVariable).isRequired,
	'body-font': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-size1-min': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-size1-max': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-size2-min': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-size2-max': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-size3-min': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-size3-max': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-size4-min': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-size4-max': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-size5-min': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-size5-max': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-size6-min': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-size6-max': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-min-screen': PropTypes.shape(VisualDesignVariable).isRequired,
	'font-max-screen': PropTypes.shape(VisualDesignVariable).isRequired,
};
export type VisualDesignType = InferProps<typeof VisualDesignPropTypes>;

const SiteConfigPropTypes = {
	siteInfo: PropTypes.shape(SiteInfoPropTypes).isRequired,
	routes: PropTypes.arrayOf(PropTypes.shape(RoutePropTypes).isRequired).isRequired,
	visualdesign: PropTypes.shape(VisualDesignPropTypes).isRequired,
};
type SiteConfigType = InferProps<typeof SiteConfigPropTypes>;

type FullConfigType = SiteConfigType;

ConfigBuilder.propTypes = {
	initialConfig: PropTypes.shape(SiteConfigPropTypes),
	onSave: PropTypes.func,
};
export type ConfigBuilderType = InferProps<typeof ConfigBuilder.propTypes>;
export function ConfigBuilder(props: ConfigBuilderType) {
	const { initialConfig, onSave } = props;
	const defaultConfig: SiteConfigType = {
		siteInfo: {
			...defaultConfigData.siteInfo as SiteInfoType,
			services: (defaultConfigData.siteInfo as any).services || []
		},
		routes: [], // Start with empty routes, the JSON structure is different
		visualdesign: defaultConfigData.visualdesign as VisualDesignType
	};

	const [config, setConfig] = useState<FullConfigType>({
		...defaultConfig,
		...initialConfig,
		siteInfo: { ...defaultConfig.siteInfo, ...initialConfig?.siteInfo },
		routes: initialConfig?.routes || [],
		visualdesign: { ...(defaultConfig.visualdesign as VisualDesignType), ...initialConfig?.visualdesign }
	});

	const [socialLinks, setSocialLinks] = useState<string[]>(initialConfig?.siteInfo?.sameAs || ['']);
	const [isFormValid, setIsFormValid] = useState(false);

	// AI Recommendations state
	const [aiModalOpen, setAiModalOpen] = useState(false);
	const [currentRouteIndex, setCurrentRouteIndex] = useState<number | null>(null);
	const [aiRecommendations, setAiRecommendations] = useState<GeminiRecommendationResponse | null>(null);
	const [aiLoading, setAiLoading] = useState(false);
	const [acceptTitle, setAcceptTitle] = useState(false);
	const [acceptKeywords, setAcceptKeywords] = useState(false);
	const [acceptDescription, setAcceptDescription] = useState(false);

	// Validate form whenever config changes
	useEffect(() => {
		const siteInfo = config.siteInfo || {};
		const isValid = 
			String(siteInfo.name || '').trim() !== '' &&
			String(siteInfo.author || '').trim() !== '' &&
			String(siteInfo.description || '').trim() !== '' &&
			String(siteInfo.url || '').trim() !== '' &&
			String(siteInfo.email || '').trim() !== '' &&
			// Basic email validation
			/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siteInfo.email || '');
		
		setIsFormValid(isValid);
	}, [config]);

	// Handle AI modal visibility - now handled by Modal component isOpen prop
	// useEffect(() => {
	// 	console.log('AI modal effect running, aiModalOpen:', aiModalOpen);
	// 	if (aiModalOpen) {
	// 		const modal = document.getElementById('myModalai-recommendations');
	// 		console.log('Modal element found:', modal);
	// 		if (modal) {
	// 			modal.style.display = 'block';
	// 			console.log('Set modal display to block');
	// 		}
	// 	}
	// }, [aiModalOpen]);

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const jsonContent = e.target?.result as string;
				const parsedConfig = JSON.parse(jsonContent);
				
				// Validate the structure
				if (parsedConfig.siteInfo && parsedConfig.routes) {
					// Ensure keywords are arrays for all routes
					const normalizedRoutes = parsedConfig.routes.map((route: any) => ({
						...route,
						keywords: Array.isArray(route.keywords) 
							? route.keywords 
							: (typeof route.keywords === 'string' 
								? route.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0)
								: [])
					}));

					// Ensure services keywords/arrays are valid
					const normalizedServices = (parsedConfig.siteInfo.services || []).map((service: any) => ({
						...service,
						areaServed: Array.isArray(service.areaServed)
							? service.areaServed
							: (typeof service.areaServed === 'string'
								? service.areaServed.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
								: [])
					}));
					
					setConfig({
						...parsedConfig,
						siteInfo: {
							...parsedConfig.siteInfo,
							services: normalizedServices
						},
						routes: normalizedRoutes
					});
					setSocialLinks(parsedConfig.siteInfo.sameAs || ['']);
				} else {
					alert('Invalid configuration file. Expected siteInfo and routes properties.');
				}
			} catch {
				alert('Error parsing JSON file. Please ensure it contains valid JSON.');
			}
		};
		reader.readAsText(file);
		
		// Reset the input
		event.target.value = '';
	};

	useEffect(() => {
		if (initialConfig) {
			// Ensure keywords are arrays for all routes
			const normalizedRoutes = (initialConfig.routes || []).map((route: any) => ({
				...route,
				keywords: Array.isArray(route.keywords) 
					? route.keywords 
					: (typeof route.keywords === 'string' 
						? route.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0)
						: [])
			}));
			
			setConfig((prev: any) => ({
				siteInfo: { ...prev.siteInfo, ...initialConfig.siteInfo },
				routes: normalizedRoutes,
				visualdesign: initialConfig.visualdesign || prev.visualdesign || {}
			}));
			setSocialLinks(initialConfig.siteInfo?.sameAs || ['']);
		}
	}, [initialConfig]);

	// Prepare form data for FormEngine with current values
	const getNestedValue = (obj: any, path: string) => {
		return path.split('.').reduce((current, key) => current?.[key], obj);
	};

	const setNestedValue = (obj: any, path: string, value: any) => {
		const keys = path.split('.');
		const lastKey = keys.pop()!;
		const target = keys.reduce((current, key) => {
			if (!current[key]) current[key] = {};
			return current[key];
		}, obj);
		target[lastKey] = value;
	};

	const formData = {
		fields: siteInfoForm.fields.map(field => ({
			...field,
			props: {
				...field.props,
				value: getNestedValue(config.siteInfo, field.props.name) || '',
				defaultValue: getNestedValue(config.siteInfo, field.props.name) || (field.props as any).defaultValue || '',
				onChange: (value: any) => {
					// Handle both direct values and event objects
					let actualValue = value;
					if (value && typeof value === 'object' && value.target) {
						// It's an event object, extract the value
						const target = value.target;
						actualValue = target.type === 'checkbox' ? (target.checked ? target.value : '') : target.value;
					}
					
					setConfig((prev: any) => {
						const newSiteInfo = { ...prev.siteInfo };
						setNestedValue(newSiteInfo, field.props.name, actualValue);
						return {
							...prev,
							siteInfo: newSiteInfo
						};
					});
				}
			}
		}))
	};

	// Visual Design form data
	const visualFormData = {
		fields: (visualDesignForm.fields || []).map((field: any) => ({
			...field,
			props: {
				...field.props,
				value: (config.visualdesign && (config.visualdesign as any)[field.props.name]) ? ((config.visualdesign as any)[field.props.name].value ?? (config.visualdesign as any)[field.props.name]) : '',
				defaultValue: (config.visualdesign && (config.visualdesign as any)[field.props.name]) ? ((config.visualdesign as any)[field.props.name].value ?? (config.visualdesign as any)[field.props.name]) : (field.props as any).defaultValue || '',
				onChange: (value: any) => {
					// Handle both direct values and event objects
					let actualValue = value;
					if (value && typeof value === 'object' && value.target) {
						actualValue = value.target.value;
					}

					setConfig((prev: any) => ({
						...prev,
						visualdesign: {
							...(prev.visualdesign || {}),
							[field.props.name]: {
								...(prev.visualdesign && (prev.visualdesign as any)[field.props.name] 
									? (prev.visualdesign as any)[field.props.name] 
									: {}),
								value: actualValue
							}
						}
					}));
				}
			}
		}))
	};

	const handleFormSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const siteInfoData: any = {};
		
		// Extract form data
		for (const [key, value] of formData.entries()) {
			setNestedValue(siteInfoData, key, value);
		}

		// Update config with form data
		setConfig(prev => ({
			...prev,
			siteInfo: {
				...prev.siteInfo,
				...siteInfoData,
				sameAs: socialLinks.filter(link => link.trim() !== '')
			}
		}));
	};

	const updateAddress = (field: keyof NonNullable<SiteInfoType['address']>, value: string) => {
		setConfig(prev => ({
			...prev,
			siteInfo: { 
				...prev.siteInfo, 
				address: { 
					...(prev.siteInfo.address || {}),
					[field]: value 
				} as NonNullable<SiteInfoType['address']>
			}
		}));
	};

	const addSocialLink = () => {
		setSocialLinks(prev => [...prev, '']);
	};

	const updateSocialLink = (index: number, value: string) => {
		setSocialLinks(prev => prev.map((link, i) => i === index ? value : link));
	};

	const removeSocialLink = (index: number) => {
		setSocialLinks(prev => prev.filter((_, i) => i !== index));
	};

	const addRoute = () => {
		setConfig(prev => ({
			...prev,
			routes: [...prev.routes, { name: '', path: '', title: '', description: '', keywords: [], hidden: false }]
		}));
	};

	const updateRoute = (index: number, field: keyof RouteType, value: any) => {
		setConfig(prev => ({
			...prev,
			routes: prev.routes.map((route, i) =>
				i === index ? { ...route, [field]: value } : route
			)
		}));
	};

	const removeRoute = (index: number) => {
		setConfig(prev => ({
			...prev,
			routes: prev.routes.filter((_, i) => i !== index)
		}));
	};

	const addService = () => {
		setConfig(prev => ({
			...prev,
			siteInfo: {
				...prev.siteInfo,
				services: [...(prev.siteInfo.services || []), { name: '', description: '', url: '', areaServed: '' }]
			}
		} as any));
	};

	const updateService = (index: number, field: string, value: any) => {
		setConfig(prev => ({
			...prev,
			siteInfo: {
				...prev.siteInfo,
				services: (prev.siteInfo.services || []).map((service, i) =>
					i === index ? { ...service, [field]: value } : service
				)
			}
		} as any));
	};

	const removeService = (index: number) => {
		setConfig(prev => ({
			...prev,
			siteInfo: {
				...prev.siteInfo,
				services: (prev.siteInfo.services || []).filter((_, i) => i !== index)
			}
		} as any));
	};

	// Helper to convert comma-separated strings back to arrays for output
	const getProcessedConfig = (rawConfig: any) => {
		// Use a simple spread/map to avoid full deep clone where unnecessary, 
		// but enough to safely modify for output
		const processed = {
			...rawConfig,
			siteInfo: {
				...rawConfig.siteInfo,
				services: (rawConfig.siteInfo.services || []).map((service: any) => ({
					...service,
					areaServed: typeof service.areaServed === 'string'
						? service.areaServed.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
						: service.areaServed
				}))
			},
			routes: (rawConfig.routes || []).map((route: any) => ({
				...route,
				keywords: typeof route.keywords === 'string'
					? route.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0)
					: route.keywords
			}))
		};

		return processed;
	};

	const handleSave = () => {
		if (!isFormValid) {
			alert('Please fill in all required fields correctly before saving.');
			return;
		}
		onSave?.(getProcessedConfig(config));
	};

	const handleAiRecommendations = async (routeIndex: number) => {
		if (debug) console.log('handleAiRecommendations called with routeIndex:', routeIndex);
		setCurrentRouteIndex(routeIndex);
		setAiLoading(true);
		setAiModalOpen(true);
		setAcceptTitle(false);
		setAcceptKeywords(false);
		setAcceptDescription(false);

		try {
			const geminiService = createGeminiApiService('dummy-key'); // API key handled server-side

			const route = config.routes[routeIndex];
			const result = await geminiService.generateRouteRecommendations({
				route,
				siteInfo: config.siteInfo,
				baseUrl: config.siteInfo.url
			});

			if (result.success && result.data) {
				setAiRecommendations(result.data);
			} else {
				setAiRecommendations({ error: result.error || 'Failed to generate recommendations' });
			}
		} catch (error) {
			console.error('AI recommendation error:', error);
			setAiRecommendations({ error: 'Failed to generate AI recommendations' });
		} finally {
			setAiLoading(false);
		}
	};

	const handleAcceptAiRecommendations = () => {
		if (currentRouteIndex === null || !aiRecommendations) return;

		const updates: Partial<RouteType> = {};
		if (acceptTitle && aiRecommendations.title) {
			updates.title = aiRecommendations.title;
		}
		if (acceptKeywords && aiRecommendations.keywords) {
			updates.keywords = aiRecommendations.keywords;
		}
		if (acceptDescription && aiRecommendations.description) {
			updates.description = aiRecommendations.description;
		}

		if (Object.keys(updates).length > 0) {
			setConfig(prev => ({
				...prev,
				routes: prev.routes.map((route, i) =>
					i === currentRouteIndex ? { ...route, ...updates } : route
				)
			}));
		}

		setAiModalOpen(false);
		setAiRecommendations(null);
		setCurrentRouteIndex(null);
	};

	return (
		<div className="config-builder">
			<h2>Config Builder</h2>
			<div className="file-upload-section">
				<label htmlFor="config-file-upload" className="file-upload-label">
					Load Configuration File:
				</label>
				<input
					id="config-file-upload"
					type="file"
					accept=".json"
					onChange={handleFileUpload}
					className="file-upload-input"
				/>
			</div>
			<Tab
				tabs={[
					{
						id: 'siteinfo',
						label: 'Site Info',
						content: (
							<div className="site-info-section">
								<FormEngine 
									formData={formData as any} 
									onSubmitHandler={handleFormSubmit}
									name="siteinfo"
									id="siteinfo"
								/>
								<div className="address-section">
									<h4>Address</h4>
									<div className="field-group">
										<label htmlFor="street-address">Street Address</label>
										<input
											id="street-address"
											type="text"
											placeholder="Street Address"
											value={config.siteInfo.address?.streetAddress || ''}
											onChange={(e) => updateAddress('streetAddress', e.target.value)}
										/>
									</div>
									<div className="field-group">
										<label htmlFor="city">City</label>
										<input
											id="city"
											type="text"
											placeholder="City"
											value={config.siteInfo.address?.addressLocality || ''}
											onChange={(e) => updateAddress('addressLocality', e.target.value)}
										/>
									</div>
									<div className="field-group">
										<label htmlFor="state-region">State/Region</label>
										<input
											id="state-region"
											type="text"
											placeholder="State/Region"
											value={config.siteInfo.address?.addressRegion || ''}
											onChange={(e) => updateAddress('addressRegion', e.target.value)}
										/>
									</div>
									<div className="field-group">
										<label htmlFor="postal-code">Postal Code</label>
										<input
											id="postal-code"
											type="text"
											placeholder="Postal Code"
											value={config.siteInfo.address?.postalCode || ''}
											onChange={(e) => updateAddress('postalCode', e.target.value)}
										/>
									</div>
									<div className="field-group">
										<label htmlFor="country">Country</label>
										<input
											id="country"
											type="text"
											placeholder="Country"
											value={config.siteInfo.address?.addressCountry || ''}
											onChange={(e) => updateAddress('addressCountry', e.target.value)}
										/>
									</div>
								</div>
								<div className="social-links-section">
									<h4>Social Links</h4>
									{socialLinks.map((link, index) => (
										<div key={index} className="field-group social-link-item">
											<input
												type="url"
												placeholder="https://social-link.com"
												value={link}
												onChange={(e) => updateSocialLink(index, e.target.value)}
											/>
											<button type="button" onClick={() => removeSocialLink(index)}>Remove</button>
										</div>
									))}
									<button type="button" onClick={addSocialLink}>Add Social Link</button>
								</div>
							</div>
						)
					},
					{
						id: 'routes',
						label: 'Routes',
						content: (
							<FormValidationProvider>
								<div className="routes-section">
									<div className="routes-list">
										{config.routes.map((route, index) => (
											<div key={index} className="route-item">
												{routesForm.fields.map((field: any) => {
													const Component = (FC as any)[field.component];
													if (!Component) return null;
													
													let fieldValue = (route as any)[field.props.name];
													if (field.props.name === 'keywords' && Array.isArray(fieldValue)) {
														fieldValue = fieldValue.join(', ');
													}
													
													const fieldProps = {
														...field.props,
														id: `${field.props.id}-${index}`,
														...(field.component === 'FormTextarea' 
															? { defaultValue: fieldValue || '' }
															: field.props.type === 'checkbox'
																? { checked: fieldValue || false }
																: { value: fieldValue || '' }
														),
														onChange: (e: any) => {
															let value: any;
															// Handle both direct values and event objects
															const actualValue = (e && typeof e === 'object' && e.target) ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
															
															if (field.props.name === 'keywords' && typeof actualValue === 'string') {
																value = actualValue.split(',').map((s: string) => s.trim()).filter((s: string) => s);
															} else {
																value = actualValue;
															}
															updateRoute(index, field.props.name, value);
														}
													};
													
													return <Component key={fieldProps.id} {...fieldProps} />;
												})}
												<div className="route-buttons">
													<button 
														onClick={() => {
															if (debug) console.log('AI Recommend button clicked for route:', index);
															handleAiRecommendations(index);
														}}
														className="route-button ai-recommend"
													>
														<span className="ai-icon">✨</span> Recommend
													</button>
													<button 
														onClick={() => removeRoute(index)}
														className="route-button remove"
													>
														Remove
													</button>
												</div>
											</div>
										))}
									</div>
									<button onClick={addRoute}>Add Route</button>
								</div>
							</FormValidationProvider>
						)
					},
					{
						id: 'services',
						label: 'Services',
						content: (
							<FormValidationProvider>
								<div className="routes-section">
									<div className="routes-list">
										{(config.siteInfo.services || []).map((service, index) => (
											<div key={index} className="route-item">
												{servicesForm.fields.map((field: any) => {
													const Component = (FC as any)[field.component];
													if (!Component) return null;
													
													let fieldValue = (service as any)[field.props.name];
													if (field.props.name === 'areaServed' && Array.isArray(fieldValue)) {
														fieldValue = fieldValue.join(', ');
													}
													
													const fieldProps = {
														...field.props,
														id: `${field.props.id}-${index}`,
														...(field.component === 'FormTextarea' 
															? { defaultValue: fieldValue || '' }
															: { value: fieldValue || '' }
														),
														onChange: (e: any) => {
															// Handle both direct values and event objects
															const actualValue = (e && typeof e === 'object' && e.target) ? e.target.value : e;
															updateService(index, field.props.name, actualValue);
														}
													};
													
													return <Component key={fieldProps.id} {...fieldProps} />;
												})}
												<div className="route-buttons">
													<button 
														onClick={() => removeService(index)}
														className="route-button remove"
													>
														Remove
													</button>
												</div>
											</div>
										))}
									</div>
									<button onClick={addService}>Add Service</button>
								</div>
							</FormValidationProvider>
						)
					},
					{
						id: 'visualdesign',
						label: 'Visual Design',
						content: (
							<div className="visual-design-section">
								<FormEngine
									formData={visualFormData as any}
									name="visualdesign"
									id="visualdesign"
								/>
							</div>
						)
					}
				]}
				orientation="top"
			/>
			<button 
				onClick={handleSave} 
				disabled={!isFormValid}
				className={isFormValid ? 'save-button-valid' : 'save-button-invalid'}
			>
				Save Config
			</button>
			{!isFormValid && (
				<div className="validation-message">
					Please fill in all required fields (marked with *) before saving.
				</div>
			)}
			<Accordion items={[
				{
					title: 'Configuration Preview',
					content: <pre>{(() => {
						try {
							return JSON.stringify(getProcessedConfig(config), null, 2);
						} catch (e) {
							// Simple fallback that doesn't try to analyze the object deeply
							const errorMessage = e instanceof Error ? e.message : String(e);
							return `Configuration contains non-serializable data (functions, circular references, or DOM elements).\n\nError: ${errorMessage}\n\nTo debug, check the config object in browser dev tools for functions or complex objects.`;
						}
					})()}</pre>
				}
			]} />
			<Modal
				modalID="ai-recommendations"
				isOpen={aiModalOpen}
				handleCloseEvent={() => setAiModalOpen(false)}
				modalContent={
					<div className="ai-recommendations-modal">
						<h3>AI SEO Recommendations</h3>
						{currentRouteIndex !== null && (
							<p><strong>Route:</strong> {config.routes[currentRouteIndex].name || config.routes[currentRouteIndex].path}</p>
						)}
						
						{aiLoading ? (
							<div className="ai-loading">
								<p>Generating AI recommendations...</p>
								<div className="loading-spinner"></div>
							</div>
						) : aiRecommendations?.error ? (
							<div className="ai-error">
								<p>Error: {aiRecommendations.error}</p>
							</div>
						) : aiRecommendations ? (
							<div className="ai-recommendations">
								<div className="recommendation-item">
									<label>
										<input
											type="checkbox"
											checked={acceptTitle}
											onChange={(e) => setAcceptTitle(e.target.checked)}
										/>
										<strong>Title:</strong>
									</label>
									<div className="recommendation-content">
										<div className="current-value">
											<small>Current: {config.routes[currentRouteIndex!]?.title || 'None'}</small>
										</div>
										<div className="suggested-value">
											{aiRecommendations.title}
										</div>
									</div>
								</div>

								<div className="recommendation-item">
									<label>
										<input
											type="checkbox"
											checked={acceptKeywords}
											onChange={(e) => setAcceptKeywords(e.target.checked)}
										/>
										<strong>Keywords:</strong>
									</label>
									<div className="recommendation-content">
										<div className="current-value">
											<small>Current: {(() => {
												const keywords = config.routes[currentRouteIndex!]?.keywords;
												if (Array.isArray(keywords)) {
													return keywords.join(', ') || 'None';
												} else if (typeof keywords === 'string') {
													return keywords || 'None';
												}
												return 'None';
											})()}</small>
										</div>
										<div className="suggested-value">
											{aiRecommendations.keywords?.join(', ')}
										</div>
									</div>
								</div>

								<div className="recommendation-item">
									<label>
										<input
											type="checkbox"
											checked={acceptDescription}
											onChange={(e) => setAcceptDescription(e.target.checked)}
										/>
										<strong>Description:</strong>
									</label>
									<div className="recommendation-content">
										<div className="current-value">
											<small>Current: {config.routes[currentRouteIndex!]?.description || 'None'}</small>
										</div>
										<div className="suggested-value">
											{aiRecommendations.description}
										</div>
									</div>
								</div>
							</div>
						) : null}

						<div className="modal-actions">
							<button onClick={() => setAiModalOpen(false)}>Cancel</button>
							<button 
								onClick={handleAcceptAiRecommendations}
								disabled={!acceptTitle && !acceptKeywords && !acceptDescription}
								className="accept-button"
							>
								Accept Selected
							</button>
						</div>
					</div>
				}
			/>
		</div>
	);
}