"use client";

import { Callout, PageHeader, PageSection } from "@pixelated-tech/components";

export default function About() {
    
	return (
		<>

			<PageHeader title="Oaktree Services" />

			<PageSection columns={2} maxWidth="1024px" padding="20px" id="colors-section">
				<Callout 
					layout="vertical"
					img="/images/icons/placeholder.png"
					title="Commercial"
					content="A reputable landscape management company understands that the 
					exterior appearance of a business is a direct reflection of its professional 
					standards and brand image. Specializing exclusively in commercial properties, 
					these firms offer a comprehensive suite of services designed to enhance curb appeal, 
					ensure safety, and maintain aesthetic integrity year-round. 
					Offerings typically extend beyond basic mowing to include specialized services 
					such as sustainable irrigation management, seasonal color programs, 
					hardscape maintenance, and crucial winter weather services like snow and ice removal. 
					By partnering with a dedicated commercial landscape provider, property managers 
					and business owners can ensure their grounds remain pristine, welcoming, 
					and compliant with local regulations, freeing them to focus on core operational 
					priorities while the landscape professionals manage the outdoor environment."
					/>
				<Callout 
					layout="vertical"
					img="/images/icons/placeholder.png"
					title="Residential"
					content="A quality landscape company catering to homeowners transforms private 
					outdoor spaces into personalized sanctuaries and extensions of interior living areas. 
					These residential specialists collaborate closely with clients to design, 
					install, and maintain beautiful, functional landscapes that meet the unique needs 
					and lifestyles of families. Services often blend routine maintenance—such as 
					precision mowing and garden care—with bespoke enhancement projects, 
					including the installation of custom patios, elegant outdoor lighting, 
					native plantings, or edible gardens. By leveraging expert horticultural knowledge 
					and design principles, these companies ensure that residential properties 
					not only achieve maximum curb appeal but also increase in value and enjoyment, 
					providing a beautiful backdrop for everyday living without the homeowner having to lift a finger."
					/>
			</PageSection>

			<PageSection columns={2} maxWidth="1024px" padding="20px" id="colors-section">
				<Callout
					variant="boxed"
					layout="horizontal"
					direction="left"
					img="/images/icons/placeholder.png"
					title="Lawn Care"
				/>
				<Callout
					variant="boxed"
					layout="horizontal"
					direction="left"
					img="/images/icons/placeholder.png"
					title="Garden Care"
				/>
				<Callout
					variant="boxed"
					layout="horizontal"
					direction="left"
					img="/images/icons/placeholder.png"
					title="Irrigation"
				/>
				<Callout
					variant="boxed"
					layout="horizontal"
					direction="left"
					img="/images/icons/placeholder.png"
					title="Hardscaping"
				/>
				<Callout
					variant="boxed"
					layout="horizontal"
					direction="left"
					img="/images/icons/placeholder.png"
					title="Tree Services"
				/>
			</PageSection>

		</>
	);
}
