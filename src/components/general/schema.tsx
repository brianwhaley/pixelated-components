'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';





/* ========================================
	SCHEMA HELPER COMPONENTS
======================================== */

function SchemaScript({ schema }: { schema: any }) {
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}





/* ========================================
	BLOG POSTING SCHEMA COMPONENTS
======================================== */

/**
 * SchemaBlogPosting — Inject a JSON-LD <script> tag containing a BlogPosting schema object.
 *
 * @param {object} [props.post] - Structured JSON-LD object representing a blog post (BlogPosting schema).
 */
SchemaBlogPosting.propTypes = {
/** Structured BlogPosting JSON-LD object */
	post: PropTypes.object.isRequired,
};
export type SchemaBlogPostingType = InferProps<typeof SchemaBlogPosting.propTypes>;
export function SchemaBlogPosting(props: SchemaBlogPostingType) {
	const { post } = props;
	return (
		<SchemaScript schema={post} />
	);
}





/* ========================================
	BREADCRUMB SCHEMA COMPONENTS
======================================== */

import type { Route } from './metadata.functions';

interface BreadcrumbListItem {
	'@type': string;
	'position': number;
	'name': string;
	'item': string;
}

interface BreadcrumbListJsonLD {
	'@context': string;
	'@type': string;
	'itemListElement': BreadcrumbListItem[];
}

/**
 * Build breadcrumb trail from root to current path.
 * e.g., "/store/item-slug" produces ["/", "/store", "/store/item-slug"]
 */
function buildPathSegments(currentPath: string): string[] {
	const segments = ['/'];
	if (currentPath === '/') return segments;

	const parts = currentPath.split('/').filter(Boolean);
	let accumulated = '';

	for (const part of parts) {
		accumulated += '/' + part;
		segments.push(accumulated);
	}

	return segments;
}

/**
 * Determine breadcrumb name for a path segment.
 * Uses route name if exact match found, otherwise uses humanized path segment.
 */
function getSegmentName(routes: Route[], path: string, segment: string): string {
	if (path === '/') return 'Home';

	// Only use exact route matches with valid paths to avoid duplicating parent breadcrumb names
	const route = routes.find((r) => r.path && r.path === path);
	if (route) return route.name || segment;

	// Fallback: humanize the path segment
	return segment
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * BreadcrumbListSchema — auto-generates a breadcrumb list as JSON-LD from routes.json data.
 * Parses the current path, builds breadcrumb trail by matching path segments to routes array,
 * and embeds as schema.org/BreadcrumbList for SEO rich snippets.
 * Accepts flexible route objects from routes.json with any additional properties.
 *
 * @param {array} [props.routes] - Routes array from routes.json with name and optional path properties.
 * @param {string} [props.currentPath] - Current page path (e.g. "/store/vintage-oakley"). Defaults to "/" if not provided.
 * @param {string} [props.siteUrl] - Full domain URL from siteInfo.url. Defaults to https://example.com.
 */
BreadcrumbListSchema.propTypes = {
	/** Routes array from routes.json. Accepts routes with any properties; only uses name and path. */
	routes: PropTypes.arrayOf(PropTypes.object).isRequired,
	/** Current page path to generate breadcrumbs for (e.g. "/store/item-slug"). Defaults to "/". */
	currentPath: PropTypes.string,
	/** Site domain URL for constructing full breadcrumb URLs. Defaults to https://example.com. */
	siteUrl: PropTypes.string,
};
export type BreadcrumbListSchemaType = InferProps<typeof BreadcrumbListSchema.propTypes>;
export function BreadcrumbListSchema({
	routes,
	currentPath = '/',
	siteUrl = 'https://example.com',
}: BreadcrumbListSchemaType) {
	// Type-safe conversion: routes prop is now flexible (accepts any object)
	// Filter to ensure only valid Route objects with 'name' property
	const validRoutes: Route[] = (Array.isArray(routes)
		? routes.filter((r): r is Route => !!(r && typeof r === 'object' && 'name' in r))
		: []) as Route[];

	const pathSegments = buildPathSegments(currentPath || '/');
	const finalSiteUrl = siteUrl || 'https://example.com';

	const itemListElement: BreadcrumbListItem[] = pathSegments.map(
		(path, index) => {
			const segment = path.split('/').filter(Boolean).pop() || 'Home';
			return {
				'@type': 'ListItem',
				'position': index + 1,
				'name': getSegmentName(validRoutes, path, segment),
				'item': `${finalSiteUrl.replace(/\/$/, '')}${path}`,
			};
		}
	);

	const jsonLD: BreadcrumbListJsonLD = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		'itemListElement': itemListElement,
	};

	return (
		<SchemaScript schema={jsonLD} />
	);
}





/* ========================================
	FAQ SCHEMA COMPONENTS
======================================== */

interface SchemaFAQProps {
  faqsData: any;
}

// normalizeFaqs turns a JSON-LD FAQPage payload into a form where each
// question has a single `acceptedAnswer.text` string.  Some of our data
// sources (WordPress, CMS exports) allow multiple answer fragments; we
// merge them here so the final JSON remains valid for search engines.
function normalizeFaqs(data: any): any {
	if (!data || typeof data !== 'object') return data;
	const faqs = JSON.parse(JSON.stringify(data));
	if (Array.isArray(faqs.mainEntity)) {
		faqs.mainEntity.forEach((entry: any) => {
			if (entry && entry.acceptedAnswer) {
				const ans = entry.acceptedAnswer;
				if (ans && Array.isArray(ans.text)) {
					ans.text = ans.text.join(' ');
				}
			}
		});
	}
	return faqs;
}

/**
 * SchemaFAQ — Inject a JSON-LD <script> tag containing an FAQPage schema object.
 *
 * @param {object} [props.faqsData] - Structured JSON-LD object representing an FAQ page (FAQPage schema).
 */
SchemaFAQ.propTypes = {
	/** Structured FAQPage JSON-LD object */
	faqsData: PropTypes.object.isRequired,
};
export type SchemaFAQType = InferProps<typeof SchemaFAQ.propTypes>;
export function SchemaFAQ({ faqsData }: SchemaFAQType) {
	const normalized = normalizeFaqs(faqsData);
	return (
		<SchemaScript schema={normalized} />
	);
}







/* ========================================
	LOCAL BUSINESS SCHEMA COMPONENTS
======================================== */

import type { SiteInfo } from '../config/config.types';

/**
 * LocalBusiness Schema Component
 * Generates JSON-LD structured data for SEO
 * https://schema.org/LocalBusiness
 * 
 * This component uses siteInfo passed as props to generate schema data.
 * It does not use client-side hooks and can be rendered on the server.
 */

/**
 * LocalBusinessSchema — generates JSON-LD for a LocalBusiness using provided props or a fallback `siteInfo`.
 *
 * @param {string} [props.name] - Business name (overrides siteInfo.name).
 * @param {object} [props.address] - Address object containing streetAddress, addressLocality, addressRegion, postalCode, and addressCountry.
 * @param {string} [props.streetAddress] - Street address line.
 * @param {string} [props.addressLocality] - City or locality.
 * @param {string} [props.addressRegion] - State, region or province.
 * @param {string} [props.postalCode] - Postal/ZIP code.
 * @param {string} [props.addressCountry] - Country (defaults to 'United States' when missing).
 * @param {string} [props.telephone] - Contact phone number.
 * @param {string} [props.url] - Canonical website URL.
 * @param {string} [props.logo] - Logo image URL.
 * @param {string} [props.image] - Representative image URL.
 * @param {oneOfType} [props.openingHours] - Opening hours string or array in schema.org format.
 * @param {string} [props.description] - Short business description.
 * @param {string} [props.email] - Contact email address.
 * @param {string} [props.priceRange] - Price range (e.g. '$$', optional).
 * @param {arrayOf} [props.sameAs] - Array of social/profile URLs for schema 'sameAs'.
 * @param {object} [props.siteInfo] - Site-level fallback information object.
 */
LocalBusinessSchema.propTypes = {
/** Business name to include in schema (falls back to siteInfo.name). */
	name: PropTypes.string,
	/** Address object for the business */
	address: PropTypes.shape({
		/** Street address for the business. */
		streetAddress: PropTypes.string,
		/** City or locality for the business address. */
		addressLocality: PropTypes.string,
		/** State/region for the business address. */
		addressRegion: PropTypes.string,
		/** Postal or ZIP code for the address. */
		postalCode: PropTypes.string,
		/** Country for the address (defaults to United States when absent). */
		addressCountry: PropTypes.string,
	}),
	/** Street address for the business. */
	streetAddress: PropTypes.string,
	/** City or locality for the business address. */
	addressLocality: PropTypes.string,
	/** State/region for the business address. */
	addressRegion: PropTypes.string,
	/** Postal or ZIP code for the address. */
	postalCode: PropTypes.string,
	/** Country for the address (defaults to United States when absent). */
	addressCountry: PropTypes.string,
	/** Contact telephone number. */
	telephone: PropTypes.string,
	/** Canonical website URL. */
	url: PropTypes.string,
	/** Logo image URL for schema/logo property. */
	logo: PropTypes.string,
	/** Representative image URL. */
	image: PropTypes.string,
	/** Opening hours as a string or array in schema.org format (e.g., "Mo-Fr 09:00-17:00"). */
	openingHours: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
	/** Short description for schema. */
	description: PropTypes.string,
	/** Contact email address. */
	email: PropTypes.string,
	/** Price range string (e.g. '$$'). */
	priceRange: PropTypes.string,
	/** Array of profile/URL strings for sameAs (social links). */
	sameAs: PropTypes.arrayOf(PropTypes.string), // Social media profiles
	/** Site-level fallback information object (used when props omitted). */
	siteInfo: PropTypes.object // Required siteinfo from parent component
};
export type LocalBusinessSchemaType = InferProps<typeof LocalBusinessSchema.propTypes>;
export function LocalBusinessSchema (props: LocalBusinessSchemaType) {
	// const config = usePixelatedConfig();
	const siteInfo = props.siteInfo as SiteInfo | undefined;

	// Use props if provided, otherwise fall back to siteInfo
	const name = props.name || siteInfo?.name;
	const address = props.address || siteInfo?.address;
	const streetAddress = props.streetAddress || siteInfo?.address?.streetAddress;
	const addressLocality = props.addressLocality || siteInfo?.address?.addressLocality;
	const addressRegion = props.addressRegion || siteInfo?.address?.addressRegion;
	const postalCode = props.postalCode || siteInfo?.address?.postalCode;
	const addressCountry = props.addressCountry || siteInfo?.address?.addressCountry || 'United States';
	const telephone = props.telephone || siteInfo?.telephone;
	const url = props.url || siteInfo?.url;
	const logo = props.logo || siteInfo?.image;
	const image = props.image || siteInfo?.image || logo;
	const openingHours = props.openingHours;
	const description = props.description || siteInfo?.description;
	const email = props.email || siteInfo?.email;
	const priceRange = props.priceRange || siteInfo?.priceRange;
	const sameAs = props.sameAs || siteInfo?.sameAs;
	const schemaData = {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		name,
		address: {
			'@type': 'PostalAddress',
			...( address || {
				streetAddress,
				addressLocality,
				addressRegion,
				postalCode,
				addressCountry
			})
		},
		telephone,
		url,
		...(logo && { logo }),
		...(image && { image }),
		...(openingHours && { openingHours }),
		...(description && { description }),
		...(email && { email }),
		...(priceRange && { priceRange }),
		...(sameAs && sameAs.length > 0 && { sameAs })
	};

	return (
		<SchemaScript schema={schemaData} />
	);
}





/* ========================================
	PODCAST SCHEMA COMPONENTS
======================================== */

/**
 * SchemaPodcastEpisode — Inject a JSON-LD <script> tag containing a PodcastEpisode schema object.
 *
 * @param {object} [props.episode] - Structured JSON-LD object representing a podcast episode (PodcastEpisode schema).
 */
SchemaPodcastEpisode.propTypes = {
	episode: PropTypes.object.isRequired,
};
export type SchemaPodcastEpisodeType = InferProps<typeof SchemaPodcastEpisode.propTypes>;
export function SchemaPodcastEpisode(props: SchemaPodcastEpisodeType) {
	const { episode } = props;
	return (
		<SchemaScript schema={episode} />
	);
}

/**
 * SchemaPodcastSeries — Inject a JSON-LD <script> tag containing a PodcastSeries schema object.
 *
 * @param {object} [props.series] - Structured JSON-LD object representing a podcast series (PodcastSeries schema).
 */
SchemaPodcastSeries.propTypes = {
	series: PropTypes.object.isRequired,
};
export type SchemaPodcastSeriesType = InferProps<typeof SchemaPodcastSeries.propTypes>;
export function SchemaPodcastSeries(props: SchemaPodcastSeriesType) {
	const { series } = props;
	return (
		<SchemaScript schema={series} />
	);
}





/* ========================================
	PRODUCT SCHEMA COMPONENTS
======================================== */

/**
 * ProductSchema — embeds a product/offer as JSON-LD for SEO (schema.org/Product).
 *
 * @param {shape} [props.product] - Product object conforming to schema.org/Product; will be serialized as JSON-LD.
 * @param {string} [props.product.name] - The product name.
 * @param {string} [props.product.description] - Product description.
 * @param {shape} [props.product.brand] - Brand information (name and @type).
 * @param {shape} [props.product.offers] - Offer information including price, currency, URL, and availability.
 */
ProductSchema.propTypes = {
	/** Product information object to be serialized as JSON-LD. */
	product: PropTypes.shape({
		'@context': PropTypes.string.isRequired,
		'@type': PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		description: PropTypes.string,
		image: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
		brand: PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		}),
		offers: PropTypes.oneOfType([
			PropTypes.shape({
				'@type': PropTypes.string.isRequired,
				url: PropTypes.string,
				priceCurrency: PropTypes.string,
				price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
				availability: PropTypes.string,
			}),
			PropTypes.arrayOf(
				PropTypes.shape({
					'@type': PropTypes.string.isRequired,
					url: PropTypes.string,
					priceCurrency: PropTypes.string,
					price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
					availability: PropTypes.string,
				})
			)
		]),
		aggregateRating: PropTypes.shape({
			'@type': PropTypes.string,
			ratingValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			reviewCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		}),
	}).isRequired,
};
export type ProductSchemaType = InferProps<typeof ProductSchema.propTypes>;
export function ProductSchema(props: ProductSchemaType) {
	const { product } = props;
	return (
		<SchemaScript schema={product} />
	);
}






/* ========================================
	RECIPE SCHEMA COMPONENTS
======================================== */

/**
 * Recipe Schema Component
 * Generates JSON-LD structured data for recipes
 * https://schema.org/Recipe
 */

/**
 * RecipeSchema — embeds a recipe as JSON-LD for SEO (schema.org/Recipe).
 *
 * @param {shape} [props.recipe] - Recipe object conforming to schema.org/Recipe; will be serialized as JSON-LD.
 * @param {string} [props.name] - Recipe title.
 * @param {string} [props.description] - Short recipe description.
 * @param {shape} [props.author] - Author information (name and @type).
 * @param {string} [props.datePublished] - ISO date the recipe was published.
 * @param {string} [props.image] - Primary image URL for the recipe.
 * @param {string} [props.recipeYield] - Yield or serving size (e.g., '4 servings').
 * @param {string} [props.prepTime] - Prep time in ISO 8601 duration (e.g. 'PT20M').
 * @param {string} [props.cookTime] - Cook time in ISO 8601 duration.
 * @param {string} [props.totalTime] - Total time in ISO 8601 duration.
 * @param {string} [props.recipeCategory] - Category of the recipe (e.g., 'Dessert').
 * @param {string} [props.recipeCuisine] - Cuisine (e.g., 'Italian').
 * @param {arrayOf} [props.recipeIngredient] - List of ingredient strings.
 * @param {arrayOf} [props.recipeInstructions] - Structured list of instruction steps or paragraphs.
 * @param {string} [props.license] - License URL or short string for the recipe content.
 */
RecipeSchema.propTypes = {
/** Recipe information object to be serialized as JSON-LD. */
	recipe: PropTypes.shape({
		'@context': PropTypes.string.isRequired,
		'@type': PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		description: PropTypes.string,
		author: PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		}),
		datePublished: PropTypes.string,
		image: PropTypes.string,
		recipeYield: PropTypes.string,
		prepTime: PropTypes.string,
		cookTime: PropTypes.string,
		totalTime: PropTypes.string,
		recipeCategory: PropTypes.string,
		recipeCuisine: PropTypes.string,
		recipeIngredient: PropTypes.arrayOf(PropTypes.string),
		recipeInstructions: PropTypes.arrayOf(PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			text: PropTypes.string.isRequired,
		})),
		license: PropTypes.string,
	}).isRequired,
};
export type RecipeSchemaType = InferProps<typeof RecipeSchema.propTypes>;
export function RecipeSchema(props: RecipeSchemaType) {
	const { recipe } = props;
	return (
		<SchemaScript schema={recipe} />
	);
}







/* ========================================
	REVIEW SCHEMA COMPONENTS
======================================== */

/**
 * ReviewSchema — embeds a review as JSON-LD for SEO (schema.org/Review).
 *
 * @param {shape} [props.review] - Review object conforming to schema.org/Review; will be serialized as JSON-LD.
 * @param {string} [props.review.name] - The headline or title of the review.
 * @param {string} [props.review.reviewBody] - The body of the review content.
 * @param {string} [props.review.datePublished] - ISO date the review was published.
 * @param {shape} [props.review.author] - Author information (name and @type).
 * @param {shape} [props.review.itemReviewed] - The item being reviewed (product, service, etc.).
 * @param {shape} [props.review.reviewRating] - Rating information including ratingValue, bestRating, worstRating.
 * @param {shape} [props.review.publisher] - Organization publishing the review.
 */
ReviewSchema.propTypes = {
	/** Review information object to be serialized as JSON-LD. */
	review: PropTypes.shape({
		'@context': PropTypes.string.isRequired,
		'@type': PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		reviewBody: PropTypes.string,
		datePublished: PropTypes.string,
		author: PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		}),
		itemReviewed: PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			name: PropTypes.string,
		}),
		reviewRating: PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			ratingValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			bestRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			worstRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		}),
		publisher: PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			name: PropTypes.string,
		}),
	}).isRequired,
};
export type ReviewSchemaType = InferProps<typeof ReviewSchema.propTypes>;
export function ReviewSchema(props: ReviewSchemaType) {
	const { review } = props;
	return (
		<SchemaScript schema={review} />
	);
}








/* ========================================
	SERVICES SCHEMA COMPONENTS
======================================== */

/**
 * Services Schema Component
 * Generates JSON-LD structured data for services
 * https://schema.org/Service
 */

/**
 * ServicesSchema — Inject JSON-LD <script> tags for each service offered by the business, using schema.org/Service format.
 *
 * @param {object} [props.siteInfo] - Optional site information object containing business details and services array.
 * @param {object} [props.provider] - Optional provider information object to override siteInfo for the service provider.
 * @param {array} [props.services] - Optional array of service objects to override siteInfo.services.
 */
ServicesSchema.propTypes = {
	siteInfo: PropTypes.shape({
		name: PropTypes.string,
		url: PropTypes.string,
		image: PropTypes.string,
		telephone: PropTypes.string,
		email: PropTypes.string,
		services: PropTypes.arrayOf(PropTypes.shape({
			name: PropTypes.string.isRequired,
			description: PropTypes.string.isRequired,
			url: PropTypes.string,
			image: PropTypes.string,
			areaServed: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
		}))
	}),
	provider: PropTypes.shape({
		name: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired,
		logo: PropTypes.string,
		telephone: PropTypes.string,
		email: PropTypes.string,
	}),
	services: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		url: PropTypes.string,
		image: PropTypes.string,
		areaServed: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
	})),
};
export type ServicesSchemaType = InferProps<typeof ServicesSchema.propTypes>;
export function ServicesSchema(props: ServicesSchemaType) {
	const siteInfo = props.siteInfo; 
	const services = (siteInfo?.services || props.services || []);
	const provider = props.provider || {
		name: siteInfo?.name || '',
		url: siteInfo?.url || '',
		logo: siteInfo?.image,
		telephone: siteInfo?.telephone,
		email: siteInfo?.email
	};

	if (!services.length || !provider.name) {
		return null;
	}

	const serviceObjects = services.filter((service): service is NonNullable<typeof service> => service != null).map((service) => ({
		'@type': 'Service',
		name: service.name,
		description: service.description,
		...(service.url && { url: service.url }),
		...(service.image && { image: service.image }),
		...(service.areaServed && { areaServed: service.areaServed }),
		provider: {
			'@type': 'LocalBusiness',
			name: provider.name,
			url: provider.url,
			...(provider.logo && { logo: provider.logo }),
			...(provider.telephone && { telephone: provider.telephone }),
			...(provider.email && { email: provider.email })
		}
	}));

	return (
		<>
			{serviceObjects.map((service, idx) => (
				<SchemaScript key={idx} schema={{ '@context': 'https://schema.org', ...service }} />
			))}
		</>
	);
}



/* ========================================
	WEBSITE SCHEMA COMPONENTS
======================================== */

/**
 * Website Schema Component
 * Generates JSON-LD structured data for websites
 * https://schema.org/WebSite
 */

/**
 * WebsiteSchema — Inject a JSON-LD <script> tag containing a WebSite schema object, using provided props or siteInfo from config.
 *
 * @param {object} [props.siteInfo] - Optional site information object containing business details to populate the schema.
 * @param {string} [props.name] - Name of the website (overrides siteInfo.name).
 * @param {string} [props.url] - URL of the website (overrides siteInfo.url).
 * @param {string} [props.description] - Description of the website (overrides siteInfo.description).
 * @param {string} [props.keywords] - Comma-separated keywords for the website (overrides siteInfo.keywords).
 * @param {string} [props.inLanguage] - Language of the website content (overrides siteInfo.default_locale).
 * @param {array} [props.sameAs] - Array of URLs representing social profiles or related sites (overrides siteInfo.sameAs).
 * @param {object} [props.potentialAction] - Object defining a potentialAction for the website, such as a SearchAction (overrides siteInfo.potentialAction).
 * @param {object} [props.publisher] - Object defining the publisher of the website, including name, url, and logo (overrides siteInfo).
 * @param {number} [props.copyrightYear] - Year of copyright for the website (overrides siteInfo.copyrightYear).
 * @param {object} [props.copyrightHolder] - Object defining the copyright holder, including name and url (overrides siteInfo).
 */
WebsiteSchema.propTypes = {
	name: PropTypes.string,
	url: PropTypes.string,
	description: PropTypes.string,
	keywords: PropTypes.string,
	inLanguage: PropTypes.string,
	sameAs: PropTypes.arrayOf(PropTypes.string),
	potentialAction: PropTypes.shape({
		'@type': PropTypes.string,
		target: PropTypes.shape({
			'@type': PropTypes.string,
			urlTemplate: PropTypes.string
		}).isRequired,
		'query-input': PropTypes.string
	}),
	publisher: PropTypes.shape({
		'@type': PropTypes.string,
		name: PropTypes.string.isRequired,
		url: PropTypes.string,
		logo: PropTypes.shape({
			'@type': PropTypes.string,
			url: PropTypes.string.isRequired,
			width: PropTypes.number,
			height: PropTypes.number
		})
	}),
	copyrightYear: PropTypes.number,
	copyrightHolder: PropTypes.shape({
		'@type': PropTypes.string,
		name: PropTypes.string.isRequired,
		url: PropTypes.string
	}),
	siteInfo: PropTypes.object
};
export type WebsiteSchemaType = InferProps<typeof WebsiteSchema.propTypes>;
export function WebsiteSchema (props: WebsiteSchemaType) {
	const siteInfo = props.siteInfo as SiteInfo | undefined;
	const name = props.name || siteInfo?.name;
	const url = props.url || siteInfo?.url;
	if (!name || !url) {
		return null;
	}

	const description = props.description || siteInfo?.description;
	const keywords = props.keywords || siteInfo?.keywords;
	const inLanguage = props.inLanguage || siteInfo?.default_locale;
	const sameAs = props.sameAs || siteInfo?.sameAs;
	const publisher = props.publisher || buildPublisher(siteInfo);
	const potentialAction = props.potentialAction || buildPotentialAction(siteInfo?.potentialAction);
	const copyrightYear = props.copyrightYear ?? siteInfo?.copyrightYear;
	const copyrightHolder = props.copyrightHolder || buildCopyrightHolder(siteInfo);

	const schemaData = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name,
		url,
		...(description && { description }),
		...(keywords && { keywords }),
		...(inLanguage && { inLanguage }),
		...(sameAs && sameAs.length ? { sameAs } : {}),
		...(publisher && { publisher }),
		...(potentialAction && { potentialAction }),
		...(copyrightYear != null && { copyrightYear }),
		...(copyrightHolder && { copyrightHolder })
	};

	return (
		<SchemaScript schema={schemaData} />
	);
}

function buildPublisher(siteInfo?: SiteInfo) {
	if (!siteInfo) {
		return undefined;
	}
	if (!siteInfo.name) {
		return undefined;
	}
	const logoUrl = siteInfo.image;
	const logoWidth = parseDimension(siteInfo.image_width);
	const logoHeight = parseDimension(siteInfo.image_height);
	const logo = logoUrl
		? {
			'@type': 'ImageObject',
			url: logoUrl,
			...(logoWidth !== undefined && { width: logoWidth }),
			...(logoHeight !== undefined && { height: logoHeight })
		}
		: undefined;
	return {
		'@type': siteInfo.publisherType || 'Organization',
		name: siteInfo.name,
		...(siteInfo.url && { url: siteInfo.url }),
		...(logo && { logo })
	};
}

function buildCopyrightHolder(siteInfo?: SiteInfo) {
	if (!siteInfo?.name) {
		return undefined;
	}
	const holderType = siteInfo.publisherType || 'Organization';
	return {
		'@type': holderType,
		name: siteInfo.name,
		...(siteInfo.url && { url: siteInfo.url })
	};
}

function buildPotentialAction(action?: SiteInfo['potentialAction']) {
	if (!action || !action.target) {
		return undefined;
	}
	const queryInput = action['query-input'] ?? action.queryInput;
	return {
		'@type': action['@type'] ?? 'SearchAction',
		target: {
			'@type': 'EntryPoint',
			urlTemplate: action.target
		},
		...(queryInput && { 'query-input': queryInput })
	};
}

function parseDimension(value?: string | number) {
	if (typeof value === 'number') {
		return value;
	}
	if (!value) {
		return undefined;
	}
	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
}
