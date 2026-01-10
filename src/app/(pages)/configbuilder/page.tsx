'use client';

import { ConfigBuilder, PageSection } from '@pixelated-tech/components';
import '../builder-pages.css';

// Function to download JSON file
const downloadJsonFile = (data: any, filename: string) => {
	const jsonString = JSON.stringify(data, null, 2);
	const blob = new Blob([jsonString], { type: 'application/json' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
};

export default function ConfigBuilderPage() {
	const handleSave = (config: any) => {
		downloadJsonFile(config, 'routes.json');
	};

	return (
		<PageSection maxWidth="1024px" columns={1}>
			<div className="builder-page-header">
				<h1>Config Builder</h1>
			</div>
			<div className="builder-page-container">
				<ConfigBuilder onSave={handleSave} />
			</div>
		</PageSection>
	);
}