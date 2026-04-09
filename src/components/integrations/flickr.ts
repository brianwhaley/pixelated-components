
import PropTypes, { InferProps } from 'prop-types';
import { mergeDeep } from '../general/utilities';
import { hashCode } from '../general/utilities';
import { CacheManager } from '../general/cache-manager';
import { getDomain } from '../general/utilities';
import { smartFetch } from '../general/smartfetch';
import { buildUrl } from '../general/urlbuilder';
import type { CarouselCardType } from '../general/carousel';
import type { FlickrConfig, GlobalConfig } from '../config/config.types';

// Flickr API base URL - non-secret configuration
const FLICKR_API_BASE_URL = 'https://api.flickr.com/services/rest/?';

const defaultFlickr: FlickrConfig = {
	baseURL: FLICKR_API_BASE_URL,
	proxyURL: '',
	urlProps: {
		method: 'flickr.photos.search',
		// api_key and user_id must come from props or config provider - do not hardcode
		api_key: '',
		user_id: '',
		tags: 'pixelatedviewsgallery',
		extras: 'date_taken,description,owner_name',
		sort: 'date-taken-desc',
		per_page: 500,
		format: 'json',
		photoSize: 'Medium',
		nojsoncallback: 'true' /*,
			startPos: 0 */
	}
};


// Utility to build the final Flickr API URL, using proxy if available
function buildFlickrApiUrl(flickr: any) {
	// Use buildUrl to construct the Flickr REST API URL from parameters
	const apiUrl = buildUrl({
		baseUrl: flickr.baseURL,
		params: flickr.urlProps,
	});
	// Prefer flickr.proxyURL, then globalConfig.proxyUrl, else direct
	if (flickr.proxyURL) {
		return flickr.proxyURL + encodeURIComponent(apiUrl);
	} else {
		return apiUrl;
	}
}




function getFlickrSize(size: string) {
	// https://www.flickr.com/services/api/misc.urls.html
	switch (size) {
	case 'Square': return '_s'; // 75
	case 'Large Square': return '_q'; // 150
	case 'Thumbnail': return '_t'; // 100
	case 'Small': return '_m'; // 240
	case 'Small 320': return '_n'; // 320
	case 'Medium': return ''; // 500
	case 'Medium 640': return '_z'; // 640
	case 'Medium 800': return '_c'; // 800
	case 'Large': return '_b'; // 1024
		// case "Large2" : return "_h"; // 1600 + secret
		// case "Large3" : return "_k"; // 2048 + secret
		// case "XL3K" : return "_3k"; // 3072 + secret
		// case "XL4K" : return "_4k"; // 4096 + secret
		// case "XLF" : return "_f"; // 4096 + secret - only 2:1 aspect ratio
		// case "XL5K" : return "_5k"; // 5120 + secret
		// case "XL6K" : return "_6k"; // 6144 + secret
		// case "Original" : return "_o"; // secret + EXIF data; not rotated, ? ext
	default: return '';
	}
}



/**
 * GetFlickrData — Fetch image data from Flickr API using provided configuration.
 *
 * @param {object} [props.flickr] - Flickr-specific query overrides (method, tags, user_id, etc.).
 * @param {object} [props.config] - Optional provider config to merge with defaults.
 */
GetFlickrData.propTypes = {
	/** Flickr-specific query overrides */
	flickr: PropTypes.any,
	/** Optional provider configuration for Flickr requests */
	config: PropTypes.any,
};
export type GetFlickrDataType = InferProps<typeof GetFlickrData.propTypes>;
export function GetFlickrData(props: GetFlickrDataType) {
	const debug = false;
	// Use provided flickr config, or fall back to config provider, or use defaults
	let flickrConfig: FlickrConfig = { ...defaultFlickr };
	if (props.config) {
		if (props.config.global?.proxyURL) {
			flickrConfig.proxyURL = props.config.global.proxyURL;
		}
		if (props.config.flickr) flickrConfig = mergeDeep(flickrConfig, props.config.flickr as FlickrConfig) as FlickrConfig;
	}
	if (props.flickr) {
		flickrConfig = mergeDeep(flickrConfig, props.flickr as FlickrConfig) as FlickrConfig;
	}
	const myURL = buildFlickrApiUrl(flickrConfig);

	// CacheManager: localStorage, 1 week TTL, domain isolation, namespace 'flickr'
	const flickrCache = new CacheManager({
		mode: 'local',
		ttl: 1000 * 60 * 60 * 24 * 7, // 1 week
		domain: getDomain(),
		namespace: 'flickr'
	});

	const fetchFlickrData = async () => {
		const cacheKey = hashCode(myURL);
		try {
			const jsonData = await smartFetch(myURL, {
				cache: flickrCache,
				cacheKey,
				debug,
			});
			
			// Check if Flickr API returned an error response
			if (jsonData.stat === 'fail') {
				throw new Error(`Flickr API error: ${jsonData.message || 'Unknown error'}`);
			}
			
			let myFlickrImages = [];
			if (jsonData.photos) {
				// photos for tags - flickr.photos.search
				myFlickrImages = jsonData.photos.photo;
			} else if (jsonData.photoset) {
				// photoset for albums - flickr.photosets.getPhotos
				myFlickrImages = jsonData.photoset.photo;
			} else {
				throw new Error('No photos or photoset found in Flickr API response');
			}
			myFlickrImages.sort((a: any, b: any) => {
				return new Date(b.datetaken).getTime() - new Date(a.datetaken).getTime();
			}); // b - a for reverse sort
			if (debug) console.log('Flickr Cards:', myFlickrImages);
			return myFlickrImages;
		} catch (err) {
			console.log('Error fetching Flickr data:', err);
		}
	};
	return fetchFlickrData();
}



/**
 * GenerateFlickrCards — Convert raw Flickr image objects into card-friendly data structures.
 *
 * @param {array} [props.flickrImages] - Array of Flickr image objects returned by the API.
 * @param {string} [props.photoSize] - Desired photo size label (e.g., 'Medium', 'Large').
 */
GenerateFlickrCards.propTypes = {
	/** Flickr image array */
	flickrImages: PropTypes.array.isRequired,
	/** Desired photo size label */
	photoSize: PropTypes.string.isRequired,
};
export type GenerateFlickrCardsType = InferProps<typeof GenerateFlickrCards.propTypes>;
export function GenerateFlickrCards(props: GenerateFlickrCardsType) {
	if (props.flickrImages?.length > 0) {
		const photoSize = getFlickrSize(props.photoSize);
		const flickrCards = props.flickrImages.map((image: any, i: number) => (
			{
				link: 'https://farm' + image.farm + '.static.flickr.com/' + image.server + '/' + image.id + '_' + image.secret + photoSize + '.jpg',
				image: 'https://farm' + image.farm + '.static.flickr.com/' + image.server + '/' + image.id + '_' + image.secret + photoSize + '.jpg',
				imageAlt: image.title,
				headerText: image.title,
				subHeaderText: (i + 1) + " of " + props.flickrImages.length + " by " + image.ownername + " on " + image.datetaken,
				bodyText: image.description._content,
			}
		));
		return flickrCards;
	}
}




/**
 * FlickrWrapper — Wrapper component that exposes Flickr query controls and renders fetched results.
 *
 * @param {string} [props.method] - Flickr API method to call (e.g., 'flickr.photos.search').
 * @param {string} [props.api_key] - Flickr API key used for authentication.
 * @param {string} [props.user_id] - Flickr user id to scope queries.
 * @param {string} [props.tags] - Comma-separated tags to filter photos.
 * @param {string} [props.photoset_id] - Photoset/album id to fetch specific album contents.
 * @param {string} [props.photoSize] - Desired photo size label used by `getFlickrSize`.
 * @param {function} [props.callback] - Optional callback function invoked after data fetch.
 */
FlickrWrapper.propTypes = {
	/** Flickr API method */
	method: PropTypes.string,
	/** Flickr API key */
	api_key: PropTypes.string.isRequired,
	/** Flickr user id */
	user_id: PropTypes.string.isRequired,
	/** Tag filter string */
	tags: PropTypes.string,
	/** Photoset/album id */
	photoset_id: PropTypes.string,
	/** Desired photo size label (e.g., 'Medium', 'Large') */
	photoSize: PropTypes.string,
	/** Callback invoked with an array of Carousel cards after data is fetched */
	callback: PropTypes.func.isRequired,
	/* 	callback: (arg0: CarouselCardType[]) => void; */
};
export type FlickrWrapperType = InferProps<typeof FlickrWrapper.propTypes>;
export function FlickrWrapper(props: FlickrWrapperType) {
	const flickr = {
		flickr: {
			baseURL: FLICKR_API_BASE_URL,
			urlProps: {
				method: props.method || 'flickr.photos.search',
				api_key: props.api_key /* || '882cab5548d53c9e6b5fb24d59cc321d' */,
				user_id: props.user_id /* || '15473210@N04' */,
				tags: props.tags || '' /* || 'btw-customsunglasses' */,
				photoset_id: props.photoset_id || '',
				photoSize: props.photoSize || 'Large',
				extras: 'date_taken,description,owner_name',
				sort: 'date-taken-desc',
				per_page: 500,
				format: 'json',
				nojsoncallback: 'true'
			}
		}
	};

	async function getFlickrCards() {
		const myPromise = GetFlickrData(flickr);
		const myFlickrImages = await myPromise;
		const myPhotoSize = flickr.flickr.urlProps.photoSize;
		const myFlickrCards = GenerateFlickrCards({ flickrImages: myFlickrImages, photoSize: myPhotoSize });
		// REMOVE LINKS
		if (myFlickrCards) {
			const myScrubbedFlickrCards = myFlickrCards.map((obj: any, index: number): CarouselCardType => {
				return {
					index: index,
					cardIndex: index,
					cardLength: myFlickrCards.length,
					image: obj.image,
					imageAlt: obj.imageAlt,
					subHeaderText: obj.subHeaderText
				};
			});
			props.callback(myScrubbedFlickrCards);
			return myScrubbedFlickrCards;
		}
	}
	return getFlickrCards();
}
