/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetFlickrData, GenerateFlickrCards } from '@brianwhaley/pixelated-components';
import type { CarouselCardType } from '@brianwhaley/pixelated-components';
import { getCloudinaryRemoteFetchURL } from "@brianwhaley/pixelated-components";

export default async function GalleryWrapper(
	props: { 
		tags?: string; 
		method?: string,
		photoset_id?: string,
		photoSize: string; 
		callback: (arg0: CarouselCardType[]) => void; }
) {

	const flickr = {
		flickr : {
			baseURL: 'https://api.flickr.com/services/rest/?',
			urlProps: {
				method: 'flickr.photos.search',
				api_key: '882cab5548d53c9e6b5fb24d59cc321d',
				user_id: '15473210@N04',
				tags: 'btw-customsunglasses',
				photoset_id: '',
				extras: 'date_taken,description,owner_name',
				sort: 'date-taken-desc',
				per_page: 500,
				format: 'json',
				photoSize: 'Large',
				nojsoncallback: 'true' 
			}
		} 
	};
	if (props.tags) flickr.flickr.urlProps.tags = props.tags;
	if (props.method) flickr.flickr.urlProps.method = props.method;
	if (props.photoset_id) flickr.flickr.urlProps.photoset_id = props.photoset_id;
	if (props.photoSize) flickr.flickr.urlProps.photoSize = props.photoSize;
    
	async function getFlickrCards() {
		const myPromise = GetFlickrData(flickr);
		const myFlickrImages = await myPromise;
		const myFlickrCards = GenerateFlickrCards({flickrImages: myFlickrImages, photoSize: 'Medium'});
		// REMOVE LINKS
		if (myFlickrCards) { 
			let mySortedFlickrCards = [ ...myFlickrCards];
			mySortedFlickrCards = mySortedFlickrCards.sort((a: any, b: any) => {
				if (a.headerText < b.headerText) { return 1; } 
				else if (a.headerText > b.headerText) { return -1; } 
				else { return 0; }
			});
			const myScrubbedFlickrCards = mySortedFlickrCards.map((obj, index): CarouselCardType => {
				return {
					index: index,
					cardIndex: index,
					cardLength: myFlickrCards.length,
					image: getCloudinaryRemoteFetchURL({url: obj.image, product_env:"dlbon7tpq"}),
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
