"use client";

import React from 'react';
import PropTypes, { InferProps } from "prop-types";
import type { CarouselCardType } from "./carousel";
import { Loading } from "../general/loading";
import { SmartImage } from "./smartimage";
import { usePixelatedConfig } from '../config/config.client';
import "../../css/pixelated.grid.scss";
import "./tiles.css";

export const TilesVariants = [ 'caption', 'overlay' ] as const;
export type TilesVariantType = typeof TilesVariants[number] | undefined;
/**
 * Tiles — renders a responsive grid of image tiles with optional click handlers and visual variants.
 *
 * @param {array} [props.cards] - Array of card objects to render (image, link, imageAlt, bodyText).
 * @param {number} [props.rowCount] - Number of rows to display; affects column sizing.
 * @param {function} [props.imgClick] - Optional (event, imageUrl) click handler for tile images.
 * @param {oneOf} [props.variant] - Visual variant: 'caption' (caption beneath image) or 'overlay' (overlay on hover).
 */
Tiles.propTypes = {
/** Array of card objects used to populate the tile grid (image, link, imageAlt, bodyText). */
	cards: PropTypes.array.isRequired,
	/** Number of rows to display in the grid (controls layout). */
	rowCount: PropTypes.number,
	/** Optional click handler for tile images; called with (event, imageUrl). */
	imgClick: PropTypes.func,
	/**
	 * Optional visual variant. Allowed values are enumerated so consumers get
	 * a discoverable, typed API.
	 */
	/** Visual variant for tile rendering (e.g. 'caption' or 'overlay'). */
	variant: PropTypes.oneOf(TilesVariants),
};
export type TilesType = InferProps<typeof Tiles.propTypes>;
export function Tiles(props: TilesType) {
	const rowCount = props.rowCount ?? 2;
	if (props.cards && props.cards.length > 0) {
		return (
			<div className="tiles-container">
				<div className={`tile-container row-${rowCount}col`}>
					{ props.cards.map((card: CarouselCardType, i: number) => (
						<div key={i} className="gridItem">
							<Tile
								index={i}
								cardLength={props.cards.length}
								link={card.link}
								image={card.image}
								imageAlt={card.imageAlt}
								bodyText={card.bodyText}
								imgClick={props.imgClick}
								variant={(props.variant ?? "overlay" )as TilesVariantType}
							/>
						</div>
					))}
				</div>
			</div>
		);
	} else {
		return (
			<Loading />
		);
	}
}



/* ========== TILE ========== */
/**
 * Tile — single grid tile that displays an image with optional link and caption/overlay.
 *
 * @param {number} [props.index] - Zero-based index for the tile (used for IDs).
 * @param {number} [props.cardLength] - Total number of tiles in the current set.
 * @param {string} [props.link] - Optional href for the whole tile.
 * @param {string} [props.image] - Image URL to display (required).
 * @param {string} [props.imageAlt] - Alt text for the image; used as caption fallback.
 * @param {string} [props.bodyText] - Optional caption or descriptive text for the tile.
 * @param {function} [props.imgClick] - Optional click handler for the image (event, imageUrl).
 * @param {oneOf} [props.variant] - Visual variant: 'caption' | 'overlay'.
 */
Tile.propTypes = {
/** Zero-based index of the tile. */
	index: PropTypes.number.isRequired,
	/** Total number of tiles in this grid. */
	cardLength: PropTypes.number.isRequired,
	/** Optional href for this tile. */
	link: PropTypes.string,
	/** Image source URL to display (required). */
	image: PropTypes.string.isRequired,
	/** Alt text for the image; also used as caption fallback. */
	imageAlt: PropTypes.string,
	/** Optional caption or descriptive body text shown with the tile. */
	bodyText: PropTypes.string,
	/** Click handler invoked when the tile image is clicked; receives (event, imageUrl). */
	imgClick: PropTypes.func,
	/** 'caption' - caption beneath image; 'overlay' - overlay displayed on hover. */
	variant: PropTypes.oneOf(TilesVariants),
};
export type TileType = InferProps<typeof Tile.propTypes>;
function Tile( props: TileType ) {
	const config = usePixelatedConfig();
	const imgClick = props.imgClick;
	const captionText = (props.bodyText && props.bodyText.length > 0) ? props.bodyText : (props.imageAlt ?? "");
	const tileBody = <div className={"tile-image" + (imgClick ? " clickable" : "")}>
		<SmartImage src={props.image} title={props?.imageAlt ?? undefined} alt={props?.imageAlt ?? ""}
			onClick={imgClick ? (event) => imgClick(event, props.image) : undefined}
			cloudinaryEnv={config?.cloudinary?.product_env ?? undefined} />
		<div className="tile-image-overlay">
			<div className="tile-image-overlay-text">
				<div className="tile-image-overlay-title">{props.imageAlt}</div>
				<div className="tile-image-overlay-body">{props.bodyText}</div>
			</div>
		</div>
	</div>;
	const rootClass = `tile${ (props.variant) ? ' ' + props.variant : ''}`;
	return (
		<div className={rootClass} id={'tile-' + props.index} >
			{ props.link ?
				<a href={props.link} className="tileLink">
					{ tileBody }
				</a>
				:
				tileBody
			}
		</div>
	);
}

