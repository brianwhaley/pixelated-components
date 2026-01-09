// Example pixelated.config.ts for consumer apps.
// Place this file in your app (for example: `src/pixelated.config.ts`) and import it where you mount the provider.

import type { PixelatedConfig } from './config.types';

const pixelatedConfig: PixelatedConfig = {
	global: {
		proxyUrl: 'https://proxy.pixelated.tech/prod/proxy?url=',
	},
	cloudinary: {
		product_env: 'your-cloud-name',
		baseUrl: 'https://res.cloudinary.com',
		secure: true,
		transforms: 'f_auto,c_limit,q_auto,dpr_auto',
	},
	contentful: {
		base_url: "https://cdn.contentful.com",
		space_id: "soi9w77t7027",
		environment: "master",
		delivery_access_token: "muY9LfpCt4qoXosDsnRkkoH3DAVVuUFEuB0WRKRdBUM",
		management_access_token: "muY9LfpCt4qoXosDsnRkkoH3DAVVuUFEuB0WRKRdBUM",
		preview_access_token: "muY9LfpCt4qoXosDsnRkkoH3DAVVuUFEuB0WRKRdBUM",
	},
	ebay: {
		proxyURL: 'https://proxy.provier.com/proxy?url=',
		appId: 'your-ebay-client-id',
		appDevId: 'your-ebay-client-dev-id',
		appCertId: 'your-ebay-client-secret',
		sbxAppId: 'your-ebay-sandbox-client-id',
		sbxAppDevId: 'your-ebay-sandbox-client-dev-id',
		sbxAppCertId: 'your-ebay-sandbox-client-secret',
		globalId: 'EBAY_US',
		environment: 'production',
		tokenScope: 'https://api.ebay.com/oauth/api_scope',
		baseTokenURL: 'https://api.ebay.com/identity/v1/oauth2/token',
		baseSearchURL : 'https://api.ebay.com/buy/browse/v1/item_summary/search',
		qsSearchURL: '?q=sunglasses&fieldgroups=full&category_ids=79720&aspect_filter=categoryId:79720&filter=sellers:{pixelatedtech}&sort=newlyListed&limit=200',
		baseItemURL: 'https://api.ebay.com/buy/browse/v1/item',
		qsItemURL: '/v1|295959752403|0?fieldgroups=PRODUCT,ADDITIONAL_SELLER_DETAILS',
	},
	flickr: {
		baseURL: 'https://api.flickr.com/services/rest/?',
		urlProps: {
			method: 'flickr.photos.search',
			api_key: 'your-flickr-api-key',
			user_id: 'your-flickr-user-id',
			tags: 'gallery-name',
			extras: 'date_taken,description,owner_name',
			sort: 'date-taken-desc',
			per_page: 500,
			format: 'json',
			photoSize: 'Medium',
			nojsoncallback: 'true'
		}
	},
	googleAnalytics: {
		id: 'G-XXXXXXX',
		adId: 'AW-XXXXXXXXX',
	},
	googleSearchConsole: {
		"id": "G-XXXXXXX"
	},
	hubspot: {
		region: 'na1',
		portalId: 'your-hubspot-portal-id',
		formId: 'your-default-form-id',
		trackingCode: 'UA-XXXXXXXXX-X',
	},
	paypal: {
		sandboxPayPalApiKey: "your-sandbox-paypal-client-id",
		sandboxPayPalSecret: "your-sandbox-paypal-client-secret",
		payPalApiKey: "your-paypal-client-id",
		payPalSecret: "your-paypal-client-secret"
	},
	wordpress: {
		baseURL: 'https://public-api.wordpress.com/rest/v1/sites/',
		site: 'your-blog.wordpress.com'
	},
};

export default pixelatedConfig;
