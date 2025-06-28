
export function getCloudinaryRemoteFetchURL(url: string,product_env: string) {
	const cloudinary_prefix = "https://res.cloudinary.com/" + product_env + "/image/fetch/f_auto,q_auto/";
	return cloudinary_prefix + url ;
}

/* 
https://cloudinary.com/blog/transparent_webp_format_cdn_delivery_based_on_visitors_browsers
https://cloudinary.com/blog/delivering_all_your_websites_images_through_a_cdn
*/