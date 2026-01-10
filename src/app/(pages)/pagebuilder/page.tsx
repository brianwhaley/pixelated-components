'use client';

import { PageBuilderUI, PageSection } from '@pixelated-tech/components';
import '../builder-pages.css';

export default function PageBuilderPage() {
	return (
		<PageSection maxWidth="1024px" columns={1}>
			<div className="builder-page-header">
				<h1>Page Builder</h1>
			</div>
			<div className="builder-page-container">
				<PageBuilderUI />
			</div>
		</PageSection>
	);
}