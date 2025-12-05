"use client";

import { PageHeader, PageSection, PageSectionHeader } from "@pixelated-tech/components";

export default function About() {
    
	return (
		<>

			<PageHeader title="Oaktree Residential Services" />

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Lawn Care" />
			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Garden Care" />
			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Irrigation" />
			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Hardscaping" />
			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Tree Services" />
			</PageSection>

		</>
	);
}
