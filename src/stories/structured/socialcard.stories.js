import React from 'react';
import { SocialCards } from '@/components/general/socialcard';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';
import '@/css/pixelated.global.css';

const mockConfig = {
	cloudinary: {
		product_env: 'dlbon7tpq',
		baseUrl: 'https://res.cloudinary.com',
		transforms: 'f_auto,c_limit,q_auto,dpr_auto',
	},
};

const mySources = {
	SOOpx: { url: "https://500px.com/brianwhaley/rss" },
	blog: { url: "https://blog.pixelated.tech/feed/", iconSrcAlt: "Pixelated Technologies Blog Post" },
	/* BLURB */
	ebay: { url: "https://rssbay.net/feed?keyword=sunglasses&globalId=EBAY-US&auction=1&buyitnow=1&condition=-&seller=pixelatedtech&time-frame-type=-&time-frame-value=-" },
	etsy: { url: "https://www.etsy.com/people/bwhaley73/favorites/items.rss" },
	/* FACEBOOK */
	flickr: { url : "https://www.flickr.com/services/feeds/photoset.gne?nsid=15473210@N04&set=72157712416706518&lang=en-us&format=rss2" },
	/* foursquare: { url: 'https://feeds.foursquare.com/history/LZSXBIJMSBHI5EQXV1GTQOVQW5XRJ0FP.rss' }, */
	github: { url: "https://github.com/brianwhaley.atom" },
	goodreads: { url:  "https://www.goodreads.com/review/list_rss/49377228?key=3KvDb_dRiJMRnHlEeNtUOsn-Ry396qlabqubyfD6jFiSDk9q&shelf=currently-reading" },
	goodreads2: { url: "https://www.goodreads.com/review/list_rss/49377228?key=3KvDb_dRiJMRnHlEeNtUOsn-Ry396qlabqubyfD6jFiSDk9q&shelf=books-for-work", iconSrcAlt: 'Goodreads Book For Work' },
	/* INSTAGRAM */
	/* iStockPhoto */
	/* LinkedIn */
	pinterest: { url: "https://www.pinterest.com/brianwhaley/feed.rss" },
	reddit: { url: "https://www.reddit.com/user/btw-73/saved.rss?feed=fc1adaa9f977a389504453447e7c0e6ef68f7037&user=btw-73" },
	/* https://ssl.reddit.com/prefs/feeds/ */
	shutterfly: { url: "https://cmd.shutterfly.com/commands/format/rss?site=brianwhaley&page=brianwhaley" },
	/* snapchat */
	/* ShutterStock */
	/* TickTock */
	tumblr: { url: "https://pixelatedviews.tumblr.com/rss" },
	x: { url : "https://rsshub.app/twitter/user/brianwhaley", iconSrcAlt: 'Tweets from Brian Whaley'},
	// twitter: { url: "https://twitrss.me/twitter_user_to_rss/?user=brianwhaley" },
	// twitter: { url : "https://rss.app/feeds/MPULoVcijU5AAHxU.xml", iconSrcAlt: 'Tweets from Brian Whaley'},
	// twitter: { url: "https://twitrss.me/twitter_user_to_rss/?user=pixelatedviews" }
	x2: { url : "https://rsshub.app/twitter/user/pixelatedviews", iconSrcAlt: 'Tweets from Pixelated Technologies'},
	// twitter2: { url : "https://rss.app/feeds/B0rl26o7ehFAuBoq.xml", iconSrcAlt: 'Tweets from picelated.views'},
	youtube: { url: "https://www.youtube.com/feeds/videos.xml%3Fchannel_id=UCKk2eBwml-4mEsmMK-dK6sQ" }
};

export default {
	title: 'Structured',
	component: SocialCards,
	decorators: [
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(Story) => (
			<PixelatedClientConfigProvider config={mockConfig}>
				<Story />
			</PixelatedClientConfigProvider>
		),
	],
};

export const SocialCardStory = {
	args: {
		sources: mySources
	}
};
