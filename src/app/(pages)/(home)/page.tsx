"use client";

import { PageSection, GridItem, PageSectionHeader } from "@brianwhaley/pixelated-components";
import { Callout } from "@brianwhaley/pixelated-components";

export default function Home() {
    
	return (
		<>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="home-section">
				<Callout 
					variant="split"
					direction="left"
					img="https://www.bednarlandscape.com/wp-content/uploads/2023/12/bednar-portfolio-07.jpg"
					title="Welcome to Oak Tree Landscaping"
					subtitle="Outstanding Landscapes and Breathtaking Results"
					content="With over 25 years of experience in the landscape industry, 
					our company has become a trusted name in creating exquisite 
					landscapes and maintaining lush lawns in the local area. 
					We take immense pride in our work, and our dedication to excellence 
					is evident in every project we undertake. At our company, 
					we understand that every customer is unique, 
					with their own distinct vision and preferences. 
					That's why we go above and beyond to design vibrant landscapes 
					that are tailored to meet the individual needs and desires of each client. 
					From stunning flower beds to serene water features, 
					we pay meticulous attention to detail to ensure that every element 
					of the landscape reflects the customer's personal style." 
				/>
			</PageSection>

			<PageSection columns={3} id="services-section" 
				maxWidth="100%" padding="5%" gap="5%" 
				background="var(--accent1-color)">
				<GridItem columnStart={1} columnEnd={-1}>
					<PageSectionHeader title="Commercial & Residential Services" />
				</GridItem>
				<GridItem>
					<Callout 
						variant="overlay"
						img="https://media.istockphoto.com/id/2044312647/photo/professional-latino-man-using-a-riding-lawnmower-caring-for-a-park-with-a-landscaping-company.jpg?b=1&s=612x612&w=0&k=20&c=n_n3hcmZ1U3SHzwlZX-7wGElqZggxGFuVuDV7i_V9-k="
						title="Lawn Care"
					/>
				</GridItem>
				<GridItem>
					<Callout 
						variant="overlay"
						img="https://media.istockphoto.com/id/1324918160/photo/professional-gardener-trimming-hedge.jpg?b=1&s=612x612&w=0&k=20&c=PyPsxSuD3XFWk8eAmFj2I7JFxDjsS1w4AJZICRFBQ_8="
						title="Garden Care"
					/>
				</GridItem>
				<GridItem>
					<Callout 
						variant="overlay"
						img="https://www.bednarlandscape.com/wp-content/uploads/2023/12/bednar-portfolio-07.jpg"
						title="Hardscape"
					/>
				</GridItem>
				<GridItem>
					<Callout 
						variant="overlay"
						img="https://media.istockphoto.com/id/157479391/photo/evening-sidewalk.webp?a=1&b=1&s=612x612&w=0&k=20&c=hhEwI_ou_3OUHtnMD7uPvp_G2mnsE9KzIzrcT2c8b_g="
						title="Lighting"
					/>
				</GridItem>
				<GridItem>
					<Callout 
						variant="overlay"
						img="https://media.istockphoto.com/id/1336134773/photo/nozzle-automatic-lawn-watering-macro-close-up.webp?a=1&b=1&s=612x612&w=0&k=20&c=-486z3g7B7ANj9mJNdODqiSY20brS4qadCVTq005NwM="
						title="Irrigation"
					/>
				</GridItem>
				<GridItem>
					<Callout 
						variant="overlay"
						img="https://media.istockphoto.com/id/457790295/photo/tree-service-arborist-pruning-trimming-cutting-diseased-branches-with-chainsaw.jpg?s=612x612&w=0&k=20&c=0prSggo7LM7guW7-X3NDj8xq_eRqz6kA0MofEefTuK8="
						title="Tree Services"
					/>
				</GridItem>
			</PageSection>


			<PageSection maxWidth="1024px" id="service-area-section" columns={1}>
					<div className="row-3col">
						<div className="gridItem" style={{ textAlign: 'center' }}>
							<h3>Location</h3>
							<div>Oak Tree Landscaping</div>
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
