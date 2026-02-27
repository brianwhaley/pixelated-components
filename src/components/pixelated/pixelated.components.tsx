"use client";

import React, {  } from "react";
import PropTypes, { InferProps } from 'prop-types';
import { SmartImage } from "../general/smartimage";

/**
 * PixelatedFooter — Simple footer component for Pixelated sites. 
 * @param {any} [props] - No props are accepted by PixelatedFooter.
 */
PixelatedFooter.propTypes = { /** no props */ };
export type PixelatedFooterType = InferProps<typeof PixelatedFooter.propTypes>;
export function PixelatedFooter (props: PixelatedFooterType) {
	return (
		<>
			<p className="footer-text">Designed and developed by 
				<a href="https://www.pixelated.tech" target="_blank" rel="noopener noreferrer">
					<SmartImage
						src="https://www.pixelated.tech/images/pix/pix-bg.png" alt="Pixelated Technologies"
						width={50} height={50}
						style={{ width: "20px", height: "20px", margin: "0 1px 0 8px", verticalAlign: "middle", borderRadius: "5px" }}
					/>Pixelated Technologies.
				</a>
			</p>
		</>
	);
}