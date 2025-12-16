"use client";

import React, { useEffect, useState } from "react";
import { PageTitleHeader, PageSection, PageGridItem, PageSectionHeader } from "@pixelated-tech/components";
import { GravatarCard } from '@pixelated-tech/components';
import { getGravatarProfile, type GravatarProfile } from '@pixelated-tech/components';
import { Carousel } from "@pixelated-tech/components";

export default function About() {
	const email1 = "oaktreelandscaper@gmail.com"
	// const email2 = "brian@pixelated.tech"; 

	const [profile1, setProfile1] = useState<GravatarProfile | null>(null);
	// const [profile2, setProfile2] = useState<GravatarProfile | null>(null);

	useEffect(() => {
		if (email1) {
			getGravatarProfile(email1).then((data) => {
				setProfile1(data);
			});
		}
		/* if (email2) {
			getGravatarProfile(email2).then((data) => {
				setProfile2(data);
			});
		} */
	}, [email1 /* ,email2 */ ]);

	const mycards = [
	{
		headerText: "Oaktree Transformed Our Yard!",
		subHeaderText: "\"We recently hired Oaktree Landscaping for a complete overhaul of our home's landscaping, and we couldn't be happier! From the initial consultation, they were professional, listened to our vision, and offered great ideas for our Bluffton yard. The crew was efficient, respectful, and meticulous with every detail, from pruning to new plantings. Our neighbors have already stopped to compliment the work. Highly recommend Oaktree for residential projects!\"",
		bodyText: " - David Chen",
		index: 0, cardIndex: 0, cardLength: 3, image: "",
	} , {
		headerText: "Top-Notch Commercial Service",
		subHeaderText: "\"As a property manager in Bluffton, finding reliable commercial landscaping is crucial. Oaktree Landscaping consistently delivers! Their team maintains our office complex beautifully, handling everything from seasonal cleanups to ongoing maintenance with precision. They're proactive, communicate well, and always leave the property looking pristine. A truly professional and dependable partner for any business.\"",
		bodyText: " - Sarah Jenkins",
		index: 1, cardIndex: 1, cardLength: 3, image: "",
	} , {
		headerText: "Reliable, Detail-Oriented & Friendly",
		subHeaderText: "\"Oaktree Landscaping is a gem! They've been taking care of our lawn and garden beds for months, and the difference is night and day. They show up on time, work hard, and genuinely care about the quality of their work. The team is friendly and always willing to offer solid advice on keeping our landscape healthy in the coastal climate. They're efficient, affordable, and just a pleasure to work with - a five-star service all the way\"",
		bodyText: " - Michael O'Connell",
		index: 2, cardIndex: 2, cardLength: 3, image: "",
	}];

    
	return (
		<>

			<PageTitleHeader title="About Oaktree Landscaping" />

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="team-section">

				<PageSectionHeader title="Our Team" />

				<PageGridItem >
					<GravatarCard 
						profile={profile1}
						layout="horizontal"
						thumbnailUrl="/images/rene_garcia_sq.jpg"
						avatarSize={300}

					/>
				</PageGridItem>

				{ /* <PageGridItem>
					<GravatarCard 
						profile={profile2}
						layout="vertical"
						avatarSize={200}
					/>
				</PageGridItem> */ }

			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="history-section">
				
				<PageSectionHeader title="Our History" />

				<p>In the heart of the South Carolina Lowcountry, Oaktree Landscaping 
					began its journey in Bluffton with little more than one truck 
					and a dedication to quality residential care. Founded by Rene in the late 90s, 
					the company built its reputation one yard at a time. 
					They focused on mastering the unique challenges of Lowcountry soil and climate, 
					offering personalized services that transformed modest residential plots into lush, 
					sustainable sanctuaries. His hands-on approach and commitment to 
					individual homeowner satisfaction quickly fostered a loyal clientele, 
					establishing a strong foundation rooted in trust and meticulous attention to detail.</p>
				
				<p>As their reputation flourished through word-of-mouth, Oaktree Landscaping 
					strategically expanded its operations to meet the growing demands of 
					Bluffton&lsquo;s booming commercial sector. The small, family-owned business 
					gradually scaled up to handle larger, more complex projects, from designing 
					intricate hardscapes for new community developments to maintaining the 
					extensive grounds of local resorts and business parks. This period marked 
					significant growth, requiring investment in specialized equipment and the 
					hiring of expert landscape architects. Yet, despite taking on bigger 
					commercial challenges, the company remained true to its founding principles of 
					reliability and aesthetic excellence, adapting its bespoke service model 
					to suit the professional landscape.</p>
				
				<p>At Oaktree Landscaping, the philosophy remains simple: 
					every project is a testament to the art of superior landscaping. 
					The goal is to exceed expectations not just through the beauty 
					of the finished work, but through exceptional service and a profound respect 
					for the regional environment. We are dedicated to delivering unparalleled quality 
					using sustainable practices that enhance the natural beauty of the Lowcountry, 
					ensuring that every green space we touch—whether a private residence 
					or a commercial plaza—flourishes in harmony with the community it serves. 
					The commitment is unwavering: creating lasting beauty, one landscape at a time.</p>

			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="feedback-section">
				<PageSectionHeader title="Testimonials" />
				<Carousel cards={mycards} />
			</PageSection>

		</>
	);
}
