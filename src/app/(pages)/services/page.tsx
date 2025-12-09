"use client";

import { Callout, PageTitleHeader, PageSection } from "@pixelated-tech/components";

export default function About() {
    
	return (
		<>

			<PageTitleHeader title="Oaktree Services" />

			<PageSection columns={2} maxWidth="1024px" padding="20px" id="primary-service-section">
				<Callout 
					layout="vertical"
					img="/images/stock/city-view.jpg"
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
					img="/images/stock/garden-with-natural-vegetation-with-lots-trees-pool-that-creates-armonic-atmosphere.jpg"
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

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="secondary-service-section">
				<Callout
					variant="boxed grid"
					gridColumns={{left:1, right:3}}
					layout="horizontal"
					direction="left"
					img="/images/stock/pexels-luis-negron-260501657-13630739.jpg"
					title="Lawn Care"
					content="Our comprehensive Lawn Care program is designed to cultivate a vibrant, resilient, and beautiful turf that serves as the centerpiece of your landscape. We understand that a healthy lawn requires more than just regular mowing, which is why our services extend to include professional edging, precise fertilization schedules tailored to your soil composition, and targeted weed and pest control treatments. To ensure deep root health and optimal nutrient absorption, we also offer core aeration and overseeding services, especially beneficial for thin or high-traffic areas. This meticulous, year-round approach guarantees that your grass remains lush and green, enhancing your property's overall curb appeal and providing a perfect setting for outdoor enjoyment. We are committed to using best practices to create a durable, sustainable lawn you can be proud of."
				/>
				<Callout
					variant="boxed grid"
					gridColumns={{left:3, right:1}}
					layout="horizontal"
					direction="right"
					// img="/images/stock/pexels-shvetsa-5027602.jpg"
					img="/images/stock/worker-cutting-bush-with-hedge-shears-outdoors-closeup-gardening-tool.jpg"
					title="Garden Care"
					content="With our specialized Garden Care services, we transform your planting beds into stunning, flourishing displays that evolve with the seasons. We begin by implementing a routine maintenance schedule that includes expert pruning of all shrubs, perennials, and ornamental grasses to encourage healthy growth and desirable shapes. A key component of our service is professional mulching, which not only provides a clean, finished look but also significantly helps in retaining soil moisture, suppressing weed growth, and regulating soil temperature. Our team also manages seasonal cleanups, deadheading spent blooms, and can design and install new seasonal plantings or annual color rotations to keep your garden vibrant and interesting year-round. Let us handle the detailed work so you can relax and enjoy a meticulously maintained garden space."
				/>
				<Callout
					variant="boxed grid"
					gridColumns={{left:1, right:3}}
					layout="horizontal"
					direction="left"
					img="/images/stock/natural-grass-close-up.jpg"
					title="Hardscape"
					content="Transforming the functionality and architecture of your outdoor living space is the goal of our premium Hardscaping services, where we integrate durable, non-living elements to define and enhance your property. Our skilled craftspeople excel in designing and building a wide array of features using high-quality materials like pavers, natural stone, and concrete. We can conceptualize and install stunning new patios for entertaining, functional retaining walls to manage slopes and add planting areas, and beautiful, safe walkways to connect different areas of your yard. Beyond basic structures, we also build custom outdoor kitchens, fire pits, and seating walls, creating personalized extensions of your indoor living space. These carefully constructed features add significant aesthetic appeal and lasting value to your home."
				/>
				<Callout
					variant="boxed grid"
					gridColumns={{left:3, right:1}}
					layout="horizontal"
					direction="right"
					// img="/images/stock/outside-view-restaurant-cottage-night-time.jpg"
					img="/images/stock/rooftop-sunset-city-view.jpg"
					title="Lighting"
					content="Enhance the beauty, safety, and functionality of your property after dusk with our professional Landscape Lighting services, designed to showcase your home’s best features while providing essential security. Our design team works closely with you to create a custom lighting plan that artfully highlights architectural elements, pathways, mature trees, and garden features, transforming your outdoor space into an inviting evening oasis. We exclusively install high-quality, energy-efficient LED systems that offer superior illumination, durability, and significant long-term energy savings compared to outdated halogen options. Whether you need subtle path lighting for safe navigation, powerful security floodlights, or dramatic accent lighting to enhance curb appeal, we manage the entire process from design and installation to ongoing maintenance and repairs. Let us illuminate your landscape, extending the enjoyment of your outdoor investment well into the night."
				/>
				<Callout
					variant="boxed grid"
					gridColumns={{left:1, right:3}}
					layout="horizontal"
					direction="left"
						img="/images/stock/automatic-sprinkler-lawn-watering-system-sprays-water-circle-lawn-summer-day.jpg"
					title="Irrigation"
					content="Effective and efficient water delivery is paramount to the health of your entire landscape, and our Irrigation services ensure every plant receives the precise amount of hydration it needs. Our certified technicians specialize in the design, installation, maintenance, and repair of custom irrigation systems, ranging from traditional sprinklers to modern, water-saving drip lines. We utilize the latest smart technology, including rain sensors and weather-based controllers, to optimize water usage, prevent overwatering, and ensure compliance with local water conservation guidelines. Regular system audits and seasonal winterization and startup services are included to maintain peak efficiency and protect your investment from damage. Trust us to manage your water needs responsibly, promoting a healthy landscape while saving you money on utility bills."
				/>
				<Callout
					variant="boxed grid"
					gridColumns={{left:3, right:1}}
					layout="horizontal"
					direction="right"
					img="/images/stock/asian-man-cutting-trees-using-electrical-chainsaw.jpg"
					title="Tree Services"
					content="Ensuring the safety, health, and beauty of your mature trees and large shrubs is the core focus of our professional Tree Services. Our team of certified arborists and trained professionals provides expert care that extends the life and vitality of your valuable woody plants. We offer strategic pruning and trimming services to remove dead or hazardous limbs, improve canopy structure, and enhance light penetration to your lawn below. When necessary, we perform safe and efficient tree and stump removal, handling all cleanup and debris hauling with the utmost care for your property. We also provide preventative maintenance, including health assessments and treatments for common diseases or pest infestations, ensuring the long-term integrity of the mature elements in your landscape."
				/>
			</PageSection>

		</>
	);
}
