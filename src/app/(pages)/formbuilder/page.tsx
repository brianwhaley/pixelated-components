'use client';

import { FormBuilder, PageSection } from '@pixelated-tech/components';
import '../builder-pages.css';

export default function FormBuilderPage() {
	return (
		<PageSection maxWidth="1024px" columns={1}>
			<div className="builder-page-header">
				<h1>Form Builder</h1>
			</div>
			<div className="builder-page-container">
				<FormBuilder />
			</div>
		</PageSection>
	);
}