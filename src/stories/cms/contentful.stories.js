import React, { useState, useEffect } from "react";
import { Carousel } from "@/components/general/carousel";
import { getContentfulEntriesByType } from "@/components/general/contentful.delivery";
import { PixelatedClientConfigProvider } from '@/components/config/config.client';
import '@/css/pixelated.global.css';

const mockConfig = {
	cloudinary: {
		product_env: 'dlbon7tpq',
		baseUrl: 'https://res.cloudinary.com',
		transforms: 'f_auto,c_limit,q_auto,dpr_auto',
	},
};

export default {
	title: 'CMS',
	component: Carousel,
	decorators: [
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(Story) => (
			<PixelatedClientConfigProvider config={mockConfig}>
				<Story />
			</PixelatedClientConfigProvider>
		),
	],
};


const FeedbackGallery = () => {
	const [ feedbackCards , setFeedbackCards ] = useState([]);
	const apiProps = {
		base_url: "https://cdn.contentful.com",
		space_id: "soi9w77t7027",
		environment: "master",
		delivery_access_token: "muY9LfpCt4qoXosDsnRkkoH3DAVVuUFEuB0WRKRdBUM",
	};
	useEffect(() => {
		async function getFeedbackCards() {
			const contentType = "feedback"; 
			const typeCards = await getContentfulEntriesByType({ apiProps: apiProps, contentType: contentType }); 
			const items = typeCards.items.filter((card) => card.sys.contentType.sys.id === contentType);
			const cardLength = items.length;
			const reviewCards = items.map(function (card, index) {
				return {
					headerText: card.fields.feedbackText,
					bodyText: "- " + card.fields.name,
					index: index,
					cardIndex: index,
					cardLength: cardLength,
				};
			});
			setFeedbackCards(reviewCards);
		}
		getFeedbackCards();
	}, []);
	
	return (
		<PixelatedClientConfigProvider config={mockConfig}>
			<section style={{backgroundColor: "var(--accent1-color)"}} id="feedback-section">
				<div className="section-container">
					<Carousel 
						cards={feedbackCards} 
						draggable={false}
						imgFit='contain' />
				</div>
			</section>
		</PixelatedClientConfigProvider>
	);
};

export const Contentful = () => <FeedbackGallery />;
