/**
 * SEO Analysis Constants
 * Shared constants for SEO analysis functionality
 */

// Common URL patterns to exclude from SEO analysis
export const EXCLUDED_URL_PATTERNS = [
	'/images', '/images/', '/css/', '/js/', '/assets/', '/static/',
	'/wp-content/', '/wp-includes/', '/admin/', '/wp-admin/',
	'/media/', '/uploads/', '/files/', '/downloads/',
	'/api/', '/graphql', '/feed', '/rss', '/atom',
	'/sitemap.xml', '/robots.txt', '/favicon.ico'
];

export const EXCLUDED_FILE_EXTENSIONS = /\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot|pdf|doc|docx|xls|xlsx|zip|rar|mp3|mp4|avi|mov)$/i;

export const EXCLUDED_DIRECTORY_NAMES = ['images', 'css', 'js', 'assets', 'static', 'media'];