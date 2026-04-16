
import PropTypes, { InferProps } from "prop-types";
import { smartFetch } from '../foundation/smartfetch';


export type SpotifyPodcastSeriesType = {
	title: string;
	description: string;
	link: string;
	generator: string;
	lastBuildDate: string;
	author: string;
	copyright: string;
	language: string;
	iTunesAuthor: string;
	summary: string;
	type: string;
	owner: { 
		name: string;
		email: string;
	},
	explicit: string;
	category: string;
	image: string;
};



function SpotifyRSSSeriesToJson (data: string) {
	const parser = new DOMParser();
	const xml = parser.parseFromString(data, 'application/xml');
	const channel = xml.querySelectorAll('channel');
	if (channel.length > 0) {
		const item = channel[0];
		return {
			title: item.querySelector('title')?.textContent,
			description: item.querySelector('description')?.textContent,
			link: item.querySelector('link')?.textContent,
			generator: item.querySelector('generator')?.textContent,
			lastBuildDate: item.querySelector('lastBuildDate')?.textContent,
			author: item.querySelector('author')?.textContent,
			copyright: item.querySelector('copyright')?.textContent,
			language: item.querySelector('language')?.textContent,
			iTunesAuthor: item.querySelector('author')?.textContent,
			summary: item.querySelector('summary')?.textContent,
			type: item.querySelector('type')?.textContent,
			owner: { 
				name: item.querySelector('owner')?.querySelector('name')?.textContent,
				email: item.querySelector('owner')?.querySelector('email')?.textContent,
			},
			explicit: item.querySelector('explicit')?.textContent,
			category: item.querySelector('category')?.textContent,
			image: item.querySelector('image')?.getAttribute('href') || '',
			/* 
			<atom:link href="https://anchor.fm/s/10fc04b98/podcast/rss" rel="self" type="application/rss+xml"/>
			<atom:link rel="hub" href="https://pubsubhubbub.appspot.com/"/>
			*/
		};
	} else {
		return {};
	}
}



/**
 * getSpotifySeries — Fetch series information from the Spotify API for a given podcast.
 *
 * @param {string} [props.rssURL] - RSS feed URL of the podcast.
 */
getSpotifySeries.propTypes = {
	/** RSS feed URL of the podcast */
	rssURL: PropTypes.string.isRequired,
};
export type getSpotifySeriesType = InferProps<typeof getSpotifySeries.propTypes>;
export async function getSpotifySeries(props: getSpotifySeriesType){
	const { rssURL } = props;
	try {
		const data = await smartFetch(rssURL, {
			responseType: 'text',
		});
		let rssJSON = SpotifyRSSSeriesToJson(data);
		return rssJSON as unknown as SpotifyPodcastSeriesType;
	} catch (error) {
		console.error("Error fetching Spotify series data via RSS:", error);
		return;
	}
}




export type SpotifyPodcastEpisodeType = {
	title: string;
	description: string;
	link: string;
	guid: string;
	creator: string;
	pubDate: string;
	enclosure: {
		url: string;
		type: string;
		length: string;
	};
	summary: string;
	explicit: boolean;
	duration: string;
	image: string;
	episode: string;
	episodeType: string;
};




function SpotifyRSSItemsToJson (data: string) {
	const parser = new DOMParser();
	const xml = parser.parseFromString(data, 'application/xml');
	let items;
	if (xml.querySelectorAll('item').length > 0) {
		items = Array.from(xml.querySelectorAll('item')).map(item => {
			return {
				title: item.querySelector('title')?.textContent,
				description: item.querySelector('description')?.textContent,
				link: item.querySelector('link')?.textContent,
				guid: item.querySelector('guid')?.textContent,
				creator: item.querySelector('creator')?.textContent,
				pubDate: item.querySelector('pubDate')?.textContent,
				enclosure: {
					url: item.querySelector('enclosure')?.getAttribute('url') || '',
					type: item.querySelector('enclosure')?.getAttribute('type') || '',
					length: item.querySelector('enclosure')?.getAttribute('length') || '',
				},
				summary: item.querySelector('summary')?.textContent,
				explicit: item.querySelector('explicit')?.textContent,
				duration: item.querySelector('duration')?.textContent,
				image: item.querySelector('image')?.getAttribute('href') || '',
				episode: item.querySelector('episode')?.textContent,
				episodeType: item.querySelector('episodeType')?.textContent,
			};
		});
	} 
	return (items);
}



/**
 * getSpotifyEpisodes — Fetch episodes from the Spotify API for a given podcast.
 *
 * @param {string} [props.rssURL] - RSS feed URL of the podcast.
 */
getSpotifyEpisodes.propTypes = {
	/** RSS feed URL of the podcast */
	rssURL: PropTypes.string.isRequired,
};
export type getSpotifyEpisodesType = InferProps<typeof getSpotifyEpisodes.propTypes>;
export async function getSpotifyEpisodes(props: getSpotifyEpisodesType){
	const { rssURL } = props;
	try {
		const data = await smartFetch(rssURL, {
			responseType: 'text',
		});
		let rssJSON = SpotifyRSSItemsToJson(data);
		if (rssJSON) rssJSON = rssJSON.sort((a, b) => ((a.pubDate ?? '') < (b.pubDate ?? '')) ? 1 : -1);
		return rssJSON as unknown as SpotifyPodcastEpisodeType[];
	} catch (error) {
		console.error("Error fetching Spotify episodes via RSS:", error);
		return;
	}
}

