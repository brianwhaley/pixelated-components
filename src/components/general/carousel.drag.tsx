
import { useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';

/* 
    if (props.draggable && props.draggable === true) {
        if (debug) console.log('CarouselSimple: Dragging enabled');
        DragHandler(cardIndex, 'carousel-card-wrapper', nextCard, previousCard);
    } else {
        if (debug) console.log('CarouselSimple: Dragging disabled');
    }
*/

/**
 * DragHandler — attaches global drag/touch handlers to enable swipe navigation for a carousel-like container.
 *
 * @param {number} [props.activeIndex] - Current active slide index (used to calculate offsets).
 * @param {string} [props.targetDiv] - CSS class name of the container that should be draggable (e.g., 'carousel-card-wrapper').
 * @param {function} [props.nextImage] - Callback invoked to advance to the next slide.
 * @param {function} [props.previousImage] - Callback invoked to go to the previous slide.
 */
DragHandler.propTypes = {
	/** Current active slide index. */
	activeIndex: PropTypes.number.isRequired, 
	/** CSS class of the container element to attach drag handlers to (without the leading dot). */
	targetDiv: PropTypes.string.isRequired,
	/** Callback to show the next image/slide. */
	nextImage: PropTypes.func.isRequired, 
	/** Callback to show the previous image/slide. */
	previousImage:  PropTypes.func.isRequired, 
};
export type DragHandlerType = InferProps<typeof DragHandler.propTypes>;
export function DragHandler(props: DragHandlerType ) {
// export function DragHandler(props: { activeIndex: number, targetDiv: string, nextImage: () => void, previousImage: () => void} ) {

	const classSelector = props.targetDiv;
	const divSelector = 'div.' + classSelector ;
	const debug = false;

	function dragObj() {
		return {
			draggable: false,
			dragMoving: false,
			startX: 0, /* start left of object */
			firstX: 0, /* first mouse x */
			previousX: 0, /* prevous mouse x */
			currentX: 0, /* current mouse x */
			directionX: 0,
			momentumX: 0, /* maximum diff of current and previous */
			moveX: 0, /* total mouse x distance */
			newX: 0, /* new left of object */
			minDistance: 50,
			dragStyles: {} as { [key: string]: string }
		};
	}
	let drag = dragObj();

	function dragStart(event: MouseEvent | TouchEvent | DragEvent) {
		if (debug) { console.log('Drag Start - ' + event.type); }
		// var elem = event.currentTarget ;
		const target = event.target as HTMLElement;
		const currentTarget = event.currentTarget as HTMLElement;
		const elem = target.closest(divSelector) as HTMLElement;
		if (!elem) {
			if (debug) console.log('No element found for drag start');
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		drag.draggable = true;
		drag.previousX = drag.firstX;
		drag.currentX = drag.firstX;
		drag.startX = elem.offsetLeft;
		/* Add existing drag styles to array - save for later */
		drag.dragStyles.transform = elem.style.transform;
		drag.dragStyles.transition = elem.style.transition;
		if(event instanceof MouseEvent) {
			drag.firstX = Math.round(event.pageX);
		} else if (event instanceof TouchEvent) {
			drag.firstX = Math.round(event.touches[0].pageX );
		} 
		if (event instanceof DragEvent) {
			const dragEvent = event as DragEvent;
			if (dragEvent.dataTransfer) {
				dragEvent.dataTransfer.setData('text/plain', currentTarget.id);
				const img = new Image();
				// http://probablyprogramming.com/2009/03/15/the-tiniest-gif-ever
				img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
				dragEvent.dataTransfer.setDragImage(img, 0, 0);
			}
		}
	};

	function draggable(event: MouseEvent | TouchEvent) {
		drag.dragMoving = true;
		if (drag.draggable) {
			event.preventDefault();
			event.stopPropagation();
			const target = event.target as HTMLElement;
			const elem = target.closest(divSelector) as HTMLElement;
			if (!elem) {
				if (debug) console.log('No element found for draggable');
				return;
			}
			drag.previousX = drag.currentX;
			if(event instanceof MouseEvent) {
				drag.currentX = Math.round(event.pageX);
			} else if (event instanceof TouchEvent) {
				drag.currentX = Math.round(event.touches[0].pageX );
			}
			/* Set Momentum to max value */
			const _momentumX = Math.round(Math.abs(drag.previousX - drag.currentX));
			drag.momentumX = (_momentumX > drag.momentumX) ? _momentumX : drag.momentumX;
			drag.moveX = Math.round(Math.abs(drag.firstX - drag.currentX));
			/* Right to Left or Left to Right */
			drag.directionX = (drag.firstX > drag.currentX) ? -1 : 1;
			drag.newX = drag.startX + (drag.moveX * drag.directionX);
			elem.style.left = drag.newX + 'px';
			/* Remove styles that conflict with dragging */
			elem.style.transition = '';
			elem.style.transform = '';
		}
	};

	function dragEnd(event: MouseEvent | TouchEvent) {
		if (drag.draggable) {
			if (debug) { console.log('Drag End - ' + event.type); }
			const target = event.target as HTMLElement;
			const elem = target.closest(divSelector) as HTMLElement;
			if (!elem) {
				if (debug) console.log('No element found for drag end');
				return;
			}

			/* Add styles back */
			for (const property in drag.dragStyles) {
				elem.style[property as any] = drag.dragStyles[property];
			}

			/* Determine drag distance */
			drag.previousX = drag.currentX;
			if(event instanceof MouseEvent) {
				drag.currentX = Math.round(event.pageX);
			} else if (event instanceof TouchEvent) {
				drag.currentX = Math.round(event.changedTouches[0].pageX );
			}
			drag.moveX = Math.round(Math.abs(drag.firstX - drag.currentX));
			const farEnough = drag.moveX > drag.minDistance;

			/* Add momentum at the end of the slide */
			elem.style.transition = 'all 0.5s ease-out 0.0s'; /* ease-in */
			elem.style.transform = 'translateX(' + ((drag.newX + (drag.momentumX)) * drag.directionX) + ')';

			/* roll in the next / previous image */
			if (farEnough && drag.directionX !== 0) {
				if ( (drag.directionX < 0) ) { 
					if (debug) console.log("Dragged Far Enough - Go Next");
					props.nextImage(); 
				} else { 
					if (debug) console.log("Dragged Far Enough - Go Previous");
					props.previousImage(); 
				} ;
			} else {
				if (debug) console.log("Not Dragged Far Enough!");
			}
			/* Reset drag variables */
			drag = dragObj();

		}
	};

	function transitionEnd(event: MouseEvent | TouchEvent) {
		if (debug) { console.log('Transition End - ' + event.type); }
		const elem = event.target as HTMLElement;
		if (!elem) {
			if (debug) console.log('No element found for transition end');
			return;
		}
		if (elem.matches(divSelector)) {
			elem.style.left = '0px';
		}
	};

	function handleEventListeners(activeIndex: number) {
		useEffect(() => {
			// const container = document.getElementById(classSelector);
			// { passive: true } is needed for preventDefault to work on drag events
			document.addEventListener('touchstart', dragStart as EventListener, { capture: true, passive: false });
			document.addEventListener('touchmove', draggable as EventListener, { capture: true, passive: false });
			document.addEventListener('touchend', dragEnd as EventListener, { capture: true, passive: true });
			document.addEventListener('mousedown', dragStart as EventListener, { capture: true, passive: false });
			document.addEventListener('mousemove', draggable as EventListener, { capture: true, passive: false });
			document.addEventListener('mouseup', dragEnd as EventListener, { capture: true, passive: true });
			document.addEventListener('transitionend', transitionEnd as EventListener, { capture: true, passive: true });
			return () => {
				// { passive: true } is not needed to match and remove an event listener
				document.removeEventListener('touchstart', dragStart as EventListener, { capture: true });
				document.removeEventListener('touchmove', draggable as EventListener, { capture: true });
				document.removeEventListener('touchend', dragEnd as EventListener, { capture: true });
				document.removeEventListener('mousedown', dragStart as EventListener, { capture: true });
				document.removeEventListener('mousemove', draggable as EventListener, { capture: true });
				document.removeEventListener('mouseup', dragEnd as EventListener, { capture: true });
				document.removeEventListener('transitionend', transitionEnd as EventListener, { capture: true });
			};
		}, [activeIndex]);
	}

	handleEventListeners(props.activeIndex);

}
