
import PropTypes, { InferProps } from 'prop-types';
import { mergeDeep } from '../utilities/functions';
import type { CarouselCardType } from './carousel';

type FlickrApiType = {
    baseURL: string;
    urlProps: {
        method: string;
        api_key: string;
        user_id: string;
        tags?: string;
        photoset_id?: string;
        extras: string;
        sort: string;
        per_page: number;
        format: string;
        photoSize: string;
        nojsoncallback: string;
    };
};

const defaultFlickr = { 
	flickr : {
		baseURL: 'https://api.flickr.com/services/rest/?',
		urlProps: {
			method: 'flickr.photos.search',
			api_key: '882cab5548d53c9e6b5fb24d59cc321d',
			user_id: '15473210@N04',
			tags: 'pixelatedviewsgallery',
			extras: 'date_taken,description,owner_name',
			sort: 'date-taken-desc',
			per_page: 500,
			format: 'json',
			photoSize: 'Medium',
			nojsoncallback: 'true' /*,
			startPos: 0 */
		}
	} , 
};



function getFlickrSize (size: string) {
	// https://www.flickr.com/services/api/misc.urls.html
	switch (size) {
	case 'Square' : return '_s'; // 75
	case 'Large Square' : return '_q'; // 150
	case 'Thumbnail' : return '_t'; // 100
	case 'Small' : return '_m'; // 240
	case 'Small 320' : return '_n'; // 320
	case 'Medium' : return ''; // 500
	case 'Medium 640' : return '_z'; // 640
	case 'Medium 800' : return '_c'; // 800
	case 'Large' : return '_b'; // 1024
		// case "Large2" : return "_h"; // 1600 + secret
		// case "Large3" : return "_k"; // 2048 + secret
		// case "XL3K" : return "_3k"; // 3072 + secret
		// case "XL4K" : return "_4k"; // 4096 + secret
		// case "XLF" : return "_f"; // 4096 + secret - only 2:1 aspect ratio
		// case "XL5K" : return "_5k"; // 5120 + secret
		// case "XL6K" : return "_6k"; // 6144 + secret
		// case "Original" : return "_o"; // secret + EXIF data; not rotated, ? ext
	default : return '';
	}
}



GetFlickrData.propTypes = {
	flickr: PropTypes.object,
	config: PropTypes.object,
};
export type GetFlickrDataType = InferProps<typeof GetFlickrData.propTypes>;
export function GetFlickrData( props: GetFlickrDataType ) {

	const debug = false;
	
	// Use provided flickr config, or fall back to config provider, or use defaults
	let flickrConfig: any = { ...defaultFlickr.flickr };
	
	if (props.config) {
		flickrConfig = mergeDeep(flickrConfig, props.config);
	}
	
	if (props.flickr) {
		flickrConfig = mergeDeep(flickrConfig, props.flickr);
	}
	
	const flickr = flickrConfig as FlickrApiType;

	// Build URL with query parameters
	let myURL = flickr.baseURL;
	let queryParams = '';
	Object.keys(flickr.urlProps).forEach((prop) => {
		const value = flickr.urlProps[prop as keyof typeof flickr.urlProps];
		queryParams += (queryParams.length === 0) ? prop + '=' + value : '&' + prop + '=' + value;
	});
	myURL += queryParams;

	const fetchFlickrData = async () => {
		try {
			const response = await fetch(myURL);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			const jsonData = await response.json();
			let myFlickrImages = [];
			if(jsonData.photos) {
				// photos for tags - flickr.photos.search
				myFlickrImages = jsonData.photos.photo;
			} else if (jsonData.photoset) {
				// photoset for albums - flickr.photosets.getPhotos
				myFlickrImages = jsonData.photoset.photo;
			} else {
				console.log('Error fetching Flickr images');
			}
			myFlickrImages.sort((a: any, b: any) => {
				return new Date(b.datetaken).getTime() - new Date(a.datetaken).getTime();
			}); // b - a for reverse sort
			if (debug) console.log('Flickr Cards:', myFlickrImages);
			return myFlickrImages;
			// const myFlickrCards = GenerateFlickrCards(myFlickrImages);
			// console.log('Flickr Cards:', myFlickrCards);
			// return myFlickrCards;
		} catch (err) {
			console.log('Error fetching Flickr data:', err);
		} finally {
			if (debug) console.log('Flickr data fetch completed');
		}
	};
	return fetchFlickrData();

}



GenerateFlickrCards.propTypes = {
	flickrImages: PropTypes.array.isRequired,
	photoSize: PropTypes.string.isRequired,
};
export type GenerateFlickrCardsType = InferProps<typeof GenerateFlickrCards.propTypes>;
export function GenerateFlickrCards(props: GenerateFlickrCardsType) {
	if (props.flickrImages?.length > 0) {
		const photoSize = getFlickrSize(props.photoSize);
		const flickrCards = props.flickrImages.map((image: any, i: number) => (
			{
				link: 'https://farm' + image.farm + '.static.flickr.com/' + image.server + '/' + image.id + '_' + image.secret + photoSize + '.jpg' ,
				image: 'https://farm' + image.farm + '.static.flickr.com/' + image.server + '/' + image.id + '_' + image.secret + photoSize + '.jpg' ,
				imageAlt: image.title,
				headerText: image.title,
				subHeaderText: ( i + 1 ) + " of " + props.flickrImages.length + " by " + image.ownername + " on " + image.datetaken,
				bodyText: image.description._content,
			} 
		));
		return flickrCards;
	}
}




FlickrWrapper.propTypes = {
	method: PropTypes.string,
	api_key: PropTypes.string.isRequired,
	user_id: PropTypes.string.isRequired,
	tags: PropTypes.string,
	photoset_id: PropTypes.string,
	photoSize: PropTypes.string,
	callback: PropTypes.func.isRequired,
	/* 	callback: (arg0: CarouselCardType[]) => void; */
};
export type FlickrWrapperType = InferProps<typeof FlickrWrapper.propTypes>;
export function FlickrWrapper (props: FlickrWrapperType) {
	const flickr = {
		flickr : {
			baseURL: 'https://api.flickr.com/services/rest/?',
			urlProps: {
				method: props.method || 'flickr.photos.search',
				api_key: props.api_key /* || '882cab5548d53c9e6b5fb24d59cc321d' */ ,
				user_id: props.user_id /* || '15473210@N04' */,
				tags: props.tags || '' /* || 'btw-customsunglasses' */ ,
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
		const myFlickrCards = GenerateFlickrCards({flickrImages: myFlickrImages, photoSize: myPhotoSize});
		// REMOVE LINKS
		if (myFlickrCards) { 
			const myScrubbedFlickrCards = myFlickrCards.map((obj, index): CarouselCardType => {
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
