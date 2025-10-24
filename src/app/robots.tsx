import type { MetadataRoute } from 'next';
 
export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: '',
		},
		sitemap: 'https://www.brianwhaley.com/sitemap.xml',
	};
}