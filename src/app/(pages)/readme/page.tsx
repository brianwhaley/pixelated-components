"use client";

import React, { useEffect, useState } from "react";
import { PageSection } from "@brianwhaley/pixelated-components";
import { Markdown } from "@brianwhaley/pixelated-components";
const filePath = '/data/readme.md';

export default function Readme() {
	const [readmeText, setReadmeText] = useState('');
	useEffect(() => {
		const fetchMarkdown = async () => { 
			const response = await fetch(filePath);
			const markdownText = await response.text();
			setReadmeText(markdownText);
		};
		fetchMarkdown();
	}, []); 
	return (
		<PageSection columns={1} id="markdown-container">
			<Markdown markdowndata={readmeText} />
		</PageSection>
	);
}
