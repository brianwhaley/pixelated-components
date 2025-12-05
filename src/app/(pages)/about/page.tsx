"use client";

import { PageHeader, PageSection, PageSectionHeader } from "@pixelated-tech/components";

export default function About() {
    
	return (
		<>

			<PageHeader title="About Oaktree Landscaping" />

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Our Team" />
			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Our History" />
			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Testimonials" />
			</PageSection>

		</>
	);
}
