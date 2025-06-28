"use client";

import React, { useEffect, useState } from "react";
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
		<div className="section-container">
			<Markdown markdowndata={readmeText} />
		</div>
	);
}
