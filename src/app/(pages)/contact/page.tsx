"use client";

import { PageHeader, PageSection, PageSectionHeader } from "@brianwhaley/pixelated-components";
import { FormEngine } from "@brianwhaley/pixelated-components";
import { emailFormData } from "@brianwhaley/pixelated-components";
import { Loading, ToggleLoading } from "@brianwhaley/pixelated-components";
import { Calendly } from "@/app/elements/calendly";
import formData from "@/app/data/contactform.json";

export default function Contact() {
    
    
	function handleSubmit(e: Event) {
		ToggleLoading({show: true});
		emailFormData(e, postSubmit);
	}

	function postSubmit(e: Event) {
		// alert("Thank you for contacting us! We will get back to you as soon as we can.");
		ToggleLoading({show: false});
		const myForm = e.target as HTMLFormElement;
		myForm.reset();
	}
	
	return (
		<>
			<Loading />

			<PageHeader title="Contact Oaktree Landscaping" />

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Contact Information" />
			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Schedule a Quote" />
				<div suppressHydrationWarning={true}>
					<Calendly 
						url="https://calendly.com/oaktreelandscaper/30min?background_color=f4f3ef&primary_color=19471b" 
						width="320px" 
						height="500px" 
					></Calendly>
				</div>
			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Request a Quote" />
				<FormEngine 
					name="newrequest" 
					id="newRequestForm" 
					formData={formData} 
					onSubmitHandler={handleSubmit} 
				/>
			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Customer Support" />
			</PageSection>

		</>
	);
}
