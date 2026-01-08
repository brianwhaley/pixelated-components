import { useEffect, useRef, RefObject } from 'react';

/**
 * Options for the IntersectionObserver hook
 */
export interface UseIntersectionObserverOptions {
	/** The element that is used as the viewport for checking visibility (null = browser viewport) */
	root?: Element | null;
	/** Margin around the root. Can have values similar to CSS margin property */
	rootMargin?: string;
	/** Either a single number or an array of numbers between 0 and 1 indicating at what percentage of the target's visibility the observer's callback should be executed */
	threshold?: number | number[];
	/** Whether to disconnect the observer after the first intersection */
	disconnectAfterIntersection?: boolean;
}

/**
 * Callback function type for intersection changes
 */
export type IntersectionCallback = (entry: IntersectionObserverEntry, observer: IntersectionObserver) => void;

/**
 * Custom hook for IntersectionObserver
 * 
 * @param callback - Function to call when intersection changes
 * @param options - IntersectionObserver options
 * @returns Ref to attach to the element to observe
 * 
 * @example
 * ```tsx
 * const elementRef = useIntersectionObserver((entry) => {
 *   if (entry.isIntersecting) {
 *     console.log('Element is visible!');
 *   }
 * }, { threshold: 0.5 });
 * 
 * return <div ref={elementRef}>Observed content</div>
 * ```
 */
export function useIntersectionObserver<T extends Element>(
	callback: IntersectionCallback,
	options: UseIntersectionObserverOptions = {}
): RefObject<T | null> {
	const elementRef = useRef<T | null>(null);

	useEffect(() => {
		const element = elementRef.current;
		if (!element) return;

		const {
			root = null,
			rootMargin = '0px',
			threshold = 0,
			disconnectAfterIntersection = false
		} = options;

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				callback(entry, observer);
				
				if (disconnectAfterIntersection && entry.isIntersecting) {
					observer.unobserve(entry.target);
				}
			});
		}, {
			root,
			rootMargin,
			threshold
		});

		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	}, [callback, options.root, options.rootMargin, options.threshold, options.disconnectAfterIntersection]);

	return elementRef;
}

/**
 * Utility function to observe multiple elements with the same configuration
 * Useful for observing a list of elements or when you need more control than the hook provides
 * 
 * @param selector - CSS selector for elements to observe
 * @param callback - Function to call when intersection changes
 * @param options - IntersectionObserver options
 * @returns Cleanup function to disconnect the observer
 * 
 * @example
 * ```tsx
 * useEffect(() => {
 *   const cleanup = observeIntersection('.fade-in', (entry) => {
 *     if (entry.isIntersecting) {
 *       entry.target.classList.add('visible');
 *     }
 *   }, { threshold: 0.1 });
 *   
 *   return cleanup;
 * }, []);
 * ```
 */
export function observeIntersection(
	selector: string,
	callback: IntersectionCallback,
	options: UseIntersectionObserverOptions = {}
): () => void {
	const {
		root = null,
		rootMargin = '0px',
		threshold = 0,
		disconnectAfterIntersection = false
	} = options;

	const elements = document.querySelectorAll(selector);
	if (elements.length === 0) {
		return () => {}; // Return no-op cleanup if no elements found
	}

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			callback(entry, observer);
			
			if (disconnectAfterIntersection && entry.isIntersecting) {
				observer.unobserve(entry.target);
			}
		});
	}, {
		root,
		rootMargin,
		threshold
	});

	elements.forEach((element) => {
		observer.observe(element);
	});

	// Return cleanup function
	return () => {
		observer.disconnect();
	};
}

/**
 * Utility functions for viewport detection
 * These are useful for initial checks before setting up observers
 */

/**
 * Check if an element is fully in the viewport
 */
export function isElementInViewport(element: Element): boolean {
	const rect = element.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
}

/**
 * Check if an element is partially in the viewport
 */
export function isElementPartiallyInViewport(element: Element): boolean {
	const rect = element.getBoundingClientRect();
	return (
		rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
		rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
		rect.bottom > 0 &&
		rect.right > 0
	);
}
