import PropTypes, { InferProps } from "prop-types";
import type { ShoppingCartType } from "./shoppingcart.functions";
import { getCloudinaryRemoteFetchURL as getImg} from "../integrations/cloudinary";
import { CacheManager } from "../general/cache-manager";

const debug = false;

// Initialize eBay Cache (Session storage, 1 hour TTL)
const ebayCache = new CacheManager({
	mode: 'session',
	prefix: 'ebay_',
	ttl: 60 * 60 * 1000
});


/* ===== EBAY BROWSE API DOCUMENTATION =====
https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search
https://developer.ebay.com/api-docs/buy/static/ref-buy-browse-filters.html
https://developer.ebay.com/api-docs/static/oauth-ui-tokens.html
https://developer.ebay.com/my/keys
https://developer.ebay.com/my/auth?env=production&index=0
*/


/**
 * Merges provided props with server-side config if available.
 * This ensures functions work out-of-the-box on the server without manual prop passing.
 */
function getMergedEbayConfig(providedApiProps: any): EbayApiType {
	let apiProps = { 
		proxyURL: '',
		baseTokenURL: '',
		baseSearchURL: '',
		qsSearchURL: '',
		baseItemURL: '',
		qsItemURL: '',
		baseAnalyticsURL: '',
		...providedApiProps 
	};

	if (typeof window === 'undefined') {
		try {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const { getFullPixelatedConfig } = require('../config/config');
			const config = getFullPixelatedConfig();
			if (config) {
				apiProps = { 
					proxyURL: config.global?.proxyUrl || '',
					...apiProps,
					...(config.ebay || {}),
					...providedApiProps 
				};
			}
		} catch (e) {
			// Fail-silent, use what we have
		}
	}
	return apiProps as EbayApiType;
}


export type EbayApiType = {
    proxyURL: string,
    baseTokenURL: string,
    tokenScope: string, // changes per api call
    baseSearchURL: string,
    qsSearchURL: string,
    baseItemURL: string,
    qsItemURL: string,
    baseAnalyticsURL: string,
    appId: string, // clientId
    appCertId: string, // clientSecret
    globalId: string,
    itemCategory?: string,
}


getShoppingCartItem.propTypes = {
	thisItem: PropTypes.any.isRequired,
	cloudinaryProductEnv: PropTypes.string,
	apiProps: PropTypes.any,
};
export type getShoppingCartItemType = InferProps<typeof getShoppingCartItem.propTypes>;
export function getShoppingCartItem(props: getShoppingCartItemType) {
	let qty = 0;
	const thisItem = props.thisItem;
	const apiProps = props.apiProps as EbayApiType;
	const itemCategory = apiProps?.itemCategory;

	if (thisItem.categoryId && thisItem.categoryId == itemCategory) {
		qty = 1;
	} else if (thisItem.categories?.[0]?.categoryId && thisItem.categories[0].categoryId == itemCategory) {
		qty = 1;
	} else {
		qty = 10;
	}
	const shoppingCartItem: ShoppingCartType = {
		itemImageURL : ( thisItem.thumbnailImages && props.cloudinaryProductEnv ) 
			? getImg({url: thisItem.thumbnailImages[0].imageUrl, product_env: props.cloudinaryProductEnv} ) 
			: (thisItem.thumbnailImages) 
				? thisItem.thumbnailImages[0].imageUrl 
				: (thisItem.image && props.cloudinaryProductEnv)
					? getImg({url: thisItem.image.imageUrl, product_env: props.cloudinaryProductEnv})
					: thisItem.image.imageUrl,
		itemID: thisItem.legacyItemId,
		itemURL: thisItem.itemWebUrl,
		itemTitle: thisItem.title,
		itemQuantity: qty,
		itemCost: thisItem.price.value,
	};
	return shoppingCartItem;
}

/* 
search tokenScope: 'https://api.ebay.com/oauth/api_scope',
item tokenScope: 'https://api.ebay.com/oauth/api_scope/buy.item.bulk',
getItem tokenScope: 'https://api.ebay.com/oauth/api_scope',
*/


/* ========== GET TOKEN ========== */


getEbayAppToken.propTypes = {
	apiProps: PropTypes.object.isRequired,
};
export type getEbayAppTokenType = InferProps<typeof getEbayAppToken.propTypes>;
export function getEbayAppToken(props: getEbayAppTokenType){
	const apiProps = getMergedEbayConfig(props.apiProps);

	const fetchToken = async () => {
		if (debug) console.log("Fetching Token");
		try {
			const response = await fetch(
				apiProps.proxyURL + apiProps.baseTokenURL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Authorization': 'Basic ' + btoa(`${apiProps.appId}:${apiProps.appCertId}`) // Base64 encoded
					},
					body: new URLSearchParams({
						grant_type: 'client_credentials',
						scope: apiProps.tokenScope
					})
				});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			const accessToken = data.access_token;
			if (debug) console.log("Fetched eBay Access Token:", accessToken);
			return accessToken;
		} catch (error) {
			console.error('Error fetching token:', error);
		}
	};
	return fetchToken();
}


/* ========== ITEM SEARCH ========== */


getEbayBrowseSearch.propTypes = {
	apiProps: PropTypes.object.isRequired,
	token: PropTypes.string.isRequired,
};
export type getEbayBrowseSearchType = InferProps<typeof getEbayBrowseSearch.propTypes>;
export function getEbayBrowseSearch(props: getEbayBrowseSearchType){
	const apiProps = getMergedEbayConfig(props.apiProps);
	const fetchData = async (token: string) => {
		const fullURL = apiProps.baseSearchURL + apiProps.qsSearchURL;
		const cacheKey = `search_${fullURL}`;

		// Check Cache
		const cached = ebayCache.get(cacheKey);
		if (cached) {
			if (debug) console.log("Returning cached eBay Search Data", cacheKey);
			return cached;
		}

		if (debug) console.log("Fetching ebay API Browse Search Data");
		try {
			const response = await fetch(
				apiProps.proxyURL + encodeURIComponent( fullURL ) , {
					method: 'GET',
					headers: {
						'Authorization' : 'Bearer ' + token ,
						'X-EBAY-C-MARKETPLACE-ID' : 'EBAY_US',
						'X-EBAY-C-ENDUSERCTX' : 'affiliateCampaignId=<ePNCampaignId>,affiliateReferenceId=<referenceId>',
						'X-EBAY-SOA-SECURITY-APPNAME' : 'BrianWha-Pixelate-PRD-1fb4458de-1a8431fe',
					}
				});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			if (debug) console.log("Fetched eBay API Browse Search Data:", data);
			
			// Store in Cache
			ebayCache.set(cacheKey, data);
			
			return data;
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};
	return fetchData(props.token);
}


/* ========== GET ITEM ========== */


getEbayBrowseItem.propTypes = {
	apiProps: PropTypes.object.isRequired,
	token: PropTypes.string.isRequired,
};
export type getEbayBrowseItemType = InferProps<typeof getEbayBrowseItem.propTypes>;
export function getEbayBrowseItem(props: getEbayBrowseItemType){
	const apiProps = getMergedEbayConfig(props.apiProps);
	const fetchData = async (token: string) => {
		const fullURL = (apiProps.baseItemURL ?? '') + (apiProps.qsItemURL ?? '');
		const cacheKey = `item_${fullURL}`;

		// Check Cache
		const cached = ebayCache.get(cacheKey);
		if (cached) {
			if (debug) console.log("Returning cached eBay Item Data", cacheKey);
			return cached;
		}

		if (debug) console.log("Fetching ebay API Browse Item Data");
		try {
			const response = await fetch(
				apiProps.proxyURL + encodeURIComponent( fullURL ) , {
					method: 'GET',
					headers: {
						'Authorization' : 'Bearer ' + token ,
						'X-EBAY-C-MARKETPLACE-ID' : 'EBAY_US',
						'X-EBAY-C-ENDUSERCTX' : 'affiliateCampaignId=<ePNCampaignId>,affiliateReferenceId=<referenceId>',
						'X-EBAY-SOA-SECURITY-APPNAME' : 'BrianWha-Pixelate-PRD-1fb4458de-1a8431fe',
					}
				});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			if (debug) console.log("Fetched eBay Item Data:", data);

			// Store in Cache
			ebayCache.set(cacheKey, data);

			return data;
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};
	return fetchData(props.token);
}


/* ========== RATE LIMITS ========== */


getEbayRateLimits.propTypes = {
	apiProps: PropTypes.object.isRequired,
	token: PropTypes.string.isRequired,
};
export type getEbayRateLimitsType = InferProps<typeof getEbayRateLimits.propTypes>;
export function getEbayRateLimits(props: getEbayRateLimitsType){
	const apiProps = getMergedEbayConfig(props.apiProps);
	
	const fetchAllLimits = async (token: string) => {
		if (debug) console.log("Fetching all eBay API Rate Limits");
		
		try {
			const [rateLimitRes, userRateLimitRes] = await Promise.all([
				fetch(apiProps.proxyURL + encodeURIComponent( apiProps.baseAnalyticsURL + '/rate_limit' ), {
					method: 'GET',
					headers: { 'Authorization' : 'Bearer ' + token }
				}),
				fetch(apiProps.proxyURL + encodeURIComponent( apiProps.baseAnalyticsURL + '/user_rate_limit' ), {
					method: 'GET',
					headers: { 'Authorization' : 'Bearer ' + token }
				})
			]);

			if (!rateLimitRes.ok || !userRateLimitRes.ok) {
				throw new Error(`HTTP error! rate_limit: ${rateLimitRes.status}, user_rate_limit: ${userRateLimitRes.status}`);
			}

			const [rateLimit, userRateLimit] = await Promise.all([
				rateLimitRes.json(),
				userRateLimitRes.json()
			]);

			const combinedData = {
				rate_limit: rateLimit,
				user_rate_limit: userRateLimit
			};

			if (debug) console.log("Fetched Combined eBay Rate Limit Data:", combinedData);
			return combinedData;
			
		} catch (error) {
			console.error('Error fetching rate limits:', error);
		}
	};
	
	return fetchAllLimits(props.token);
}


/* ========== EXPORTED FUNCTIONS ========== */

/* ========== GET EBAY ITEMS ========== */

getEbayItems.propTypes = {
	apiProps: PropTypes.object.isRequired,
};
export type getEbayItemsType = InferProps<typeof getEbayItems.propTypes>;
export async function getEbayItems(props: getEbayItemsType) {
	const apiProps = getMergedEbayConfig(props.apiProps);
	try {
		const response = await getEbayAppToken({apiProps: apiProps});
		if (debug) console.log("eBay App Token Response:", response);
		const data = await getEbayBrowseSearch({ apiProps: apiProps, token: response });
		if (debug) console.log("eBay Browse Search Data:", data);
		return data;
	} catch (error) {
		console.error("Failed to fetch eBay Items:", error);
	}
	// Return an empty object if there's an error
	return {};
}

/* ========== GET EBAY ITEMS ========== */

getEbayItem.propTypes = {
	apiProps: PropTypes.object.isRequired,
};
export type getEbayItemType = InferProps<typeof getEbayItem.propTypes>;
export async function getEbayItem(props: getEbayItemType) {
	const apiProps = getMergedEbayConfig(props.apiProps);
	try {
		const response = await getEbayAppToken({apiProps: apiProps});
		if (debug) console.log("eBay App Token Response:", response);
		const data = await getEbayBrowseItem({ apiProps: apiProps, token: response });
		if (debug) console.log("eBay Browse Item Data:", data);
		return data;
	} catch (error) {
		console.error("Failed to fetch eBay Items:", error);
	}
	// Return an empty object if there's an error
	return {};
}




/* ========== ITEM SEARCH ========== */

export function getEbayItemsSearch(props: any){
	const apiProps = getMergedEbayConfig(props.apiProps);
	const fetchData = async (token: string) => {
		const fullURL = apiProps.baseSearchURL + apiProps.qsSearchURL;
		const cacheKey = `search_${fullURL}`;

		// Check Cache
		const cached = ebayCache.get(cacheKey);
		if (cached) {
			if (debug) console.log("Returning cached eBay Search Data", cacheKey);
			return cached;
		}

		if (debug) console.log("Fetching ebay API Items Search Data");
		try {
			const response = await fetch(
				apiProps.proxyURL + encodeURIComponent( fullURL ) , {
					method: 'GET',
					headers: {
						'Authorization' : 'Bearer ' + token ,
						'X-EBAY-C-MARKETPLACE-ID' : 'EBAY_US',
						'X-EBAY-C-ENDUSERCTX' : 'affiliateCampaignId=<ePNCampaignId>,affiliateReferenceId=<referenceId>',
						'X-EBAY-SOA-SECURITY-APPNAME' : 'BrianWha-Pixelate-PRD-1fb4458de-1a8431fe',
					}
				});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();

			// Store in Cache
			ebayCache.set(cacheKey, data);

			return data;
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};
	return fetchData(props.token);
}

