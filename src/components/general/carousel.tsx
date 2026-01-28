"use client";

import React, { useState, useEffect, useRef } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SmartImage } from './smartimage';
import { usePixelatedConfig } from '../config/config.client';
import { DragHandler } from './carousel.drag';
import './carousel.css';

/* 
TODO: #20 Carousel bug conflict with drag and click
*/


/* ========== CAROUSEL IMAGE ORIENTATION ========== */
/* https://stackoverflow.com/questions/43430498/detecting-orientation-of-images-with-javascript */



export type CarouselCardType = {
	index: number,
	cardIndex: number,
	cardLength: number,
	link?: string,
	linkTarget?: string,
	image: string,
	imageAlt?: string,
	imgFit?: 'contain' | 'cover' | 'fill',
	headerText?: string,
	subHeaderText?: string,
	bodyText?: string,
};

function capitalize(str: string) {
	return str && String(str[0]).toUpperCase() + String(str).slice(1);
}


/* ========== CAROUSEL ========== */
/**
 * Carousel — renders a rotating set of card slides (images and optional text) with autoplay and optional drag support.
 *
 * @param {arrayOf} [props.cards] - Array of cards to display; each card may include image, header, subHeader, body and link.
 * @param {number} [props.index] - Initial active index for the carousel (zero-based).
 * @param {number} [props.cardIndex] - Current active index managed by the component (zero-based).
 * @param {number} [props.cardLength] - Total number of cards (used for stacking and calculations).
 * @param {string} [props.link] - Optional fallback link for a card when provided at the card level.
 * @param {string} [props.linkTarget] - Target attribute for links (e.g. '_self', '_blank').
 * @param {string} [props.image] - Image URL for a card.
 * @param {string} [props.imageAlt] - Alt text for the card image (accessibility).
 * @param {oneOf} [props.imgFit] - How to fit images: 'contain' | 'cover' | 'fill'.
 * @param {string} [props.headerText] - Optional card header/title text.
 * @param {string} [props.subHeaderText] - Optional card subtitle text.
 * @param {string} [props.bodyText] - Optional card body content.
 * @param {boolean} [props.draggable] - Enable swipe/drag interactions on touch devices.
 */
Carousel.propTypes = {
/** Array of card objects used to render slides. */
	cards: PropTypes.arrayOf(
		PropTypes.shape({
			/** Zero-based index of this card within the source array. */
			index: PropTypes.number.isRequired,
			/** Index of the currently active card as passed to each card. */
			cardIndex: PropTypes.number.isRequired,
			/** Total number of cards in the carousel (used for z-index/stacking). */
			cardLength: PropTypes.number.isRequired,
			/** Optional href for this card. */
			link: PropTypes.string,
			/** Optional link target attribute (e.g., '_self', '_blank'). */
			linkTarget: PropTypes.string,
			/** Image URL for the slide (required). */
			image: PropTypes.string.isRequired,
			/** Alt text for the image (used for accessibility). */
			imageAlt: PropTypes.string,
			/** Image fitting mode: 'contain' | 'cover' | 'fill'. */
			imgFit: PropTypes.oneOf(['contain', 'cover', 'fill']),
			/** Title or header text shown on the card. */
			headerText: PropTypes.string,
			/** Optional subtitle text for the card. */
			subHeaderText: PropTypes.string,
			/** Optional body content for the card. */
			bodyText: PropTypes.string,
		})
	).isRequired,
	/** Enable swipe/drag interactions on touch and pointer devices. */
	draggable: PropTypes.bool,
	imgFit: PropTypes.oneOf(['contain', 'cover', 'fill'])
};
export type CarouselType = InferProps<typeof Carousel.propTypes>;
export function Carousel(props: CarouselType) {
	const debug = false;
	let timer = useRef<ReturnType<typeof setTimeout>>(null);
	const [ cardIndex, setcardIndex ] = useState(0);

	function startTimer() {
		if (timer.current) clearTimeout(timer.current);
  		timer.current = setTimeout(nextCard, 5000); 
	}
	function stopTimer() {
		if (timer.current) clearTimeout(timer.current);
	}

	function previousCard() {
		if (debug) console.log("Going to Previous card : ", cardIndex, " => ", cardIndex - 1);
		if (cardIndex === 0) {
			setcardIndex(props.cards.length - 1);
		} else {
			setcardIndex(cardIndex - 1);
		}
		startTimer();
	};

	function nextCard() {
		if (debug) console.log("Going to Next card : ", cardIndex, " => ", cardIndex + 1);
		if (cardIndex === props.cards.length - 1) {
			setcardIndex(0);
		} else {
			setcardIndex(cardIndex + 1);
		}
		startTimer();
	};

	useEffect(() => {
		if (typeof document !== 'undefined') {
			startTimer();
		}
	}, [cardIndex]);

	/* ========== DRAGGABLE HANDLER ========== */
	if (props.draggable && props.draggable === true) {
		if (debug) console.log('CarouselSimple: Dragging enabled');
		DragHandler({
			activeIndex: cardIndex, 
			targetDiv: 'carousel-card-wrapper', 
			nextImage: nextCard, 
			previousImage: previousCard
		});
	} else {
		if (debug) console.log('CarouselSimple: Dragging disabled');
	}

	if (props.cards && props.cards.length > 0) {
		return (
			<div className="carousel-container">
				<div className="carousel-cards-container">
					{ (props.cards as CarouselCardType[]).map((card, i) => (
						<CarouselCard
							key={i}
							index={i}
							cardIndex={cardIndex}
							cardLength={props.cards.length}
							link={card.link}
							linkTarget={card.linkTarget || '_self'}
							image={card.image}
							imageAlt={card.imageAlt}
							imgFit={(props.imgFit || 'fill') as 'contain' | 'cover' | 'fill'}	
							headerText={card.headerText} 	
							subHeaderText={card.subHeaderText} 
							bodyText={card.bodyText}
						/>
					))}
				</div>
				<div className="carousel-buttons">
					<CarouselButton
						clickFunction={ previousCard }
						glyph='&#9664;' />
					<CarouselButton
						clickFunction={ stopTimer }
						glyph='&#x23F8;' />
					<CarouselButton
						clickFunction={ nextCard }
						glyph='&#9654;' />
				</div>
				
			</div>
		);
	} else {
		return (
			<div className='section-container'>
				<div className="carousel-container">
					<CarouselLoading />
				</div>
			</div>
		);
	}
}



/* ========== CAROUSEL CARD ========== */
function CarouselCard( props: CarouselCardType ) {
	const myZindex = props.cardLength - props.index;
	const styles: React.CSSProperties = {
		zIndex: myZindex
	};
	styles.transition = 'all 1.0s ease 0.1s';
	if (props.index > props.cardIndex) {
		styles.transform = 'translateX(100%)';
	} else if (props.index === props.cardIndex) {
		styles.transform = 'translateX(0%)';
	} else if (props.index < props.cardIndex) {
		styles.transform = 'translateX(-100%)';
	}
	const imgFit = props.imgFit ? "img" + capitalize(props.imgFit) : 'imgFill';
	const config = usePixelatedConfig();	
	const cardBody = (
		< div draggable='false'>
			{ (props.link) ? <div draggable='false' className="carousel-card-link" /> : null }
			{ (props.image) ? <div draggable='false' className="carousel-card-image">
				<SmartImage draggable={false} src={props.image} title={props?.imageAlt} 
					alt={props?.imageAlt || ""} className={imgFit} 
					cloudinaryEnv={config?.cloudinary?.product_env ?? undefined}
					cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
					cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined} />
			</div> : null }
			{ (props.headerText) ? <div draggable='false' className="carousel-card-header">
				<h3 draggable='false'>{props.headerText}</h3>
			</div> : null  }
			{ (props.subHeaderText) ? <div draggable='false' className="carousel-card-subheader">
				<h4 draggable='false'>{props.subHeaderText}</h4>
			</div> : null  }
			{ (props.bodyText) ? <div draggable='false' className="carousel-card-body">{props.bodyText}</div> : null  }
		</div>
	);
	return (
		<div draggable='true' id={'c-' + props.index} className="carousel-card-wrapper" style={styles}>
			<div draggable='false' className="carousel-card">
				{ (props.link) ? <a draggable='false' href={props.link} target={props.linkTarget}>{ cardBody }</a> : cardBody }
			</div>
		</div>
		
	);
}
// REMOVED PROPTYPE AS TYPESCRIPT TYPE COVERS THIS



/* ========== CAROUSEL  ARROW ========== */
/**
 * CarouselButton — small interactive control used to navigate carousel slides.
 *
 * @param {function} [props.clickFunction] - Click handler invoked when the control is pressed.
 * @param {string} [props.glyph] - Label or HTML entity used to visually render the button.
 */
CarouselButton.propTypes = {
/** Click handler invoked when the control is clicked. */
	clickFunction: PropTypes.func.isRequired,
	/** Label or glyph to display inside the button. */
	glyph: PropTypes.string.isRequired
};
function CarouselButton(props: { clickFunction: React.MouseEventHandler<HTMLButtonElement>; glyph: string; }) {
	return (
		<button className={`carousel-button text-outline`}
			onClick={ props.clickFunction }>
			{ props.glyph }
		</button>
	);
}



/**
 * CarouselArrow — Render a directional navigation control used by the Carousel.
 *
 * Renders a button styled for left or right placement and calls the provided handler when clicked.
 *
 * @param {('left'|'right')} [props.direction] - Direction used to determine button styling/placement.
 * @param {function} [props.clickFunction] - Click handler invoked when the control is pressed.
 * @param {string} [props.glyph] - Glyph or label text displayed inside the button.
 */
CarouselArrow.propTypes = {
	/** Direction keyword used to choose button styling/placement ('left'|'right'). */
	direction: PropTypes.string.isRequired,
	/** Click handler invoked by the arrow control. */
	clickFunction: PropTypes.func.isRequired,
	/** Glyph or label text used for the arrow control. */
	glyph: PropTypes.string.isRequired
};
function CarouselArrow(props: { direction: string; clickFunction: React.MouseEventHandler<HTMLButtonElement>; glyph: string; }) {
	return (
		<button className={`carousel-button${capitalize(props.direction)} text-outline`}
			onClick={ props.clickFunction }>
			{ props.glyph }
		</button>
	);
}



/* ========== CAROUSEL LOADING ========== */
function CarouselLoading() {
	return (
		<div className="carousel-loading horizontal-centered vertical-centered centered">
			<div>Loading...</div>
		</div>
	);
}
