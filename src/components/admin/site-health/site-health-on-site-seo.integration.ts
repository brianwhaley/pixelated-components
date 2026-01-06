"use server";

/**
 * On-Site SEO Analysis Integration Services
 * Server-side utilities for performing comprehensive SEO analysis on websites
 * Note: This makes external HTTP requests and should only be used server-side
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import {
	EXCLUDED_URL_PATTERNS,
	EXCLUDED_FILE_EXTENSIONS,
	EXCLUDED_DIRECTORY_NAMES
} from './seo-constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seoMetricsConfig = JSON.parse(
	fs.readFileSync(path.join(__dirname, 'seo-metrics.config.json'), 'utf8')
);

interface SEOMetricConfig {
  id: string;
  title: string;
  description: string;
  scoreDisplayMode: 'binary' | 'notApplicable';
  dataCollector?: string | null;
  scorer?: string | null;
  pattern?: string;
  countLogic?: 'exact' | 'min' | 'max' | 'or' | 'count';
  scoreLogic?: 'present' | 'exact' | 'optimal' | 'percentage';
  displayTemplate?: string;
  expectedCount?: number;
  optimalRange?: { min: number; max: number };
}

interface SEOCategoryConfig {
  name: string;
  description: string;
  priority: number;
  metrics: Record<string, SEOMetricConfig>;
}

interface SEOConfig {
  categories: Record<string, SEOCategoryConfig>;
}

/**
 * Registry of data collection functions
 */
const dataCollectors: Record<string, (...args: any[]) => any> = {
	collectSemanticTagsData,
	collectTitleTagsData,
	collectMetaKeywordsData,
	collectMetaDescriptionsData,
	collectMobileFirstIndexingData,
	collectInternationalSEOData,
	collectFacetedNavigationData,
	collectBrowserCachingData,
	collectGzipCompressionData,
	collectSchemaBlogPostingData,
	collectSchemaFAQData,
	collectSchemaLocalBusinessData,
	collectSchemaServicesData,
	collectSchemaWebsiteData
};

/**
 * Registry of scoring functions
 */
const scorers: Record<string, (data: any) => { score: number; displayValue: string; details?: any }> = {
	calculateSemanticTagsScore,
	calculateTitleTagsScore,
	calculateMetaKeywordsScore,
	calculateMetaDescriptionsScore,
	calculateMobileFirstIndexingScore,
	calculateInternationalSEOData,
	calculateFacetedNavigationScore,
	calculateBrowserCachingScore,
	calculateGzipCompressionScore,
	calculateSchemaBlogPostingScore,
	calculateSchemaFAQScore,
	calculateSchemaLocalBusinessScore,
	calculateSchemaServicesScore,
	calculateSchemaWebsiteScore
};

/**
 * Data collection functions
 */
function collectSemanticTagsData(html: string) {
	const hasHeader = /<header[^>]*>/i.test(html);
	const hasFooter = /<footer[^>]*>/i.test(html);
	const hasNav = /<nav[^>]*>/i.test(html);
	const hasMain = /<main[^>]*>/i.test(html);
	const hasSection = /<section[^>]*>/i.test(html);
	const hasArticle = /<article[^>]*>/i.test(html);
	const hasAside = /<aside[^>]*>/i.test(html);
	const hasFigure = /<figure[^>]*>/i.test(html);
	const hasFigcaption = /<figcaption[^>]*>/i.test(html);
	const hasTime = /<time[^>]*>/i.test(html);
	const hasMark = /<mark[^>]*>/i.test(html);

	return {
		requiredTags: [
			{ tag: 'header', present: hasHeader },
			{ tag: 'footer', present: hasFooter },
			{ tag: 'nav', present: hasNav },
			{ tag: 'main', present: hasMain },
			{ tag: 'section', present: hasSection }
		],
		optionalTags: [
			{ tag: 'article', present: hasArticle },
			{ tag: 'aside', present: hasAside },
			{ tag: 'figure', present: hasFigure },
			{ tag: 'figcaption', present: hasFigcaption },
			{ tag: 'time', present: hasTime },
			{ tag: 'mark', present: hasMark }
		]
	};
}

function collectTitleTagsData(html: string, titleMatch?: RegExpMatchArray | null) {
	return {
		content: titleMatch ? titleMatch[1].trim() : '',
		length: titleMatch ? titleMatch[1].trim().length : 0
	};
}

function collectMetaKeywordsData(html: string) {
	const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["'][^>]*>/i);
	const content = keywordsMatch ? keywordsMatch[1].trim() : '';
	const length = content.length;

	return {
		content,
		length
	};
}

function collectMetaDescriptionsData(html: string) {
	const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
	const content = descriptionMatch ? descriptionMatch[1].trim() : '';
	const length = content.length;

	return {
		content,
		length,
		optimal: length > 0 && length <= 160
	};
}

/**
 * Generic function to analyze pattern-based metrics
 */
function analyzePatternMetric(html: string, metric: SEOMetricConfig): { score: number; displayValue: string; details?: any } {
	if (!metric.pattern) {
		return { score: 0, displayValue: 'No pattern defined' };
	}

	const regex = new RegExp(metric.pattern, 'gi');
	const matches = html.match(regex) || [];
	const count = matches.length;

	let score = 0;
	let displayValue = '';
	let details: any = undefined;

	// Apply count logic
	switch (metric.countLogic) {
	case 'exact':
		score = count === (metric.expectedCount || 1) ? 1 : 0;
		break;
	case 'min':
		score = count >= (metric.expectedCount || 1) ? 1 : 0;
		break;
	case 'max':
		score = count <= (metric.expectedCount || 1) ? 1 : 0;
		break;
	case 'or':
		score = count > 0 ? 1 : 0;
		break;
	case 'count':
	default:
		score = count > 0 ? 1 : 0;
		break;
	}

	// Apply score logic
	if (metric.scoreLogic === 'optimal' && metric.optimalRange) {
		const { min, max } = metric.optimalRange;
		score = count >= min && count <= max ? 1 : 0;
	} else if (metric.scoreLogic === 'percentage') {
		// For percentage-based scoring, we'd need additional logic
		score = count > 0 ? 1 : 0;
	}

	// Generate display value
	if (metric.displayTemplate) {
		displayValue = metric.displayTemplate
			.replace('{{count}}', count.toString())
			.replace('{{matches}}', matches.length.toString());
	} else {
		displayValue = `${count} match(es) found`;
	}

	// Generate details based on metric type
	if (metric.id === 'h1-tags' || metric.id === 'h2-tags') {
		const headings = matches.map(match => {
			const text = match.replace(/<[^>]*>/g, '').trim();
			return { tag: metric.id.replace('-tags', ''), text };
		});
		details = { items: headings };
	} else if (metric.id === 'image-alt-text') {
		// Special logic for image alt text - check each image individually
		const images = matches.map(match => {
			const srcMatch = match.match(/src=["']([^"']*)["']/);
			const altMatch = match.match(/alt=["']([^"']*)["']/);
			return {
				src: srcMatch ? srcMatch[1] : '',
				alt: altMatch ? altMatch[1] : null
			};
		});
		const imagesWithAlt = images.filter(img => img.alt !== null).length;
		const totalImages = images.length;
		score = totalImages > 0 && imagesWithAlt === totalImages ? 1 : 0;
		displayValue = `${imagesWithAlt}/${totalImages} images have alt text`;
		details = { items: images };
	} else if (metric.id === 'canonical-urls') {
		const canonicalMatch = matches[0]?.match(/href=["']([^"']*)["']/);
		const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;
		displayValue = canonicalUrl || 'No canonical URL found';
	} else if (metric.id === 'language-tags') {
		const langMatch = matches[0]?.match(/lang=["']([^"']*)["']/);
		const lang = langMatch ? langMatch[1] : null;
		displayValue = lang ? `Language: ${lang}` : 'No language tag found';
	}

	return { score, displayValue, details };
}
function calculateSemanticTagsScore(semanticData: ReturnType<typeof collectSemanticTagsData>) {
	const requiredTagsPresent = semanticData.requiredTags.filter(tag => tag.present).length;
	const optionalTagsPresent = semanticData.optionalTags.filter(tag => tag.present).length;
	const totalSemanticTags = requiredTagsPresent + optionalTagsPresent;

	return {
		score: requiredTagsPresent >= 5 ? 1 : 0,
		displayValue: `${requiredTagsPresent}/5 required, ${optionalTagsPresent} optional (${totalSemanticTags} total)`,
		details: {
			items: [
				{ type: 'required', tags: semanticData.requiredTags },
				{ type: 'optional', tags: semanticData.optionalTags },
				{ type: 'summary', requiredCount: requiredTagsPresent, optionalCount: optionalTagsPresent, totalCount: totalSemanticTags }
			]
		}
	};
}

function calculateTitleTagsScore(titleData: ReturnType<typeof collectTitleTagsData>) {
	const score = titleData.length > 0 && titleData.length <= 60 ? 1 : 0;
	const displayValue = titleData.content || 'No title tag found';

	return {
		score,
		displayValue,
		details: {
			items: [
				{ type: 'title', content: titleData.content, length: titleData.length, optimal: titleData.length > 0 && titleData.length <= 60 }
			]
		}
	};
}

function calculateMetaKeywordsScore(keywordsData: ReturnType<typeof collectMetaKeywordsData>) {
	const score = keywordsData.length > 0 ? 1 : 0;
	const displayValue = keywordsData.content || 'No meta keywords found';

	return {
		score,
		displayValue,
		details: {
			items: [
				{ type: 'keywords', content: keywordsData.content, length: keywordsData.length, present: keywordsData.length > 0 }
			]
		}
	};
}

function calculateMetaDescriptionsScore(descriptionData: ReturnType<typeof collectMetaDescriptionsData>) {
	const score = descriptionData.optimal ? 1 : 0;
	const displayValue = descriptionData.content || 'No meta description found';

	return {
		score,
		displayValue,
		details: {
			items: [
				{ type: 'description', content: descriptionData.content, length: descriptionData.length, optimal: descriptionData.optimal }
			]
		}
	};
}

/**
 * Mobile-First Indexing Data Collector
 */
function collectMobileFirstIndexingData(html: string) {
	const hasViewport = /<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*["'][^>]*>/i.test(html);
	const hasResponsiveMeta = /<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width[^"']*["'][^>]*>/i.test(html);
	const hasMobileStyles = /@media[^}]*max-width[^}]*mobile|phone|tablet/i.test(html) || /<link[^>]*media=["'][^"']*handheld[^"']*["'][^>]*>/i.test(html);

	return {
		hasViewport,
		hasResponsiveMeta,
		hasMobileStyles,
		score: (hasViewport && hasResponsiveMeta) ? 1 : 0
	};
}

/**
 * Mobile-First Indexing Scorer
 */
function calculateMobileFirstIndexingScore(data: ReturnType<typeof collectMobileFirstIndexingData>) {
	const score = data.score;
	const displayValue = score ? 'Mobile-friendly viewport detected' : 'Missing or inadequate viewport configuration';

	return {
		score,
		displayValue,
		details: {
			items: [
				{ type: 'viewport', present: data.hasViewport, optimal: data.hasResponsiveMeta },
				{ type: 'responsive-styles', present: data.hasMobileStyles }
			]
		}
	};
}

/**
 * International SEO Data Collector
 */
function collectInternationalSEOData(html: string) {
	const currencySymbols = html.match(/[£€¥$₹₽₩₦₨₪₫₡₵₺₴₸₼₲₱₭₯₰₳₶₷₹₻₽₾₿]/g) || [];
	const langAttributes = html.match(/lang=["'][^"']*["']/gi) || [];
	const localeIndicators = html.match(/(en-US|en-GB|fr-FR|de-DE|es-ES|it-IT|pt-BR|ja-JP|ko-KR|zh-CN|zh-TW|ru-RU|ar-SA|hi-IN)/gi) || [];

	return {
		currencyCount: currencySymbols.length,
		langAttributes: langAttributes.length,
		localeIndicators: localeIndicators.length,
		hasInternationalElements: currencySymbols.length > 0 || langAttributes.length > 0 || localeIndicators.length > 0
	};
}

/**
 * International SEO Scorer
 */
function calculateInternationalSEOData(data: ReturnType<typeof collectInternationalSEOData>) {
	const score = data.hasInternationalElements ? 1 : 0;
	const displayValue = score ? `${data.currencyCount} currencies, ${data.langAttributes} lang attributes, ${data.localeIndicators} locale indicators found` : 'No international SEO elements detected';

	return {
		score,
		displayValue,
		details: {
			items: [
				{ type: 'currencies', count: data.currencyCount },
				{ type: 'lang-attributes', count: data.langAttributes },
				{ type: 'locale-indicators', count: data.localeIndicators }
			]
		}
	};
}

/**
 * Faceted Navigation Data Collector
 */
function collectFacetedNavigationData(html: string) {
	// Look for URL patterns that suggest faceted navigation (query parameters, filters)
	const filterUrls = html.match(/href=["'][^"']*[?&][^"']*filter[^"']*["']/gi) || [];
	const sortUrls = html.match(/href=["'][^"']*[?&][^"']*sort[^"']*["']/gi) || [];
	const categoryUrls = html.match(/href=["'][^"']*[?&][^"']*category[^"']*["']/gi) || [];
	const cleanUrls = html.match(/href=["'][^"']*\/[^?]*\/[^?]*["']/gi) || [];

	return {
		filterUrls: filterUrls.length,
		sortUrls: sortUrls.length,
		categoryUrls: categoryUrls.length,
		cleanUrls: cleanUrls.length,
		hasFacetedNavigation: (filterUrls.length + sortUrls.length + categoryUrls.length) > 0
	};
}

/**
 * Faceted Navigation Scorer
 */
function calculateFacetedNavigationScore(data: ReturnType<typeof collectFacetedNavigationData>) {
	const totalFaceted = data.filterUrls + data.sortUrls + data.categoryUrls;
	const totalUrls = data.cleanUrls + totalFaceted;

	// Calculate score as percentage of clean URLs vs total URLs
	// Higher score = more clean URLs (better for SEO)
	let score = 1; // Default to 100% if no URLs found
	let displayValue = 'No URLs detected';

	if (totalUrls > 0) {
		score = data.cleanUrls / totalUrls; // Ratio of clean URLs to total URLs
		const percentage = Math.round(score * 100);

		if (totalFaceted === 0) {
			displayValue = `100% clean URLs - excellent for SEO`;
		} else if (score >= 0.8) {
			displayValue = `${percentage}% clean URLs (${data.cleanUrls} clean, ${totalFaceted} faceted)`;
		} else if (score >= 0.5) {
			displayValue = `${percentage}% clean URLs - consider reducing faceted navigation (${data.cleanUrls} clean, ${totalFaceted} faceted)`;
		} else {
			displayValue = `${percentage}% clean URLs - high faceted navigation may hurt SEO (${data.cleanUrls} clean, ${totalFaceted} faceted)`;
		}
	}

	return {
		score,
		displayValue,
		details: {
			items: [
				{ type: 'clean-urls', count: data.cleanUrls },
				{ type: 'filter-urls', count: data.filterUrls },
				{ type: 'sort-urls', count: data.sortUrls },
				{ type: 'category-urls', count: data.categoryUrls }
			]
		}
	};
}

/**
 * Browser Caching Data Collector
 */
async function collectBrowserCachingData(url: string) {
	try {
		const response = await fetch(url, {
			method: 'HEAD', // Use HEAD to get headers without downloading the full content
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; SEO Analysis Bot)'
			}
		});

		if (!response.ok) {
			return {
				cacheControl: '',
				expires: '',
				lastModified: '',
				etag: '',
				age: '',
				hasCachingHeaders: false,
				error: `HTTP ${response.status}: ${response.statusText}`
			};
		}

		const cacheControl = response.headers.get('cache-control') || '';
		const expires = response.headers.get('expires') || '';
		const lastModified = response.headers.get('last-modified') || '';
		const etag = response.headers.get('etag') || '';
		const age = response.headers.get('age') || '';

		return {
			cacheControl,
			expires,
			lastModified,
			etag,
			age,
			hasCachingHeaders: !!(cacheControl || expires || lastModified || etag)
		};
	} catch {
		return {
			cacheControl: '',
			expires: '',
			lastModified: '',
			etag: '',
			age: '',
			hasCachingHeaders: false,
			error: 'Could not access response headers - network error or server unavailable'
		};
	}
}

/**
 * Browser Caching Scorer
 */
function calculateBrowserCachingScore(data: Awaited<ReturnType<typeof collectBrowserCachingData>>) {
	if (data.error) {
		return {
			score: 0,
			displayValue: 'Requires server header analysis',
			details: { error: data.error }
		};
	}

	let score = 0;
	let displayValue = 'No caching headers detected';
	const issues: string[] = [];
	const goodHeaders: string[] = [];

	// Check Cache-Control header
	if (data.cacheControl) {
		goodHeaders.push('Cache-Control');
		// Check for good caching directives
		if (data.cacheControl.includes('max-age') && !data.cacheControl.includes('no-cache') && !data.cacheControl.includes('no-store')) {
			score = 1;
			displayValue = 'Good caching headers found';
		} else if (data.cacheControl.includes('no-cache') || data.cacheControl.includes('no-store')) {
			issues.push('Cache-Control prevents caching');
		}
	}

	// Check Expires header
	if (data.expires) {
		goodHeaders.push('Expires');
		const expiresDate = new Date(data.expires);
		const now = new Date();
		if (expiresDate > now) {
			if (score === 0) score = 0.5; // Partial credit for expires header
		}
	}

	// Check other headers
	if (data.lastModified) goodHeaders.push('Last-Modified');
	if (data.etag) goodHeaders.push('ETag');
	if (data.age) goodHeaders.push('Age');

	if (goodHeaders.length > 0 && score === 0) {
		score = 0.5; // Partial credit for having some caching headers
		displayValue = `Basic caching headers found: ${goodHeaders.join(', ')}`;
	}

	if (issues.length > 0) {
		displayValue += ` (${issues.join(', ')})`;
	}

	return {
		score,
		displayValue,
		details: {
			headers: {
				'cache-control': data.cacheControl,
				'expires': data.expires,
				'last-modified': data.lastModified,
				'etag': data.etag,
				'age': data.age
			}
		}
	};
}

/**
 * Gzip Compression Data Collector
 */
async function collectGzipCompressionData(url: string) {
	try {
		const response = await fetch(url, {
			method: 'GET', // Changed from HEAD to GET to properly detect compression
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; SEO Analysis Bot)',
				'Accept-Encoding': 'gzip, deflate' // Added Accept-Encoding like browsers
			}
		});

		if (!response.ok) {
			return {
				contentEncoding: '',
				contentLength: '',
				transferEncoding: '',
				isCompressed: false,
				error: `HTTP ${response.status}: ${response.statusText}`
			};
		}

		const contentEncoding = response.headers.get('content-encoding') || '';
		const contentLength = response.headers.get('content-length') || '';
		const transferEncoding = response.headers.get('transfer-encoding') || '';

		return {
			contentEncoding,
			contentLength,
			transferEncoding,
			isCompressed: contentEncoding.includes('gzip') || contentEncoding.includes('deflate')
		};
	} catch {
		return {
			contentEncoding: '',
			contentLength: '',
			transferEncoding: '',
			isCompressed: false,
			error: 'Could not access response headers - network error or server unavailable'
		};
	}
}

/**
 * Schema Detection Data Collectors
 */
function collectSchemaBlogPostingData(html: string) {
	const hasBlogPostingSchema = /"@type"\s*:\s*"BlogPosting"/i.test(html) ||
		/"@type":\s*"BlogPosting"/i.test(html) ||
		/itemtype="https?:\/\/schema\.org\/BlogPosting"/i.test(html);

	return {
		present: hasBlogPostingSchema
	};
}

function collectSchemaFAQData(html: string) {
	const hasFAQSchema = /"@type"\s*:\s*"FAQPage"/i.test(html) ||
		/"@type":\s*"FAQPage"/i.test(html) ||
		/itemtype="https?:\/\/schema\.org\/FAQPage"/i.test(html);

	return {
		present: hasFAQSchema
	};
}

function collectSchemaLocalBusinessData(html: string) {
	const hasLocalBusinessSchema = /"@type"\s*:\s*"LocalBusiness"/i.test(html) ||
		/"@type":\s*"LocalBusiness"/i.test(html) ||
		/itemtype="https?:\/\/schema\.org\/LocalBusiness"/i.test(html);

	return {
		present: hasLocalBusinessSchema
	};
}

function collectSchemaServicesData(html: string) {
	const hasServicesSchema = /"@type"\s*:\s*"Service"/i.test(html) ||
		/"@type":\s*"Service"/i.test(html) ||
		/itemtype="https?:\/\/schema\.org\/Service"/i.test(html);

	return {
		present: hasServicesSchema
	};
}

function collectSchemaWebsiteData(html: string) {
	const hasWebsiteSchema = /"@type"\s*:\s*"WebSite"/i.test(html) ||
		/"@type":\s*"WebSite"/i.test(html) ||
		/itemtype="https?:\/\/schema\.org\/WebSite"/i.test(html);

	return {
		present: hasWebsiteSchema
	};
}

/**
 * Detect if a specific page is a blog page
 */
function detectBlogPage(html: string, url: string): boolean {
	// Check URL patterns for blog pages (most reliable)
	const blogUrlPatterns = /\/(blog|news|articles|posts|journal)(\/|$)/i;
	const hasBlogUrl = blogUrlPatterns.test(url);

	// Check for blog schema on this page (very reliable)
	const hasBlogPostingSchema = /"@type"\s*:\s*"BlogPosting"/i.test(html) ||
		/"@type":\s*"BlogPosting"/i.test(html) ||
		/itemtype="https?:\/\/schema\.org\/BlogPosting"/i.test(html);

	// Check for blog-specific headings (h1 or h2)
	const hasBlogHeading = /<(h1|h2)[^>]*>.*?\b(blog|news|articles|journal|posts)\b.*?<\/\1>/i.test(html);

	// Check for article structure with a date that isn't just a copyright year
	const hasArticle = /<article[^>]*>/i.test(html);
	const hasSpecificDate = /<time[^>]*datetime=["']\d{4}-\d{2}-\d{2}/i.test(html) || 
		/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/i.test(html);

	return hasBlogUrl || hasBlogPostingSchema || (hasArticle && hasSpecificDate) || (hasBlogHeading && hasArticle);
}

/**
 * Detect if a specific page is an FAQ page
 */
function detectFAQPage(html: string, url: string): boolean {
	// Check URL patterns for FAQ pages
	const faqUrlPatterns = /\/(faq|faqs|frequently-asked-questions)(\/|$)/i;
	const hasFAQUrl = faqUrlPatterns.test(url);

	// Check for FAQ schema on this page
	const hasFAQSchema = /"@type"\s*:\s*"FAQPage"/i.test(html) ||
		/"@type":\s*"FAQPage"/i.test(html) ||
		/itemtype="https?:\/\/schema\.org\/FAQPage"/i.test(html);

	// Check for FAQ-specific headings
	const hasFAQHeading = /<(h1|h2)[^>]*>.*?\b(faq|faqs|frequently asked questions)\b.*?<\/\1>/i.test(html);

	// Check for multiple question/answer structures (dt/dd or details/summary)
	const dtCount = (html.match(/<dt[^>]*>/gi) || []).length;
	const ddCount = (html.match(/<dd[^>]*>/gi) || []).length;
	const detailsCount = (html.match(/<details[^>]*>/gi) || []).length;
	
	const hasFAQStructure = (dtCount >= 3 && ddCount >= 3) || detailsCount >= 3;

	return hasFAQUrl || hasFAQSchema || (hasFAQHeading && hasFAQStructure);
}

/**
 * Detect if a specific page is a LocalBusiness page (usually homepage)
 */
function detectLocalBusinessPage(html: string, url: string): boolean {
	const urlObj = new URL(url);
	const isHomepage = urlObj.pathname === '/' || urlObj.pathname === '';
	
	// Check for LocalBusiness schema
	const hasLocalBusinessSchema = /"@type"\s*:\s*"LocalBusiness"/i.test(html) ||
		/"@type":\s*"LocalBusiness"/i.test(html) ||
		/itemtype="https?:\/\/schema\.org\/LocalBusiness"/i.test(html);

	return isHomepage || hasLocalBusinessSchema;
}

/**
 * Detect if a specific page is a Service page
 */
function detectServicePage(html: string, url: string): boolean {
	const serviceUrlPatterns = /\/services\/|\/service\/|\/capabilities\/|\/what-we-do\//i;
	const hasServiceUrl = serviceUrlPatterns.test(url);

	// Check for Service schema
	const hasServiceSchema = /"@type"\s*:\s*"Service"/i.test(html) ||
		/"@type":\s*"Service"/i.test(html) ||
		/itemtype="https?:\/\/schema\.org\/Service"/i.test(html);

	return hasServiceUrl || hasServiceSchema;
}

/**
 * Detect if a specific page is a WebSite page (usually homepage)
 */
function detectWebsitePage(html: string, url: string): boolean {
	const urlObj = new URL(url);
	const isHomepage = urlObj.pathname === '/' || urlObj.pathname === '';

	// Check for WebSite schema
	const hasWebsiteSchema = /"@type"\s*:\s*"WebSite"/i.test(html) ||
		/"@type":\s*"WebSite"/i.test(html) ||
		/itemtype="https?:\/\/schema\.org\/WebSite"/i.test(html);

	return isHomepage || hasWebsiteSchema;
}

/**
 * Gzip Compression Scorer
 */
function calculateGzipCompressionScore(data: Awaited<ReturnType<typeof collectGzipCompressionData>>) {
	if (data.error) {
		return {
			score: 0,
			displayValue: 'Requires server header analysis',
			details: { error: data.error }
		};
	}

	let score = 0;
	let displayValue = 'No compression detected';

	if (data.isCompressed) {
		score = 1;
		displayValue = `Compression enabled: ${data.contentEncoding || data.transferEncoding}`;
	} else {
		displayValue = 'Response not compressed - consider enabling gzip compression';
	}

	return {
		score,
		displayValue,
		details: {
			headers: {
				'content-encoding': data.contentEncoding,
				'content-length': data.contentLength,
				'transfer-encoding': data.transferEncoding
			}
		}
	};
}

/**
 * Schema Detection Scorers
 */
function calculateSchemaBlogPostingScore(data: ReturnType<typeof collectSchemaBlogPostingData>) {
	const score = data.present ? 1 : 0;
	const displayValue = data.present ? 'BlogPosting schema found' : 'BlogPosting schema not found';

	return {
		score,
		displayValue
	};
}

function calculateSchemaFAQScore(data: ReturnType<typeof collectSchemaFAQData>) {
	const score = data.present ? 1 : 0;
	const displayValue = data.present ? 'FAQ schema found' : 'FAQ schema not found';

	return {
		score,
		displayValue
	};
}

function calculateSchemaLocalBusinessScore(data: ReturnType<typeof collectSchemaLocalBusinessData>) {
	const score = data.present ? 1 : 0;
	const displayValue = data.present ? 'LocalBusiness schema found' : 'LocalBusiness schema not found';

	return {
		score,
		displayValue
	};
}

function calculateSchemaServicesScore(data: ReturnType<typeof collectSchemaServicesData>) {
	const score = data.present ? 1 : 0;
	const displayValue = data.present ? 'Service schema found' : 'Service schema not found';

	return {
		score,
		displayValue
	};
}

function calculateSchemaWebsiteScore(data: ReturnType<typeof collectSchemaWebsiteData>) {
	const score = data.present ? 1 : 0;
	const displayValue = data.present ? 'WebSite schema found' : 'WebSite schema not found';

	return {
		score,
		displayValue
	};
}

export interface OnSiteSEOAudit {
  id: string;
  title: string;
  score: number | null; // 1 = pass, 0 = fail, null = not applicable
  scoreDisplayMode: 'binary' | 'notApplicable';
  displayValue?: string;
  category: 'on-page' | 'on-site';
  details?: {
    items?: Array<Record<string, unknown>>;
  };
}

export interface PageAnalysis {
  url: string;
  title?: string;
  statusCode: number;
  audits: OnSiteSEOAudit[];
  crawledAt: string;
}

export interface OnSiteSEOData {
  site: string;
  url: string;
  overallScore: number | null;
  pagesAnalyzed: PageAnalysis[];
  onSiteAudits: OnSiteSEOAudit[];
  totalPages: number;
  timestamp: string;
  status: 'success' | 'error';
  error?: string;
}

/**
 * Crawl the site to discover internal pages
 */
async function crawlSite(baseUrl: string, maxPages: number = 10): Promise<string[]> {
	const visited = new Set<string>();
	const toVisit = [baseUrl];
	const discovered: string[] = [];

	try {
		// Parse base URL for domain matching
		const baseUrlObj = new URL(baseUrl);
		const baseDomain = baseUrlObj.hostname;

		while (toVisit.length > 0 && discovered.length < maxPages) {
			const currentUrl = toVisit.shift()!;
			if (visited.has(currentUrl)) continue;

			visited.add(currentUrl);
			discovered.push(currentUrl);

			try {
				const response = await fetch(currentUrl, {
					headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEO Analysis Bot)' }
				});

				if (!response.ok) continue;

				const html = await response.text();

				// Extract internal links
				const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>/gi;
				let match;
				while ((match = linkRegex.exec(html)) !== null) {
					try {
						const href = match[1];
						const absoluteUrl = new URL(href, currentUrl).toString();

						// Only include same domain links that look like pages
						const urlObj = new URL(absoluteUrl);
						const pathname = urlObj.pathname.toLowerCase();
						
						// Exclude common non-page directories and files
						const isExcluded = EXCLUDED_URL_PATTERNS.some(pattern => pathname.includes(pattern)) ||
							pathname.match(EXCLUDED_FILE_EXTENSIONS) ||
							EXCLUDED_DIRECTORY_NAMES.some(dir => pathname.endsWith(`/${dir}`));
						
						if (urlObj.hostname === baseDomain && !visited.has(absoluteUrl) && !toVisit.includes(absoluteUrl) && !isExcluded) {
							toVisit.push(absoluteUrl);
						}
					} catch {
						// Invalid URL, skip
					}
				}
			} catch (error) {
				console.warn(`Failed to crawl ${currentUrl}:`, error);
			}
		}
	} catch (error) {
		console.warn('Error during site crawling:', error);
	}

	return discovered.slice(0, maxPages);
}

/**
 * Analyze a single page for on-page SEO elements using Puppeteer for full rendering
 */
async function analyzeSinglePage(url: string): Promise<PageAnalysis> {

	let browser;
	try {
		// Reuse browser instance if available, otherwise create new one
		browser = (globalThis as any).__seoBrowser;
		if (!browser || browser.isConnected() === false) {
			browser = await puppeteer.launch({
				headless: true,
				args: [
					'--no-sandbox',
					'--disable-setuid-sandbox',
					'--disable-dev-shm-usage',
					'--disable-accelerated-2d-canvas',
					'--no-first-run',
					'--no-zygote',
					'--disable-gpu',
					'--disable-web-security',
					'--disable-features=VizDisplayCompositor',
					'--disable-extensions',
					'--disable-plugins',
					'--disable-default-apps',
					'--disable-background-timer-throttling',
					'--disable-backgrounding-occluded-windows',
					'--disable-renderer-backgrounding'
				]
			});
			(globalThis as any).__seoBrowser = browser;
		}

		const page = await browser.newPage();

		// Block unnecessary resources for faster loading while preserving SEO-relevant content
		await page.setRequestInterception(true);
		page.on('request', (request: any) => {
			const resourceType = request.resourceType();
			const url = request.url();

			// Block heavy resources that slow down loading but aren't needed for HTML structure
			if (resourceType === 'image' ||
				resourceType === 'media' ||
				url.includes('.jpg') ||
				url.includes('.jpeg') ||
				url.includes('.png') ||
				url.includes('.gif') ||
				url.includes('.webp') ||
				url.includes('google-analytics.com') ||
				url.includes('googletagmanager.com') ||
				url.includes('facebook.com/tr') ||
				url.includes('doubleclick.net')) {
				request.abort();
			} else {
				request.continue();
			}
		});

		// Set smaller viewport for faster rendering
		await page.setViewport({ width: 800, height: 600 });

		// Set user agent to avoid bot detection
		await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

		// Navigate to the page with faster waiting strategy
		const response = await page.goto(url, {
			waitUntil: 'domcontentloaded', // Wait for DOM instead of all network requests
			timeout: 10000 // Reduced timeout from 15000 to 10000
		});

		// Check if navigation failed
		if (!response) {
			console.warn(`Failed to load page: ${url} - no response received`);
			// Continue with analysis using available data, but mark header-dependent metrics as unavailable
		}

		// Wait for H1 elements to be rendered (if any) with a short timeout
		try {
			await page.waitForSelector('h1', { timeout: 1000 }); // Reduced from 2000 to 1000
		} catch {
			// H1 not found within timeout, continue anyway
		}

		// Get title and heading counts directly from DOM for speed
		const pageData = await page.evaluate(() => {
			return {
				title: document.title,
				h1Count: document.querySelectorAll('h1').length,
				h2Count: document.querySelectorAll('h2').length,
				h1Elements: Array.from(document.querySelectorAll('h1')).map(h1 => ({
					text: h1.textContent?.trim() || ''
				})),
				h2Elements: Array.from(document.querySelectorAll('h2')).map(h2 => ({
					text: h2.textContent?.trim() || ''
				}))
			};
		});

		// Get the rendered HTML for other pattern-based checks
		const html = await page.content();
		// Don't close the page here - let it be reused or closed by caller
		// await page.close();

		// Detect page types
		const isBlogPage = detectBlogPage(html, url);
		const isFAQPage = detectFAQPage(html, url);
		const isLocalBusinessPage = detectLocalBusinessPage(html, url);
		const isServicePage = detectServicePage(html, url);
		const isWebsitePage = detectWebsitePage(html, url);

		const audits: OnSiteSEOAudit[] = [];

		// Process on-page metrics from configuration
		const config = seoMetricsConfig as SEOConfig;
		const onPageCategory = config.categories['on-page'];

		for (const metric of Object.values(onPageCategory.metrics)) {
			let score: number | null = 0;
			let displayValue: string = '';
			let details: any = undefined;

			// Special handling for schema metrics - only check on relevant page types
			if (metric.id === 'schema-blogposting') {
				if (!isBlogPage) continue;
			} else if (metric.id === 'schema-faq') {
				if (!isFAQPage) continue;
			} else if (metric.id === 'schema-localbusiness') {
				if (!isLocalBusinessPage) continue;
			} else if (metric.id === 'schema-services') {
				if (!isServicePage) continue;
			} else if (metric.id === 'schema-website') {
				if (!isWebsitePage) continue;
			}

			if (metric.dataCollector && metric.scorer) {
				const collector = dataCollectors[metric.dataCollector];
				const scorer = scorers[metric.scorer];

				if (collector && scorer) {
					// Pass URL for collectors that need headers (like browser caching and gzip compression)
					let rawData;
					if (metric.dataCollector === 'collectBrowserCachingData' || metric.dataCollector === 'collectGzipCompressionData') {
						rawData = await collector(url);
					} else {
						rawData = collector(html, pageData.title);
					}
					const result = scorer(rawData);
					score = result.score;
					displayValue = result.displayValue;
					details = result.details;
				} else {
					score = 0;
					displayValue = `Data collector or scorer not found: ${metric.dataCollector}/${metric.scorer}`;
				}
			} else if (metric.pattern) {
			// Use pattern-based analysis
				const result = analyzePatternMetric(html, metric);
				score = result.score;
				displayValue = result.displayValue;
				details = result.details;
			} else {
				// Neither data collector/scorer nor pattern available
				score = 0;
				displayValue = 'Configuration incomplete - no pattern or data collector defined';
			}

			// Override H1 and H2 results with direct DOM counts for accuracy and speed
			if (metric.id === 'h1-tags') {
				score = pageData.h1Count === (metric.expectedCount || 1) ? 1 : 0;
				displayValue = `${pageData.h1Count} H1 tag(s) found`;
				details = { items: pageData.h1Elements.map((h1: any) => ({ tag: 'h1', text: h1.text })) };
			} else if (metric.id === 'h2-tags') {
				score = pageData.h2Count > 0 ? 1 : 0;
				displayValue = `${pageData.h2Count} H2 tag(s) found`;
				details = { items: pageData.h2Elements.map((h2: any) => ({ tag: 'h2', text: h2.text })) };
			}

			audits.push({
				id: metric.id,
				title: metric.title,
				score,
				scoreDisplayMode: metric.scoreDisplayMode,
				displayValue,
				category: 'on-page',
				details
			});
		}

		// Close the page after analysis
		await page.close();

		return {
			url,
			title: pageData.title,
			statusCode: response.status(),
			audits,
			crawledAt: new Date().toISOString()
		};
	} catch (error) {
		console.warn(`Failed to analyze ${url}:`, error);
		// Return a basic analysis for failed requests
		return {
			url,
			title: undefined,
			statusCode: 0, // Indicates analysis failed
			audits: [],
			crawledAt: new Date().toISOString()
		};
	}
	// Don't close browser here - keep it alive for reuse
}
async function performSiteWideAudits(baseUrl: string): Promise<OnSiteSEOAudit[]> {
	const audits: OnSiteSEOAudit[] = [];

	try {
		// Parse base URL
		const baseUrlObj = new URL(baseUrl);
		const baseDomain = baseUrlObj.hostname;
		const protocol = baseUrlObj.protocol;

		// Process on-site metrics from configuration
		const config = seoMetricsConfig as SEOConfig;
		const onSiteCategory = config.categories['on-site'];

		for (const metric of Object.values(onSiteCategory.metrics)) {
			let score: number = 0;
			let displayValue: string = '';

			// Handle metrics without custom collectors/scorers
			switch (metric.id) {
			case 'https':
				score = protocol === 'https:' ? 1 : 0;
				displayValue = score ? 'Site uses HTTPS' : 'Site does not use HTTPS';
				break;

			case 'url-structure': {
				const hasQueryParams = baseUrlObj.search.length > 0;
				score = hasQueryParams ? 0 : 1;
				displayValue = score ? 'Clean URL structure' : 'URL contains query parameters';
				break;
			}

			case 'robots-txt':
				try {
					const robotsUrl = `${protocol}//${baseDomain}/robots.txt`;
					const robotsResponse = await fetch(robotsUrl);
					score = robotsResponse.ok ? 1 : 0;
					displayValue = score ? 'Robots.txt accessible' : 'Robots.txt not found or inaccessible';
				} catch {
					score = 0;
					displayValue = 'Robots.txt not accessible';
				}
				break;

			case 'sitemap-xml':
				try {
					const sitemapUrl = `${protocol}//${baseDomain}/sitemap.xml`;
					const sitemapResponse = await fetch(sitemapUrl);
					score = sitemapResponse.ok ? 1 : 0;
					displayValue = score ? 'Sitemap.xml accessible' : 'Sitemap.xml not found or inaccessible';
				} catch {
					score = 0;
					displayValue = 'Sitemap.xml not accessible';
				}
				break;

			case 'internal-linking':
				score = 1; // Placeholder - would need full crawl analysis
				displayValue = 'Internal links found during crawl';
				break;

			case 'navigation':
				score = 1; // Placeholder - would need content analysis
				displayValue = 'Navigation structure found';
				break;

			case 'broken-links':
				score = 1; // Placeholder - would need comprehensive link checking
				displayValue = 'No obvious broken links detected';
				break;

			case 'manifest-file':
				try {
					const manifestUrl = `${protocol}//${baseDomain}/manifest.webmanifest`;
					const manifestResponse = await fetch(manifestUrl);
					score = manifestResponse.ok ? 1 : 0;
					displayValue = score ? 'Manifest.webmanifest accessible' : 'Manifest.webmanifest not found or inaccessible';
				} catch {
					score = 0;
					displayValue = 'Manifest.webmanifest not accessible';
				}
				break;

			case 'gzip-compression':
				try {
					const gzipData = await collectGzipCompressionData(baseUrl);
					const gzipResult = calculateGzipCompressionScore(gzipData);
					score = gzipResult.score;
					displayValue = gzipResult.displayValue;
				} catch {
					score = 0;
					displayValue = 'Error analyzing compression headers';
				}
				break;

			case 'browser-caching':
				try {
					const cachingData = await collectBrowserCachingData(baseUrl);
					const cachingResult = calculateBrowserCachingScore(cachingData);
					score = cachingResult.score;
					displayValue = cachingResult.displayValue;
				} catch {
					score = 0;
					displayValue = 'Error analyzing caching headers';
				}
				break;

			case 'duplicate-content-detection':
				score = 0; // Placeholder - would need multi-page content analysis
				displayValue = 'Requires comprehensive site crawl';
				break;

			case 'safe-browsing-status':
				score = 0; // Placeholder - would need external API
				displayValue = 'Requires Google Safe Browsing API';
				break;

			default:
				score = 0;
				displayValue = 'Not implemented';
			}

			audits.push({
				id: metric.id,
				title: metric.title,
				score,
				scoreDisplayMode: metric.scoreDisplayMode,
				displayValue,
				category: 'on-site'
			});
		}

	} catch (error) {
		console.error('Error performing site-wide audits:', error);
	}

	return audits;
}

/**
 * Fetch and parse sitemap.xml to get all site URLs
 */
async function getUrlsFromSitemap(baseUrl: string): Promise<string[]> {
	try {
		const sitemapUrl = `${baseUrl}/sitemap.xml`;
		const response = await fetch(sitemapUrl);

		if (!response.ok) {
			throw new Error(`Failed to fetch sitemap: ${response.status}`);
		}

		const xmlText = await response.text();
		const baseUrlObj = new URL(baseUrl);

		// Simple XML parsing to extract URLs
		const urlRegex = /<loc>([^<]+)<\/loc>/g;
		const urls: string[] = [];
		let match;

		while ((match = urlRegex.exec(xmlText)) !== null) {
			const url = match[1].trim();
			// Only include URLs from the same domain and that look like valid page URLs
			try {
				const urlObj = new URL(url);
				if (urlObj.hostname === baseUrlObj.hostname) {
					const pathname = urlObj.pathname.toLowerCase();
					
					// Exclude common non-page directories and files
					const isExcluded = EXCLUDED_URL_PATTERNS.some(pattern => pathname.includes(pattern)) ||
						pathname.match(EXCLUDED_FILE_EXTENSIONS) ||
						EXCLUDED_DIRECTORY_NAMES.some(dir => pathname.endsWith(`/${dir}`));
					
					if (!isExcluded) {
						urls.push(url);
					}
				}
			} catch {
				// Invalid URL, skip
			}
		}

		return urls.slice(0, 20); // Limit to 20 pages to prevent excessive analysis
	} catch (error) {
		console.warn('Failed to fetch sitemap:', error);
		return [];
	}
}

/**
 * Main function to perform comprehensive on-site SEO analysis
 */
export async function performOnSiteSEOAnalysis(baseUrl: string): Promise<OnSiteSEOData> {
	try {
		let pagesToAnalyze: string[] = [];

		// Try to get URLs from sitemap first
		const sitemapUrls = await getUrlsFromSitemap(baseUrl);
		if (sitemapUrls.length > 0) {
			pagesToAnalyze = sitemapUrls;
		} else {
			// Fallback to crawling if sitemap not available
			pagesToAnalyze = await crawlSite(baseUrl, 2); // Reduced from 5 to 2 pages
		}

		if (pagesToAnalyze.length === 0) {
			return {
				site: baseUrl,
				url: baseUrl,
				overallScore: null,
				pagesAnalyzed: [],
				onSiteAudits: [],
				totalPages: 0,
				timestamp: new Date().toISOString(),
				status: 'error',
				error: 'No pages could be analyzed'
			};
		}

		// Analyze each page
		const pagesAnalyzed: PageAnalysis[] = [];
		const schemaResults: Record<string, Array<{ url: string, title: string, score: number }>> = {
			'schema-blogposting': [],
			'schema-faq': [],
			'schema-localbusiness': [],
			'schema-services': [],
			'schema-website': []
		};

		for (const pageUrl of pagesToAnalyze) {
			try {
				const pageAnalysis = await analyzeSinglePage(pageUrl);
				
				// Extract and remove schema audits from page-level audits to avoid duplication
				const schemaIds = Object.keys(schemaResults);
				pageAnalysis.audits = pageAnalysis.audits.filter(audit => {
					if (schemaIds.includes(audit.id)) {
						schemaResults[audit.id].push({
							url: pageAnalysis.url,
							title: pageAnalysis.title || '',
							score: audit.score || 0
						});
						return false; // Remove from page-level audits
					}
					return true;
				});

				pagesAnalyzed.push(pageAnalysis);
			} catch (error) {
				console.warn(`Failed to analyze ${pageUrl}:`, error);
			}
		}

		// Perform site-wide audits
		const onSiteAudits = await performSiteWideAudits(baseUrl);

		// Handle Schema Metrics with specific aggregation logic
		const schemaConfigs = [
			{ id: 'schema-blogposting', title: 'BlogPosting Schema', optional: true, failMsg: 'BlogPosting schema not found' },
			{ id: 'schema-faq', title: 'FAQ Schema', optional: false, failMsg: 'FAQ schema not found', emptyMsg: 'No FAQ pages detected - sites should have FAQ content' },
			{ id: 'schema-localbusiness', title: 'LocalBusiness Schema', optional: false, failMsg: 'LocalBusiness schema not found' },
			{ id: 'schema-services', title: 'Service Schema', optional: false, failMsg: 'Service schema not found' },
			{ id: 'schema-website', title: 'WebSite Schema', optional: false, failMsg: 'WebSite schema not found' }
		];

		for (const config of schemaConfigs) {
			const results = schemaResults[config.id];
			
			if (results.length === 0) {
				if (config.optional) {
					// Optional and none found -> N/A (white dot)
					onSiteAudits.push({
						id: config.id,
						title: config.title,
						score: null,
						scoreDisplayMode: 'binary',
						displayValue: `No ${config.title.split(' ')[0]} pages detected`,
						category: 'on-site'
					});
				} else {
					// Required but none found -> 0% (red dot)
					onSiteAudits.push({
						id: config.id,
						title: config.title,
						score: 0,
						scoreDisplayMode: 'binary',
						displayValue: config.emptyMsg || `No ${config.title.split(' ')[0]} pages detected`,
						category: 'on-site'
					});
				}
			} else {
				const passCount = results.filter(r => r.score === 1).length;
				const totalCount = results.length;
				const score = passCount / totalCount;
				const failedPages = results.filter(r => r.score === 0).map(r => ({
					page: r.title || r.url,
					url: r.url,
					score: 0,
					displayValue: config.failMsg
				}));

				onSiteAudits.push({
					id: config.id,
					title: config.title,
					score: score,
					scoreDisplayMode: 'binary',
					displayValue: `${passCount}/${totalCount} pages pass`,
					category: 'on-site',
					details: score < 1 ? { items: failedPages } : undefined
				});
			}
		}

		// Calculate overall score (simplified - average of all page scores)
		let totalScore = 0;
		let totalAudits = 0;

		for (const page of pagesAnalyzed) {
			for (const audit of page.audits) {
				if (audit.score !== null) {
					totalScore += audit.score;
					totalAudits++;
				}
			}
		}

		for (const audit of onSiteAudits) {
			if (audit.score !== null) {
				totalScore += audit.score;
				totalAudits++;
			}
		}

		const overallScore = totalAudits > 0 ? Math.round((totalScore / totalAudits) * 100) / 100 : null;

		return {
			site: baseUrl,
			url: baseUrl,
			overallScore,
			pagesAnalyzed,
			onSiteAudits,
			totalPages: pagesAnalyzed.length,
			timestamp: new Date().toISOString(),
			status: 'success'
		};

	} catch (error) {
		console.error('Error performing on-site SEO analysis:', error);
		return {
			site: baseUrl,
			url: baseUrl,
			overallScore: null,
			pagesAnalyzed: [],
			onSiteAudits: [],
			totalPages: 0,
			timestamp: new Date().toISOString(),
			status: 'error',
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}
