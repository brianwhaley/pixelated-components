import PropTypes, { InferProps } from "prop-types";
import type { ShoppingCartType } from "./shoppingcart.functions";
import { getCloudinaryRemoteFetchURL as getImg} from "../general/cloudinary";
const debug = false;


/* ===== EBAY BROWSE API DOCUMENTATION =====
https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search
https://developer.ebay.com/api-docs/buy/static/ref-buy-browse-filters.html
https://developer.ebay.com/api-docs/static/oauth-ui-tokens.html
https://developer.ebay.com/my/keys
https://developer.ebay.com/my/auth?env=production&index=0
*/


// category : 0 : {categoryId: '79720', categoryName: 'Sunglasses'}
// category : 0 : {categoryId: '179241', categoryName: 'Accessories'}
// categoryId : "79720"
export const ebaySunglassCategory = '79720'; // Ebay Sunglasses Category


export type EbayApiType = {
    proxyURL?: string,
    baseTokenURL?: string,
    tokenScope: string, // changes per api call
    baseSearchURL?: string,
    qsSearchURL?: string,
    baseItemURL?: string,
    qsItemURL?: string,
    appId: string, // clientId
    appCertId: string, // clientSecret
    globalId: string,
}


getShoppingCartItem.propTypes = {
	thisItem: PropTypes.any.isRequired,
	cloudinaryProductEnv: PropTypes.string,
};
export type getShoppingCartItemType = InferProps<typeof getShoppingCartItem.propTypes>;
export function getShoppingCartItem(props: getShoppingCartItemType) {
	let qty = 0;
	const thisItem = props.thisItem;
	if (thisItem.categoryId && thisItem.categoryId == ebaySunglassCategory) {
		qty = 1;
	} else if (thisItem.categories[0].categoryId && thisItem.categories[0].categoryId == ebaySunglassCategory) {
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


export const defaultEbayProps = {
	proxyURL: "https://proxy.pixelated.tech/prod/proxy?url=",
	baseTokenURL: 'https://api.ebay.com/identity/v1/oauth2/token',
	tokenScope: 'https://api.ebay.com/oauth/api_scope',
	baseSearchURL : 'https://api.ebay.com/buy/browse/v1/item_summary/search',
	qsSearchURL: '?q=sunglasses&fieldgroups=full&category_ids=79720&aspect_filter=categoryId:79720&filter=sellers:{pixelatedtech}&sort=newlyListed&limit=200',
	baseItemURL: 'https://api.ebay.com/buy/browse/v1/item',
	qsItemURL: '/v1|295959752403|0?fieldgroups=PRODUCT,ADDITIONAL_SELLER_DETAILS',
	appId: 'BrianWha-Pixelate-PRD-1fb4458de-1a8431fe', // clientId
	appCertId: 'PRD-fb4458deef01-0d54-496a-b572-a04b', // clientSecret
	sbxAppId: 'BrianWha-Pixelate-SBX-ad482b6ae-8cb8fead', // Sandbox
	sbxAppCertId: '',
	globalId: 'EBAY-US',
};


/* ========== GET TOKEN ========== */


getEbayAppToken.propTypes = {
	apiProps: PropTypes.object.isRequired,
};
export type getEbayAppTokenType = InferProps<typeof getEbayAppToken.propTypes>;
export function getEbayAppToken(props: getEbayAppTokenType){
	const apiProps = { ...defaultEbayProps, ...props.apiProps };
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
	const apiProps = { ...defaultEbayProps, ...props.apiProps };
	const fetchData = async (token: string) => {
		if (debug) console.log("Fetching ebay API Browse Search Data");
		try {
			const response = await fetch(
				apiProps.proxyURL + encodeURIComponent( apiProps.baseSearchURL + apiProps.qsSearchURL ) , {
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
			if (debug) console.log("Fetched eBay API Browse Search Data:", await data);
			return ( await data );
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
	const apiProps: EbayApiType = { ...defaultEbayProps, ...props.apiProps };
	const fetchData = async (token: string) => {
		if (debug) console.log("Fetching ebay API Browse Item Data");
		try {
			const response = await fetch(
				apiProps.proxyURL + encodeURIComponent( (apiProps.baseItemURL ?? '') + (apiProps.qsItemURL ?? '') ) , {
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
			if (debug) console.log("Fetched eBay Item Data:", await data);
			return ( await data );
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};
	return fetchData(props.token);
}





/* ========== EXPORTED FUNCTIONS ========== */

/* ========== GET EBAY ITEMS ========== */

getEbayItems.propTypes = {
	apiProps: PropTypes.object.isRequired,
};
export type getEbayItemsType = InferProps<typeof getEbayItems.propTypes>;
export async function getEbayItems(props: getEbayItemsType) {
	const apiProps: EbayApiType = { ...defaultEbayProps, ...props.apiProps };
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
	const apiProps: EbayApiType = { ...defaultEbayProps, ...props.apiProps };
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
	const apiProps = { ...defaultEbayProps, ...props.apiProps };
	const fetchData = async (token: string) => {
		if (debug) console.log("Fetching ebay API Data");
		try {
			const response = await fetch(
				apiProps.proxyURL + encodeURIComponent( apiProps.baseSearchURL + apiProps.qsSearchURL ) , {
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
			return data;
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};
	return fetchData(props.token);
}

