"use client";

import { PageTitleHeader, PageSection, PageSectionHeader } from "@pixelated-tech/components";
import { Tiles } from "@pixelated-tech/components";

export default function About() {

	const plazaTiles = [
	{
		index: 0, cardIndex: 0, cardLength: 3,
		image: "/images/photos/Plaza_IMG_2359.jpg",
		imageAlt: "Plaza Commercial Landscaping",
	},
    {
		index: 1, cardIndex: 1, cardLength: 3,
		image: "/images/photos/Plaza_IMG_2364.jpg",
		imageAlt: "Plaza Commercial Landscaping",
	},
	{
		index: 2, cardIndex: 2, cardLength: 3,
		image: "/images/photos/Plaza_IMG_2669.jpg",
		imageAlt: "Plaza Commercial Landscaping",
	}, 
	{
		index: 0, cardIndex: 0, cardLength: 3,
		image: "/images/photos/Plaza_IMG_4026.jpg",
		imageAlt: "Plaza Commercial Landscaping",
	},
    {
		index: 1, cardIndex: 1, cardLength: 3,
		image: "/images/photos/Plaza_IMG_4033.jpg",
		imageAlt: "Plaza Commercial Landscaping",
	},
	{
		index: 2, cardIndex: 2, cardLength: 3,
		image: "/images/photos/Plaza_IMG_4044.jpg",
		imageAlt: "Plaza Commercial Landscaping",
	}];

	const HamptonLake = [
	{
		index: 0, cardIndex: 0, cardLength: 3,
		image: "/images/photos/HamptonLake_95F061CC.jpg",
		imageAlt: "Hampton Lake Residential Landscaping",
	},
    {
		index: 1, cardIndex: 1, cardLength: 3,
		image: "/images/photos/HamptonLake_7346F472.jpg",
		imageAlt: "Hampton Lake Residential Landscaping",
	},
	{
		index: 2, cardIndex: 2, cardLength: 3,
		image: "/images/photos/HamptonLake_IMG_5152.jpg",
		imageAlt: "Hampton Lake Residential Landscaping",
	}];
    
	return (
		<>

			<PageTitleHeader title="Oaktree Projects" />

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Our Projects" />

				<h3>Plaza - Commercial Landscaping</h3>
				<Tiles cards={plazaTiles} rowCount={3}/>

				<h3>Hampton Lake - Residential Landscaping</h3>
				<p>The scenic 227-acre freshwater lake near Bluffton, SC 
					serves as the centerpiece of a community that attracts 
					families with a dynamic Lowcountry living experience.</p>
				<Tiles cards={HamptonLake} rowCount={3}/>
			</PageSection>

		</>
	);
}
