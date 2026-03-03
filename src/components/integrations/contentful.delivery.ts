import PropTypes, { InferProps } from "prop-types";

const debug = false;

const ctfQSParams = "?fm=webp&q=50";

export type ContentfulApiType = {
	proxyURL?: string;
	base_url: string;
	space_id: string;
	environment: string;
	delivery_access_token: string;
	management_access_token?: string;
	preview_access_token?: string;
};

/* ========== CALL CONTENTFUL DELIVERY API ========== */
/**
 * callContentfulDeliveryAPI — Perform an HTTP GET against a fully-formed Contentful Delivery API URL and return parsed JSON.
 *
 * @param {string} [props.full_url] - Full request URL to the Contentful Delivery API (include access token / query params).
 */
callContentfulDeliveryAPI.propTypes = {
/** Full request URL to the Contentful Delivery API */
	full_url: PropTypes.string.isRequired,
};
export type callContentfulDeliveryAPIType = InferProps<typeof callContentfulDeliveryAPI.propTypes>;
export async function callContentfulDeliveryAPI(props: callContentfulDeliveryAPIType) {
	if(debug) console.log("Calling Contentful Delivery API:", props.full_url);
	try {
		const response = await fetch(props.full_url);
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}
		const json = await response.json();
		return json;
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		} else {
			console.error(error);
		}
	}
	return null;
} 





/* ========== GET CONTENTFUL CARDS ========== */
/**
 * getContentfulEntries — Fetch entries from Contentful using the supplied API configuration.
 *
 * @param {shape} [props.apiProps] - Contentful API configuration object.
 * @param {string} [props.proxyURL] - Optional proxy base URL to route requests through.
 * @param {string} [props.base_url] - Contentful CDN base URL (e.g., https://cdn.contentful.com).
 * @param {string} [props.space_id] - Contentful space ID.
 * @param {string} [props.environment] - Contentful environment name (e.g., 'master').
 * @param {string} [props.delivery_access_token] - Delivery API access token for read requests.
 */
getContentfulEntries.propTypes = {
/** Contentful API configuration */
	apiProps: PropTypes.shape({
		/** Optional proxy base URL */
		proxyURL: PropTypes.string,
		/** Contentful CDN base URL */
		base_url: PropTypes.string.isRequired,
		/** Contentful space ID */
		space_id: PropTypes.string.isRequired,
		/** Contentful environment */
		environment: PropTypes.string.isRequired,
		/** Delivery API access token */
		delivery_access_token: PropTypes.string.isRequired,
	}).isRequired,
};
export type getContentfulEntriesType = InferProps<typeof getContentfulEntries.propTypes>;
export async function getContentfulEntries(props: getContentfulEntriesType) {
	const { base_url, space_id, environment, delivery_access_token } = props.apiProps;
	// const full_url = base_url + "/spaces/" + space_id + "/environments/" + environment + "/content_types/" + contentType + "?access_token=" + access_token ;
	const full_url = base_url + 
		"/spaces/" + space_id + 
		"/environments/" + environment + 
		"/entries?access_token=" + delivery_access_token ;
	return await callContentfulDeliveryAPI({ full_url });
}
/* 
https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/entries/entries-collection/get-all-entries-of-a-space/console/js-plain
*/



/* ========== GET CONTENTFUL CARDS BY TYPE ========== */
/**
 * getContentfulEntriesByType — Filter entries by Contentful content type using provided API configuration.
 *
 * @param {shape} [props.apiProps] - Contentful API configuration object.
 * @param {string} [props.contentType] - Target content type ID to filter entries by.
 */
getContentfulEntriesByType.propTypes = {
/** Contentful API configuration */
	apiProps: PropTypes.shape({
		proxyURL: PropTypes.string,
		base_url: PropTypes.string.isRequired,
		space_id: PropTypes.string.isRequired,
		environment: PropTypes.string.isRequired,
		delivery_access_token: PropTypes.string.isRequired,
	}).isRequired,
	/** Content type ID to filter by */
	contentType: PropTypes.string.isRequired,
};
export type getContentfulEntriesByTypeType = InferProps<typeof getContentfulEntriesByType.propTypes>;
export async function getContentfulEntriesByType(props: getContentfulEntriesByTypeType) {
	const allEntries: any = await getContentfulEntries({ apiProps: props.apiProps });
	if (!allEntries || !allEntries.items) {
		return { items: [] };
	}
	const typeEntries = [];
	for (const item of allEntries.items) {
		if ( item.sys.contentType.sys.id == props.contentType ) {
			typeEntries.push(item);
		}
	}
	allEntries.items = typeEntries;
	return allEntries;
}







/* ========== GET CONTENTFUL CARDS BY TYPE ========== */
/**
 * getContentfulContentType — Retrieve metadata for a Contentful content type.
 *
 * @param {shape} [props.apiProps] - Contentful API configuration object.
 * @param {string} [props.contentType] - Contentful content type ID to retrieve.
 */
getContentfulContentType.propTypes = {
/** Contentful API configuration */
	apiProps: PropTypes.shape({
		proxyURL: PropTypes.string,
		base_url: PropTypes.string.isRequired,
		space_id: PropTypes.string.isRequired,
		environment: PropTypes.string.isRequired,
		access_token: PropTypes.string.isRequired,
	}).isRequired,
	/** Content type ID to retrieve */
	contentType: PropTypes.string.isRequired,
};
export type getContentfulContentTypeType = InferProps<typeof getContentfulContentType.propTypes>;
export async function getContentfulContentType(props: getContentfulContentTypeType) {
	const { base_url, space_id, environment, access_token } = props.apiProps;
	const full_url = base_url + 
		"/spaces/" + space_id + 
		"/environments/" + environment + 
		"/content_types/" + props.contentType + 
		"?access_token=" + access_token ;
	return await callContentfulDeliveryAPI({ full_url });
}







/* ========== GET CONTENTFUL ENTRY BY ENTRY ID ========== */
/**
 * getContentfulEntryByEntryID — Fetch a single Contentful entry by its entry ID.
 *
 * @param {shape} [props.apiProps] - Contentful API configuration object.
 * @param {string} [props.entry_id] - Contentful entry ID to fetch.
 */
getContentfulEntryByEntryID.propTypes = {
/** Contentful API configuration */
	apiProps: PropTypes.shape({
		proxyURL: PropTypes.string,
		base_url: PropTypes.string.isRequired,
		space_id: PropTypes.string.isRequired,
		environment: PropTypes.string.isRequired,
		delivery_access_token: PropTypes.string.isRequired,
	}).isRequired,
	/** Target entry ID */
	entry_id: PropTypes.string.isRequired,
};
export type getContentfulEntryByEntryIDType = InferProps<typeof getContentfulEntryByEntryID.propTypes>;
export async function getContentfulEntryByEntryID(props: getContentfulEntryByEntryIDType) {
	const { base_url, space_id, environment, delivery_access_token } = props.apiProps;
	const full_url = base_url + 
		"/spaces/" + space_id + 
		"/environments/" + environment + 
		"/entries/" + props.entry_id + 
		"?access_token=" + delivery_access_token ;
	return await callContentfulDeliveryAPI({ full_url });
}






// Define the type for the params object
type ContentfulCardParams = {
    cards: any, 
    searchField: string;
    searchVal: string;
}
/* ========== GET CONTENTFUL CARD BY FIELD ========== */
export async function getContentfulEntryByField(params: ContentfulCardParams) {
	// const cards: any = await getContentfulEntriesData();
	const searchVal = decodeURIComponent(params.searchVal);
	for (const item of params.cards.items) {
		if ( item?.fields[params.searchField]?.toLowerCase() == searchVal.toLowerCase() ) {
			return item;
		}
	}
	return null;
}







/* ========== GET CONTENTFUL CARD TITLES ========== */
/**
 * getContentfulFieldValues — Return unique values for a field from entries of a given content type.
 *
 * @param {shape} [props.apiProps] - Contentful API configuration object.
 * @param {string} [props.contentType] - Contentful content type ID to inspect.
 * @param {string} [props.field] - Field name to extract values from.
 */
getContentfulFieldValues.propTypes = {
/** Contentful API configuration */
	apiProps: PropTypes.shape({
		proxyURL: PropTypes.string,
		base_url: PropTypes.string.isRequired,
		space_id: PropTypes.string.isRequired,
		environment: PropTypes.string.isRequired,
		delivery_access_token: PropTypes.string.isRequired,
	}).isRequired,
	/** Content type ID to query */
	contentType: PropTypes.string.isRequired,
	/** Field name to extract values from */
	field: PropTypes.string.isRequired,
};
export type getContentfulFieldValuesType = InferProps<typeof getContentfulFieldValues.propTypes>;
export async function getContentfulFieldValues(props: getContentfulFieldValuesType) {
	const cards: any = await getContentfulEntriesByType({
		apiProps: props.apiProps,
		contentType: props.contentType,
	});
	const fieldVals: string[] = cards.items.map(function (card: any) {
		return card.fields[props.field];
	});
	return fieldVals;
}



/* ========== GET CONTENTFUL IMAGES FROM CARDS ========== */
/**
 * getContentfulImagesFromEntries — Resolve image asset URLs and alt text for entry image references.
 *
 * @param {any} [props.images] - Entry image references (items with sys.id that map to assets).
 * @param {any} [props.assets] - Array of Contentful asset objects to resolve URLs from.
 */
getContentfulImagesFromEntries.propTypes = {
/** Entry image references to resolve */
	images: PropTypes.any.isRequired, 
	/** Contentful asset objects containing file URLs and descriptions */
	assets: PropTypes.any.isRequired,
};
export type getContentfulImagesFromEntriesType = InferProps<typeof getContentfulImagesFromEntries.propTypes>;
export async function getContentfulImagesFromEntries(props: getContentfulImagesFromEntriesType){
	const imageURLs = [];
	for (const image of props.images) {
		for (const asset of props.assets) {
			if( image.sys.id == asset.sys.id ) {
				imageURLs.push({ 
					image: asset.fields.file.url + ctfQSParams,
					imageAlt: asset.fields.description,
				});
			}
		}
	}
	return imageURLs;
}




/* ========== GET CONTENTFUL ASSETS ========== */
/**
 * getContentfulAssets — Fetch asset records from Contentful for the configured space/environment.
 *
 * @param {shape} [props.apiProps] - Contentful API configuration object.
 */
getContentfulAssets.propTypes = {
/** Contentful API configuration */
	apiProps: PropTypes.shape({
		proxyURL: PropTypes.string,
		base_url: PropTypes.string.isRequired,
		space_id: PropTypes.string.isRequired,
		environment: PropTypes.string.isRequired,
		access_token: PropTypes.string.isRequired,
	}).isRequired,
};
export type getContentfulAssetsType = InferProps<typeof getContentfulAssets.propTypes>;
export async function getContentfulAssets(props: getContentfulAssetsType){
	const { base_url, space_id, environment, access_token } = props.apiProps;
	const full_url = base_url + 
		"/spaces/" + space_id + 
		"/environments/" + environment + 
		"/assets?access_token=" + access_token ;
	return await callContentfulDeliveryAPI({ full_url });
}





/* ========== GET CONTENTFUL ASSET URLS ========== */
/**
 * getContentfulAssetURLs — Return resolved asset URLs and metadata using provided API configuration.
 *
 * @param {shape} [props.apiProps] - Contentful API configuration object.
 */
getContentfulAssetURLs.propTypes = {
/** Contentful API configuration */
	apiProps: PropTypes.shape({
		proxyURL: PropTypes.string,
		base_url: PropTypes.string.isRequired,
		space_id: PropTypes.string.isRequired,
		environment: PropTypes.string.isRequired,
		access_token: PropTypes.string.isRequired,
	}).isRequired,
};
export type getContentfulAssetURLsType = InferProps<typeof getContentfulAssetURLs.propTypes>;
export async function getContentfulAssetURLs(props: getContentfulAssetURLsType) {
	const assetURLs = [];
	const assets: any = await getContentfulAssets(props);
	for (const asset of assets.items) {
		assetURLs.push({
			image: asset.fields.file.url + ctfQSParams,
			imageAlt: asset.fields.description,
		});
	}
	if (debug) console.log("Asset URLs: ", assetURLs);
	return assetURLs;
}



/* ========== GET CONTENTFUL DISCOUNT CODES ========== */
/**
 * getContentfulDiscountCodes — Retrieve discount code entries from Contentful using the supplied API configuration.
 *
 * @param {shape} [props.apiProps] - Contentful API configuration object (base_url, space_id, environment, access tokens).
 * @param {string} [props.contentType] - Contentful content type ID for discount codes (default: 'discountCodes').
 */
getContentfulDiscountCodes.propTypes = {
/** Contentful API configuration */
	apiProps: PropTypes.shape({
		proxyURL: PropTypes.string,
		base_url: PropTypes.string.isRequired,
		space_id: PropTypes.string.isRequired,
		environment: PropTypes.string.isRequired,
		delivery_access_token: PropTypes.string.isRequired,
	}).isRequired,
	/** Contentful content type ID to fetch */
	contentType: PropTypes.string.isRequired,
};
export type getContentfulDiscountCodesType = InferProps<typeof getContentfulDiscountCodes.propTypes>;
export async function getContentfulDiscountCodes(props: getContentfulDiscountCodesType) { 
	const contentType = "discountCodes"; 
	try {
		if (debug) console.log("Fetching Discount Codes");
		const response = await getContentfulEntriesByType({ 
			apiProps: props.apiProps, 
			contentType: props.contentType 
		});
		if (!response || !response.items) {
			console.error(`HTTP error! status: ${response.status}`);
			return [];
		}
		const filteredItems = response.items.filter((item: any) => {
			return item.sys.contentType.sys.id === contentType;
		});
		const discountCodes = filteredItems.map((item: any) => ({
			codeName: item.fields.codeName,
			codeDescription: item.fields.codeDescription,
			codeType: item.fields.codeType,
			codeStart: item.fields.codeStart,
			codeEnd: item.fields.codeEnd,
			codeValue: item.fields.codeValue,
		}));
		return discountCodes;
	} catch (error) {
		console.error('Error fetching token:', error);
		return [];
	}
}



/* ========== GET CONTENTFUL REVIEWS AS SCHEMA ========== */
/**
 * getContentfulReviewsSchema — Retrieve review entries from Contentful and convert them to schema.org/Review JSON-LD format.
 *
 * @param {shape} [props.apiProps] - Contentful API configuration object (base_url, space_id, environment, access tokens).
 * @param {string} [props.itemName] - Name of the item/product being reviewed (e.g., 'Epoxy Flooring Service').
 * @param {string} [props.itemType] - Schema type of the item being reviewed (default: 'Product').
 * @param {string} [props.publisherName] - Name of the organization publishing the reviews.
 */
getContentfulReviewsSchema.propTypes = {
/** Contentful API configuration */
	apiProps: PropTypes.shape({
		proxyURL: PropTypes.string,
		base_url: PropTypes.string.isRequired,
		space_id: PropTypes.string.isRequired,
		environment: PropTypes.string.isRequired,
		delivery_access_token: PropTypes.string.isRequired,
	}).isRequired,
	/** Name of the item/product being reviewed */
	itemName: PropTypes.string.isRequired,
	/** Schema type of the item being reviewed */
	itemType: PropTypes.string,
	/** Name of the organization publishing the reviews */
	publisherName: PropTypes.string,
};
export type getContentfulReviewsSchemaType = InferProps<typeof getContentfulReviewsSchema.propTypes>;
export async function getContentfulReviewsSchema(props: getContentfulReviewsSchemaType) {
	const contentType = "reviews";
	const itemName = props.itemName;
	const itemType = props.itemType || "Product";
	const publisherName = props.publisherName;

	try {
		if (debug) console.log("Fetching Reviews and converting to schema");
		const response = await getContentfulEntriesByType({
			apiProps: props.apiProps,
			contentType: contentType
		});

		if (!response || !response.items) {
			console.error("No reviews found in Contentful");
			return [];
		}

		const reviewSchemas = response.items.map((item: any) => {
			// Extract reviewer name from "fields.reviewer" which comes as " - Name"
			const reviewerNameRaw = item.fields.reviewer || "Anonymous";
			const reviewerName = reviewerNameRaw.replace(/^\s*-\s*/, "").trim();

			// Convert Contentful date to ISO format (remove quotes if present)
			const publishDate = new Date(item.sys.createdAt).toISOString().split("T")[0];

			// Create Review schema object
			const reviewSchema = {
				"@context": "https://schema.org/",
				"@type": "Review",
				"name": "", // Will be extracted or generated from review body
				"reviewBody": item.fields.description?.replace(/^"|"$/g, "").trim() || "",
				"datePublished": publishDate,
				"author": {
					"@type": "Person",
					"name": reviewerName
				},
				"itemReviewed": {
					"@type": itemType,
					"name": itemName
				},
				"reviewRating": {
					"@type": "Rating",
					"ratingValue": "5",
					"bestRating": "5",
					"worstRating": "1"
				}
			};

			// Generate name from first sentence of review or use generic title
			if (reviewSchema.reviewBody) {
				const sentences = reviewSchema.reviewBody.split(/[.!?]/);
				reviewSchema.name = sentences[0].trim().substring(0, 100) || "Review";
			}

			// Add publisher if provided
			if (publisherName) {
				(reviewSchema as any).publisher = {
					"@type": "Organization",
					"name": publisherName
				};
			}

			return reviewSchema;
		});

		if (debug) console.log("Review Schemas: ", reviewSchemas);
		return reviewSchemas;
	} catch (error) {
		console.error('Error fetching reviews:', error);
		return [];
	}
}


/* ========== GET CONTENTFUL PRODUCT AS SCHEMA ========== */
/**
 * getContentfulProductSchema — Retrieve a product entry from Contentful and convert it to schema.org/Product JSON-LD format.
 *
 * @param {shape} [props.apiProps] - Contentful API configuration object (base_url, space_id, environment, access tokens).
 * @param {string} [props.productId] - The product ID field value to search for (e.g., 'PIX-000779').
 * @param {string} [props.siteUrl] - Optional base site URL for the offer URL.
 * @param {function} [props.getAssetUrl] - Optional function to transform asset URLs.
 */
getContentfulProductSchema.propTypes = {
/** Contentful API configuration */
	apiProps: PropTypes.shape({
		proxyURL: PropTypes.string,
		base_url: PropTypes.string.isRequired,
		space_id: PropTypes.string.isRequired,
		environment: PropTypes.string.isRequired,
		delivery_access_token: PropTypes.string.isRequired,
	}).isRequired,
	/** Product ID to search for */
	productId: PropTypes.string.isRequired,
	/** Optional site URL for offer */
	siteUrl: PropTypes.string,
	/** Optional function to transform asset URLs */
	getAssetUrl: PropTypes.func,
};
export type getContentfulProductSchemaType = InferProps<typeof getContentfulProductSchema.propTypes>;
export async function getContentfulProductSchema(props: getContentfulProductSchemaType) {
	const contentType = "item";
	const productId = props.productId;
	const siteUrl = props.siteUrl || '';
	const getAssetUrl = props.getAssetUrl;

	try {
		if (debug) console.log("Fetching Product and converting to schema");
		const response = await getContentfulEntriesByType({
			apiProps: props.apiProps,
			contentType: contentType
		});

		if (!response || !response.items) {
			console.error("No products found in Contentful");
			return null;
		}

		// Use existing helper function to find product by ID field
		const product = await getContentfulEntryByField({
			cards: response,
			searchField: 'id',
			searchVal: productId
		});

		if (!product) {
			console.error(`Product with ID ${productId} not found`);
			return null;
		}

		const fields = product.fields;

		// Create Product schema object
		const productSchema = {
			'@context': 'https://schema.org/',
			'@type': 'Product',
			name: fields.title || '',
			description: fields.description || '',
			image: [] as string[],
			brand: {
				'@type': 'Brand',
				name: fields.brand || 'Pixelated'
			},
			offers: {
				'@type': 'Offer',
				url: siteUrl || '',
				priceCurrency: 'USD',
				price: String(fields.price || '0'),
				availability: 'https://schema.org/InStock'
			}
		};

		// Handle images
		if (Array.isArray(fields.images) && fields.images.length > 0) {
			// Note: Contentful images are links to assets
			// In a real implementation, you'd need to resolve these asset URLs
			// For now, we store them as asset IDs that can be looked up later
			(productSchema as any).image = fields.images.map((img: any) => {
				if (img.sys?.id) {
					return getAssetUrl ? getAssetUrl(img.sys.id) : `https://assets.ctfassets.net/${img.sys.id}`;
				}
				return '';
			}).filter((url: string) => url);
		}

		// Add additional product attributes if available
		if (fields.brand) {
			(productSchema as any).brand.name = fields.brand;
		}
		if (fields.model) {
			(productSchema as any).model = fields.model;
		}
		if (fields.color) {
			(productSchema as any).color = fields.color;
		}

		// Add rating based on availability/quantity
		if (fields.quantity !== undefined) {
			const availability = fields.quantity > 0 
				? 'https://schema.org/InStock' 
				: 'https://schema.org/OutOfStock';
			(productSchema.offers as any).availability = availability;
		}

		if (debug) console.log("Contentful Product Schema: ", productSchema);
		return productSchema;
	} catch (error) {
		console.error('Error fetching product:', error);
		return null;
	}
}