"use client";

import { PageSection, PageGridItem, PageSectionHeader } from "@pixelated-tech/components";
import { Callout } from "@pixelated-tech/components";

export default function Home() {
    
	return (
		<>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="home-section">
				<Callout 
					variant="split"
					direction="left"
					// img="https://www.bednarlandscape.com/wp-content/uploads/2023/12/bednar-portfolio-07.jpg"
					img="/images/stock/natural-grass-close-up.jpg"
					title="Welcome to Oaktree Landscaping"
					subtitle="Outstanding Landscapes and Breathtaking Results"
					content="With over 7 years of experience in the landscape industry, 
					our company has become a trusted name in creating exquisite 
					landscapes and maintaining lush lawns in the local area
					for both Residential and Commercial properties.  
					We take immense pride in our work, and our dedication to 
					excellence is evident in every project we undertake. 
					At our company, we understand that every customer is unique, 
					with their own distinct vision and preferences. 
					That's why we go above and beyond to tailor the 
					individual needs and desires of each client. 
					From stunning flower beds, serene water features to 
					corporate site maintenance we pay meticulous attention to 
					detail to ensure that every element of the landscape skills 
					reflects the customer's personal style and preferences." 
				/>
			</PageSection>

			<PageSection columns={3} id="services-section" 
				maxWidth="100%" padding="5%" gap="5%" 
				background="var(--accent1-color)">
				<PageGridItem columnStart={1} columnEnd={-1}>
					<PageSectionHeader title="Commercial & Residential Services" />
				</PageGridItem>
				<PageGridItem>
					<Callout 
						variant="overlay"
						url="/services#callout-lawn-care"
						// img="https://media.istockphoto.com/id/2044312647/photo/professional-latino-man-using-a-riding-lawnmower-caring-for-a-park-with-a-landscaping-company.jpg?b=1&s=612x612&w=0&k=20&c=n_n3hcmZ1U3SHzwlZX-7wGElqZggxGFuVuDV7i_V9-k="
						img="/images/stock/pexels-luis-negron-260501657-13630739.jpg"
						title="Lawn Care"
						buttonText="View"
					/>
				</PageGridItem>
				<PageGridItem>
					<Callout 
						variant="overlay"
						url="/services#callout-garden-care"
						// img="https://media.istockphoto.com/id/1324918160/photo/professional-gardener-trimming-hedge.jpg?b=1&s=612x612&w=0&k=20&c=PyPsxSuD3XFWk8eAmFj2I7JFxDjsS1w4AJZICRFBQ_8="
						// img="/images/stock/pexels-shvetsa-5027602.jpg"
						img="/images/stock/worker-cutting-bush-with-hedge-shears-outdoors-closeup-gardening-tool.jpg"
						title="Garden Care"
						buttonText="View"
					/>
				</PageGridItem>
				<PageGridItem>
					<Callout 
						variant="overlay"
						url="/services#callout-hardscape"
						// img="https://www.bednarlandscape.com/wp-content/uploads/2023/12/bednar-portfolio-07.jpg"
						img="/images/stock/natural-grass-close-up.jpg"
						title="Hardscape"
						buttonText="View"
					/>
				</PageGridItem>
				<PageGridItem>
					<Callout 
						variant="overlay"
						url="/services#callout-lighting"
						// img="https://media.istockphoto.com/id/157479391/photo/evening-sidewalk.webp?a=1&b=1&s=612x612&w=0&k=20&c=hhEwI_ou_3OUHtnMD7uPvp_G2mnsE9KzIzrcT2c8b_g="
						// img="/images/stock/outside-view-restaurant-cottage-night-time.jpg"
						img="/images/stock/rooftop-sunset-city-view.jpg"
						title="Lighting"
						buttonText="View"
					/>
				</PageGridItem>
				<PageGridItem>
					<Callout 
						variant="overlay"
						url="/services#callout-irrigation"
						// img="https://media.istockphoto.com/id/1336134773/photo/nozzle-automatic-lawn-watering-macro-close-up.webp?a=1&b=1&s=612x612&w=0&k=20&c=-486z3g7B7ANj9mJNdODqiSY20brS4qadCVTq005NwM="
						img="/images/stock/automatic-sprinkler-lawn-watering-system-sprays-water-circle-lawn-summer-day.jpg"
						title="Irrigation"
						buttonText="View"
					/>
				</PageGridItem>
				<PageGridItem>
					<Callout 
						variant="overlay"
						url="/services#callout-tree-services"
						// img="https://media.istockphoto.com/id/457790295/photo/tree-service-arborist-pruning-trimming-cutting-diseased-branches-with-chainsaw.jpg?s=612x612&w=0&k=20&c=0prSggo7LM7guW7-X3NDj8xq_eRqz6kA0MofEefTuK8="
						img="/images/stock/asian-man-cutting-trees-using-electrical-chainsaw.jpg"
						title="Tree Services"
						buttonText="View"
					/>
				</PageGridItem>
			</PageSection>


			<PageSection maxWidth="1024px" id="service-area-section" columns={1}>
					<div className="row-3col">
						<div className="gridItem" style={{ textAlign: 'center' }}>
							<h3>Location</h3>
							<div>Oaktree Landscaping</div>
							<div>123 William Hilton Parkway</div>
							<div>Hilton Head Island, SC 29930</div>
							<h3>Contact Us</h3>
							<div>Phone: (843) 785-3673 </div>
							<div>Email: oaktreelandscaper@gmail.com</div>
						</div>

						<div className="gridItem">
							<iframe 
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d78716.94846046132!2d-80.80423213107764!3d32.19532746066251!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88fc772555555555%3A0x62e1985f256e5c96!2sCoastal%20Discovery%20Museum!5e0!3m2!1sen!2sus!4v1764299846597!5m2!1sen!2sus" 
								width="100%" 
								height="300" 
								style={{ border: 0 }} 
								allowFullScreen
								loading="lazy" 
								referrerPolicy="no-referrer-when-downgrade">
							</iframe>
						</div>
						
						<div className="gridItem"  style={{ textAlign: 'center' }}>
							<h3>Hours</h3>
							<div>Mon: 7AM - 5PM</div>
							<div>Tue: 7AM - 5PM</div>
							<div>Wed: 7AM - 5PM</div>
							<div>Thu: 7AM - 5PM</div>
							<div>Fri: 7AM - 5PM</div>
							<div>Sat: 7AM - 5PM</div>
							<div>Sun: CLOSED</div>
						</div>

					</div>
				</PageSection>

		</>
	);
}
