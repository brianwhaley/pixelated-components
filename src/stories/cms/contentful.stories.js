import React, { useState, useEffect } from "react";
import { Carousel } from "@/components/general/carousel";
import { getContentfulEntriesByType } from "@/components/general/contentful.delivery";
import { usePixelatedConfig } from "@/components/config/config.client";
import '@/css/pixelated.global.css';

export default {
	title: 'CMS',
	component: Carousel,
};


const FeedbackGallery = () => {
	const [ feedbackCards , setFeedbackCards ] = useState([]);
	const config = usePixelatedConfig();

	useEffect(() => {
		async function getFeedbackCards() {
			if (!config?.contentful) return;
			const contentType = "feedback"; 
			const typeCards = await getContentfulEntriesByType({ 
				apiProps: {
					base_url: config.contentful.base_url,
					space_id: config.contentful.space_id,
					environment: config.contentful.environment,
					delivery_access_token: config.contentful.delivery_access_token,
					proxyURL: config.contentful.proxyURL,
				}, 
				contentType: contentType 
			}); 
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
	}, [config]);
	
	return (
		<section style={{backgroundColor: "var(--accent1-color)"}} id="feedback-section">
			<div className="section-container">
				<Carousel 
					cards={feedbackCards} 
					draggable={false}
					imgFit='contain' />
			</div>
		</section>
	);
};

export const Contentful = () => <FeedbackGallery />;
