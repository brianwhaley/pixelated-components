// Shared test fixtures (centralized source-of-truth for tests)
// Location mandated by repo conventions: src/app/test

import routes from '@/data/routes.json';
import recipes from '@/data/recipes.json';
import resume from '@/data/resume.json';
import faqTestData from './data/faq-test-data.json';
import ebayData from './data/ebay-data.json';
import pageEngineData from './data/page-engine-data.json';
import paypalOrder from './data/paypal-order.json';
import siteHealthData from './data/site-health-data.json';
import sitemapData from './data/sitemap-data.json';
import realWordPressApiData from './data/real-wordpress-api.json';
import wordpressFunctionsData from './data/wordpress-functions-data.json';
import siteImagesData from './data/site-images.json';
import realContentfulAssetsData from './data/real-contentful-assets.json';
import googlePsiExampleCom from './data/google-psi-example-com.json';
import pixelatedConfigJson from '@/config/pixelated.config.json';
import type { PixelatedConfig } from '../components/config/config.types';
import { processPSIData } from '../components/admin/site-health/site-health-core-web-vitals.integration';

export {
	faqTestData,
	ebayData,
	pageEngineData,
	paypalOrder,
	siteHealthData,
	sitemapData,
	realWordPressApiData,
	wordpressFunctionsData,
	siteImagesData,
	realContentfulAssetsData,
	googlePsiExampleCom,
};

export const pixelatedConfig = pixelatedConfigJson as PixelatedConfig;
export const mockCloudinary = pixelatedConfig.cloudinary;

export async function createSiteHealthResponse(siteName = 'test-site', url = 'https://www.example.com') {
	return {
		success: true,
		data: [await processPSIData(googlePsiExampleCom, siteName, url)],
	};
}

// Expose "real" integration-style fixtures
export const realRoutes = routes;
export const realRecipes = recipes;
export const realResume = resume;

// Re-export commonly-used slices (keeps tests small & explicit)
export const siteInfo = routes.siteInfo;
export const siteInfoFull = routes.siteInfo;
export const visualdesign = routes.visualdesign || {};

export const minimalRecipe = (recipes.items && recipes.items[0]) ? recipes.items[0] : { '@type': 'Recipe', name: 'Minimal' };
export const minimalResume = (resume.items && resume.items[0]) ? { items: [resume.items[0]] } : { items: [] };




// Backwards-compat shape used by many existing tests (keeps migration minimal)
export default {
	visualdesign,
	siteInfo,
	siteInfoFull,
	faqTestData,
	ebayData,
	pageEngineData,
	paypalOrder,
	siteHealthData,
	sitemapData,
	realWordPressApiData,
	siteImagesData,
	realContentfulAssetsData,
	wordpressFunctionsData,
	mockCloudinary,
	pixelatedConfig,

	emptySiteInfo: { name: '', author: '', description: '', url: '', email: '' },
	routes: routes.routes || [],
	emptyRoutes: [],
	malformedRoutes: [{ invalidField: 'value' }],
};
