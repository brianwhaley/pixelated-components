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
Tiles.propTypes = {
	cards: PropTypes.array.isRequired,
	rowCount: PropTypes.number,
	imgClick: PropTypes.func,
	/**
	 * Optional visual variant. Allowed values are enumerated so consumers get
	 * a discoverable, typed API.
	 */
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
Tile.propTypes = {
	index: PropTypes.number.isRequired,
	cardLength: PropTypes.number.isRequired,
	link: PropTypes.string,
	image: PropTypes.string.isRequired,
	imageAlt: PropTypes.string,
	bodyText: PropTypes.string,
	imgClick: PropTypes.func,
	/** 'caption' - visual caption beneath image (prefers bodyText, falls back to imageAlt) */
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

