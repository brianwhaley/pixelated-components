"use client";

import { PageHeader, PageSection, PageSectionHeader } from "@brianwhaley/pixelated-components";

export default function About() {
    
	return (
		<>

			<PageHeader title="Oaktree Projects" />

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<PageSectionHeader title="Our Projects" />
			</PageSection>

		</>
	);
}
