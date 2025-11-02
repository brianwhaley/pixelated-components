"use client";

import { FourOhFour } from "@brianwhaley/pixelated-components";
import data404 from "../app/data/404-data.json";
const images = data404.images;

export default function NotFound () {
	return (
		<section id="notfound-section">
			<div className="section-container">
				<FourOhFour images={images} />
			</div>
		</section>
	);
}