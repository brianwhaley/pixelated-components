"use client";

import React, { useState, useEffect } from "react";
import PropTypes, { InferProps } from 'prop-types';
// import { getCloudinaryRemoteFetchURL } from "../cms/cloudinary";
import { SmartImage } from "../general/smartimage";
import { usePixelatedConfig } from "../config/config.client";
import "./404.css";

/**
 * FourOhFour — Simple 404 page that randomly displays an image and short message.
 *
 * @param {array} [props.images] - Array of image objects used to display the 404 page. Each object should contain { img: string, text: string, description?: string }.
 */
FourOhFour.propTypes = {
	/** Array of image objects: { img: string, text: string, description?: string } */
	images: PropTypes.array.isRequired,
};
export type FourOhFourType = InferProps<typeof FourOhFour.propTypes>;
export function FourOhFour (props: FourOhFourType) {
    
	const images = props.images;

	const [ randomIndex, setRandomIndex ] = useState<number>(0);
	// const [ cloudinaryURL, setCloudinaryURL ] = useState<string>('');
	const [ imageURL, setImageURL ] = useState<string>('');
	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * images.length);
		setRandomIndex(randomIndex);
		// const cloudinaryURL = getCloudinaryRemoteFetchURL({ url: images[randomIndex].img, product_env:"dlbon7tpq" });
		// setCloudinaryURL(cloudinaryURL);
		setImageURL(images[randomIndex].img);
  	}, [images]);

	const config = usePixelatedConfig();

	if (randomIndex !== null && imageURL /* cloudinaryURL */ !== '') {
		return (
			<>
				<div className="fof-body-container">
					<h1 className="centered text-outline">404 - {images[randomIndex].text}</h1>
					<div className="centered-button"><a href="/" target="_self" rel="noopener noreferrer">Go Home</a></div>
				</div>	
				<div className="fof-image-container">
					<div className="fof-image-wrapper">
						<SmartImage src={imageURL} 
							// src={cloudinaryURL} 
							title={"Page Not Found - " + images[randomIndex].description} 
							alt={"Page Not Found - " + images[randomIndex].description} 
							variant="nextjs"
							cloudinaryEnv={config?.cloudinary?.product_env ?? undefined}
							cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
							cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined}
						/>
					</div>
				</div>
			</>
		);
	} else {
		return (
			<></>
		);
	}
}