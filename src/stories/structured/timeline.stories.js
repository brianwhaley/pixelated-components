import React from 'react';
import { Timeline } from "@/components/general/timeline";
import '@/css/pixelated.global.css';

const timelineData = [
	{ 
		title: "Gather Information",
		content: `Connect directly with you, find out what is working, what is not.
			What do you wish you could spend less time doing? 
			What would make your company more efficient?
			What would make your customers happier with your service?
			Once we identify these, we can put together a Strategy tailored just for you.`,
		image: "/images/icons/gather-info.png",
		direction: "left"
	},{ 
		title: "Build our Strategy",
		content: `Document and share a plan that includes all the information we gathered.
			It will also include an ananlysis of your competitors, 
			technology recommendations for search engine optimization, 
			review metrics of success and how they will be gathered, 
			how to manage advertising and marketing (digital and traditional media)
			and a social media analysis and plan. `,
		image: "/images/icons/strategy.png",
		direction: "right"
	},{ 
		title: "Implement",
		content: `This is where the action happens.
			We will break down the details of the strategy to implement the plan.
			Out objective here is to improve the results for the customer and 
			make the health of your company and its colleagues a better place to work.`,
		image: "/images/icons/implement.png",
		direction: "left"
	},{ 
		title: "Measure Outcomes",
		content: `It is important to know where you are, and where you want to be, 
		to come up with a plan on how to get there. The right measurements will show how 
		Pixelated Technologies is helping your customers and you achieve the right outcomes.  `,
		image: "/images/icons/measure.png",
		direction: "right"
	},{ 
		title: "Refine Results",
		content: `Once the results start coming in, we may need to make adjustments.  
		Advertise in different social media outlets, target a different geographic area, 
		measure different outcomes, or change the strategy.  Small and simple changes
		will put you right back on course.`,
		image: "/images/icons/optimize.png",
		direction: "left"
	},{ 
		title: "Support",
		content: `Once the Digital and Social Media Machine is working for you, 
			we will continue to support you and your customers with the latest technology and
			updates to keep you on course.  We can help you expand your content, 
			create posts for social media, and help you expand your marketing into new areas. `,
		image: "/images/icons/support.png",
		direction: "right"
	}
];

export default {
	title: 'Structured',
	component: Timeline,
};

export const TimelineStory = {
	args: {
		timelineData: timelineData,
	}
};
