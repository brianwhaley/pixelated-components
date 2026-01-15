import React, { useState, useEffect } from 'react';
import PropTypes, { InferProps } from "prop-types";
import { mergeDeep } from '../general/utilities';
import { SmartImage } from '../general/smartimage';
import { usePixelatedConfig } from '../config/config.client';
import './socialcard.css';

/* ========== NOTES ==========
TODO #24 SocialCard Component - Add Blurb FaceBook Github iStock LinkedIn SnapChat ShutterStock TickTock Google News Saved Articles
ERRORS: 500px, shutterfly

/* function removeAnchors(element) {
	const anchors = element.querySelectorAll('a');
	anchors.forEach(anchor => {
		const parent = anchor.parentNode;
		const text = anchor.innerHTML;
		parent.insertBefore(document.createTextNode(text), anchor);
		parent.removeChild(anchor);
	});
} */

function removeDeadHrefs(element: string) {
	const parser = new DOMParser();
  	const doc = parser.parseFromString(element, 'text/html');
	const anchors = doc.querySelectorAll('a');
	anchors.forEach(anchor => {
		const href = anchor.getAttribute('href');
		if (href && !href.startsWith('http://') && !href.startsWith('https://')) {
			anchor.removeAttribute('href');
		}
	});
	return doc.body.innerHTML;
}

/* ========== SOCIALCARD ========== */
SocialCards.propTypes = {
	sources: PropTypes.object.isRequired
};
export type SocialCardsType = InferProps<typeof SocialCards.propTypes>;
export function SocialCards(props: SocialCardsType) {
	const debug = false;
	const [ state, setState ] = useState({
		loading: true,
		targetID: '#social',
		myCardData: [],
		mySocialCards: [],
		proxy: {
			proxyURL: 'https://proxy.pixelated.tech/prod/proxy',
			proxyURLParam: 'url'
		},
		rss2json: {
			apiURL: 'https://api.rss2json.com/v1/api.json',
			apiURLParam: 'rss_url',
			apiKey: 'c3wsmqh4h1iydxxip3sgkr1jtk3brllbp61jc6yd'

		},
		toptal: {
			apiURL: 'https://www.toptal.com/developers/feed2json/convert',
			apiURLParam: 'url',
			apiKey: ''
		},
		sources: mergeDeep( {
			/* DEFAULT VALUES FOR KNOWN SOURCES */
			blank: { url: null , entryCount: 5, iconSrc: '', iconSrcAlt: '' },
			SOOpx: { url: null , entryCount: 5, iconSrc: '/images/logos/500px-logo.png', iconSrcAlt: '500px Post' },
			blog: { url: null , entryCount: 5, iconSrc: '/images/logos/blog-logo.png', iconSrcAlt: 'Blog Post' },
			ebay: { url: null , entryCount: 5, iconSrc: '/images/logos/ebay-logo.png', iconSrcAlt: 'eBay Items For Sale' },
			etsy: { url: null , entryCount: 5, iconSrc: '/images/logos/etsy-logo.png', iconSrcAlt: 'Etsy Favorite' },
			/* facebook: { iconSrc: '/images/logos/facebook-logo.png', iconSrcAlt: 'Facebook Wall Post' }, */
			flickr: { userID: '', apiKey: '', tags: '', entryCount: 5, iconSrc: '/images/logos/flickr-logo.png', iconSrcAlt: 'Flickr Photo' },
			/* ==========
			NOTE - FourSquare RSS stopped working March 2019
			========== */
			/* foursquare: { url: null , entryCount: 5, iconSrc: '/images/logos/foursquare-logo.png', iconSrcAlt: 'FourSquare Checkin' }, */
			github: { url: null , entryCount: 5, iconSrc: '/images/logos/github-logo.png', iconSrcAlt: 'Github Activity' },
			goodreads: { url: null , entryCount: 5, iconSrc: '/images/logos/goodreads-logo.png', iconSrcAlt: 'GoodReads Currently Reading' },
			instagram: { userID: '', entryCount: 5, iconSrc: '/images/logos/instagram-logo.jpg', iconSrcAlt: 'Instagram Photo' },
			pinterest: { url: null , entryCount: 5, iconSrc: '/images/logos/pinterest-logo.png', iconSrcAlt: 'Pinterest Pin' },
			reddit: { url: null , entryCount: 5, iconSrc: '/images/logos/reddit-logo.png', iconSrcAlt: 'Reddit Saves' },
			shutterfly: { url: null , entryCount: 5, iconSrc: '/images/logos/shutterfly-logo.jpg', iconSrcAlt: 'Shutterfly Items' },
			tumblr: { url: null , entryCount: 5, iconSrc: '/images/logos/tumblr-logo.png', iconSrcAlt: 'Tumblr Post' },
			twitter: { url: null , entryCount: 5, iconSrc: '/images/logos/twitter-logo.png', iconSrcAlt: 'Twitter Tweet' },
			x: { url: null , entryCount: 5, iconSrc: '/images/logos/x-logo.png', iconSrcAlt: 'X Post' },
			youtube: { url: null , entryCount: 5, iconSrc: '/images/logos/youtube-logo.png', iconSrcAlt: 'Youtube Favorite Video' },
			other: { url: null , entryCount: 5, iconSrc: '/images/logos/blog-logo.png', iconSrcAlt: 'Post' }
		}, props.sources )
	});

	async function RSSFeedToJson (url: string) {
		if (debug) { console.log('Fetching RSS...', url ); }
		async function fetchRSS () {
			try {
				const response = await fetch(url, {
					method: 'GET',
					credentials: 'same-origin',
					// crossDomain: true,
					mode: 'cors',
					headers: { 'Content-Type': 'application/json' }
				});
				const text = await response.text();
				const parser = new DOMParser();
				const xml = parser.parseFromString(text, 'application/xml');
				let items;
				if (xml.querySelectorAll('item').length > 0) {
					items = Array.from(xml.querySelectorAll('item')).map(item => {
						return {
							author: item.querySelector('author')?.textContent,
							category: item.querySelector('category')?.textContent,
							description: item.querySelector('description')?.textContent,
							// description: removeDeadAnchors(item.querySelector('description')?.textContent),
							guid: item.querySelector('guid')?.textContent,
							link: item.querySelector('link')?.textContent,
							pubDate: item.querySelector('pubDate')?.textContent,
							source: item.querySelector('source')?.textContent,
							title: item.querySelector('title')?.textContent
						};
					});
				} else {
					/* ===== FIX FOR REDDIT ===== */
					items = Array.from(xml.querySelectorAll('entry')).map(item => {
						return {
							author: item.querySelector('author')?.textContent,
							category: item.querySelector('category')?.attributes.getNamedItem('term')?.nodeValue,
							description: item.querySelector('content')?.textContent,
							// description: removeDeadAnchors(item.querySelector('content')?.textContent),
							guid: item.querySelector('id')?.textContent,
							link: item.querySelector('link')?.attributes.getNamedItem('href')?.nodeValue,
							pubDate: item.querySelector('published')?.textContent,
							source: item.querySelector('source')?.textContent,
							title: item.querySelector('title')?.textContent
						};
					});
				}
				return (items);
			} catch (err) {
				return (err);
			}
		}
		return fetchRSS();
	}

	function sortCardsByPubDate (a: any, b: any) {
		const property = 'pubDate';
		const dateA = new Date(a[property]);
		const dateB = new Date(b[property]);
		if (dateA < dateB) {
			return 1;
		} else if (dateA > dateB) {
			return -1;
		} else {
			return 0;
		}
	}

	async function getFeedEntries (myURL: string, entryCount: number) {
		if (debug) { console.log('Getting Feed Entries... ', myURL); }
		const proxiedURL = state.proxy.proxyURL + '?' + state.proxy.proxyURLParam + '=' + encodeURIComponent(myURL);
		let sourceCardData: any[] = [];
		// const result = await RSSFeedToJson(proxiedURL)
		await RSSFeedToJson(proxiedURL)
			.then(
				(items: any) => {
					let i = 0;
					for (const prop in items) {
						let myNewCard: any = {};
						const item = items[prop];
						myNewCard = item;
						/* ===== FIX FOR SOURCE ===== */
						if (!(item.source)) {
							myNewCard.source = new URL(myURL).hostname;
						}
						sourceCardData.push(myNewCard);
						// ===== BREAK ON ENTRY COUNT ===== */
						if ( i >= entryCount - 1 ) { break; }
						i++;
					}
				}
			);
		return sourceCardData;
	}

	async function gatherData () {
		if (debug) { console.log('Gathering Data...'); }
		let allCardData: any[] = [] ;
		for (const prop in state.sources) {
			const source = state.sources[prop];
			let sourceCardData: any[] = [] ;
			if (Object.prototype.hasOwnProperty.call(source, 'url') && source.url && source.url.length > 0) {
				sourceCardData = await getFeedEntries(source.url, source.entryCount);
				allCardData = [...allCardData, ...sourceCardData] ;
			}
		}
		if (debug) { console.log('All card Data... ', allCardData); }
		allCardData = allCardData.sort(sortCardsByPubDate);
		return allCardData;
	}


	useEffect(() => {
		if (debug) { console.log("Did Mount!"); }
		let myNewCardData: any = [];
		let myNewSocialCards: any = [];
		const generateSocialCards = async () => {
			try {
				myNewCardData = await gatherData();
				for (const prop in myNewCardData) {
					let myOptions: any = {};
					const card = myNewCardData[prop];
					switch (true) {
					case (card.link?.indexOf('500px.com') > -1): myOptions = state.sources.SOOpx; break;
					case (card.link?.indexOf('blog') > -1): myOptions = state.sources.blog; break;
					case (card.link?.indexOf('ebay.com') > -1): myOptions = state.sources.ebay; break;
					case (card.link?.indexOf('etsy.com') > -1): myOptions = state.sources.etsy; break;
					case (card.link?.indexOf('flickr.com') > -1): myOptions = state.sources.flickr; break;
					case (card.link?.indexOf('github.com') > -1): myOptions = state.sources.github; break;
					case (card.link?.indexOf('goodreads.com') > -1): myOptions = state.sources.goodreads; break;
					case (card.link?.indexOf('instagram') > -1): myOptions = state.sources.instagram; break;
					case (card.link?.indexOf('pinterest.com') > -1): myOptions = state.sources.pinterest; break;
					case (card.link?.indexOf('reddit.com') > -1): myOptions = state.sources.reddit; break;
					case (card.link?.indexOf('shutterfly.com') > -1): myOptions = state.sources.shutterfly; break;
					case (card.link?.indexOf('tumblr.com') > -1): myOptions = state.sources.tumblr; break;
					case (card.link?.indexOf('twitter') > -1): myOptions = state.sources.twitter; break;
					case (card.link?.indexOf('x.com') > -1): myOptions = state.sources.x; break;
					case (card.link?.indexOf('youtube') > -1): myOptions = state.sources.youtube; break;
					case (card.link?.indexOf('other') > -1): myOptions = state.sources.other; break;
					default: myOptions = state.sources.blank; break;
					}
					/* ===== UPDATE STATE ===== */
					const newSocialCard = <SocialCard key={prop + '' + card.guid} iconSrc={myOptions.iconSrc} iconSrcAlt={myOptions.iconSrcAlt} card={card} />;
					myNewSocialCards.push(newSocialCard);
				}
			} catch (e) {
				console.log("Error : ", e);
			} finally {
				setState({ 
					...state, 
					myCardData: myNewCardData,
					mySocialCards: myNewSocialCards, 
					loading: false
				});
			}
		};
		generateSocialCards();
	}, [props.sources]);

	if (state.loading) {
		return (<SocialCardsLoading />);
	} else {
		return (state.mySocialCards);
	}

}

SocialCard.propTypes = {
	iconSrc: PropTypes.string.isRequired,
	iconSrcAlt: PropTypes.string.isRequired,
	card: PropTypes.any.isRequired
};
export type SocialCardType = InferProps<typeof SocialCard.propTypes>;
export function SocialCard(props: SocialCardType) {
	const config = usePixelatedConfig();
	return (
		<div className="masonryItem" key={props.card.guid}>
			<div className="card">
				<div className="cardTitle">
					<a href={props.card.link} target="_blank" rel="noopener noreferrer">
						<SmartImage className="cardIcon" src={props.iconSrc} title={props.iconSrcAlt} alt={props.iconSrcAlt} 
							cloudinaryEnv={config?.cloudinary?.product_env}
							cloudinaryDomain={config?.cloudinary?.baseUrl}
							cloudinaryTransforms={config?.cloudinary?.transforms}
						/>
						{props.card.title}
					</a>
				</div>
				<div className="cardBody" dangerouslySetInnerHTML={{ __html: removeDeadHrefs(props.card.description) }} />
				<div className="cardDate">{props.card.pubDate}</div>
			</div>
		</div>
	);
}

/* ========== SPINNER ========== */
SocialCardsLoading.propTypes = {};
export type SocialCardsLoadingType = InferProps<typeof SocialCardsLoading.propTypes>;
export function SocialCardsLoading() {
	return (
		<div className="cardsLoading">
			<div>Loading...</div>
		</div>
	);
}
