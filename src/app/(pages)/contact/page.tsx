/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { PageTitleHeader, PageSection, PageSectionHeader } from "@pixelated-tech/components";
import { FormEngine } from "@pixelated-tech/components";
import { emailFormData } from "@pixelated-tech/components";
import { Loading, ToggleLoading } from "@pixelated-tech/components";
import { Modal, handleModalOpen } from "@pixelated-tech/components";
import { Calendly } from "@pixelated-tech/components";
import formData from "@/app/data/contactform.json";

export default function Contact() {

	const myContent = <div className="centered"><br /><br />Thank you for contacting us!<br />We will get back to you as soon as we can.<br /><br /><br /></div>;

    const [modalContent /*, setModalContent */ ] = useState<React.ReactNode>(myContent);
	
	function handleSubmit(e: Event) {
		ToggleLoading({show: true});
		emailFormData(e, postSubmit);
	}

	function postSubmit(e: Event) {
		handleModalOpen(e as MouseEvent);
		ToggleLoading({show: false});
		const myForm = e.target as HTMLFormElement;
		myForm.reset();
	}
	
	return (
		<>
			<Loading />
			<Modal modalContent={modalContent} />

			<PageTitleHeader title="Contact Oaktree Landscaping" />

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="schedule-quote-section">
				<PageSectionHeader title="Schedule a Quote" />
				<div suppressHydrationWarning={true}>
					<Calendly 
						url="https://calendly.com/oaktreelandscaper/30min?background_color=f4f3ef&primary_color=19471b" 
						width="320px" 
						height="800px" 
					></Calendly>
				</div>
			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="contact-us-section">
				<PageSectionHeader title="Contact Us" />
				<div style={{ margin: '0 auto', border: '2px solid var(--accent1-color)', padding: '20px', borderRadius: '20px' }}>
					<FormEngine 
						name="contact-us" 
						id="contact-us-form" 
						formData={formData as any} 
						onSubmitHandler={handleSubmit} 
					/>
				</div>
			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="contact-info-section">
				<PageSectionHeader title="Contact Information" />
				<div style={{ margin: '0 auto' }}>
					<h3>Address:</h3>
					<p>1234 Oak Street, Hilton Head Island, South Carolina 20030</p>
					<h3>Email:</h3>
					<p><a href="mailto:oaktreelandscaper@gmail.com">oaktreelandscaper@gmail.com</a></p>
					<h3>Phone:</h3>
					<p>(843) 123-4567</p>
				</div>
			</PageSection>

		</>
	);
}
