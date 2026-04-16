
/* export function lazyLoadImages() {
	const lazyImages = document.querySelectorAll("img[data-src]");
	const options = {
		rootMargin: "0px 0px 100px 0px", // Preload images when they are 100px from entering the viewport
		threshold: 0, // Trigger when any part of the element intersects
	};
	const imageObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const image = entry.target as HTMLImageElement;
				image.src = image.dataset.src!; // Set the actual image source
				image.removeAttribute("data-src"); // Remove data-src to prevent re-observing
				// Optional: Add a class for styling or animation
				image.classList.add("loaded"); 
				observer.unobserve(image); // Stop observing once loaded
			}
		});
	}, options);
	lazyImages.forEach((image) => {
		imageObserver.observe(image);
	});
} */



 
function isInViewport(el: Element) {
	const rect = el.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
}



function isPartiallyInViewport(el: Element) {
	const rect = el.getBoundingClientRect();
	return (
		rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
		rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
		rect.bottom > 0 &&
		rect.right > 0
	);
}


export function preloadImages(){
	const images = document.querySelectorAll("img");
	images.forEach(function(image) {

		// PRELOAD THE IMAGE WITH A LINK TAG
		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'image';
		link.href = image.src;
		// link.type = 'image/' + image.src.split('.').pop();
		if(isPartiallyInViewport(image)) link.fetchPriority = 'high';
		document.head.appendChild(link);
		preloadImage(image.src);

		// SET FETCHPRIORITY = HIGH FOR ALL IMAGES IN VIEWPORT
		if( isPartiallyInViewport(image) ) {
			image.setAttribute('fetchpriority', 'high');
		}
		
	});
}

export function preloadImages_v2() {
	if (typeof document === "undefined") return; // SSR guard

	const images = document.querySelectorAll("img");
	const preloaded = new Set<string>();

	images.forEach((image) => {
		const src = image.src;
		if (!src || preloaded.has(src)) return; // Skip if no src or already preloaded

		// Create preload link
		const link = document.createElement("link");
		link.rel = "preload";
		link.as = "image";
		link.href = src;
		document.head.appendChild(link);

		// Preload via JS
		const img = new window.Image();
		img.src = src;

		preloaded.add(src);
	});
}



function preloadImage(url: string) {
	const img = new Image();
	img.src = url;
}

