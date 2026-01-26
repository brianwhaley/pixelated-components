"use client";

import React from "react";
import PropTypes, { InferProps } from "prop-types";
import { PageTitleHeader, PageSection } from "@pixelated-tech/components";
import { flattenRoutes } from "@pixelated-tech/components";
import routesData from '../../data/routes.json';
const routes = routesData.routes;

StyleGuideUI.propTypes = {
	routes: PropTypes.array,
};
export type StyleGuideUIType = InferProps<typeof StyleGuideUI.propTypes>;
export function StyleGuideUI(props: StyleGuideUIType) {

	const { routes } = props;

	let primaryHeaderFont = "N/A";
	let primaryBodyFont = "N/A";
	if (typeof document != 'undefined') {
		const headerFonts = getComputedStyle(document.documentElement).getPropertyValue("--header-font").trim();
		primaryHeaderFont = headerFonts.split(',')[0].replaceAll('"', '').replaceAll("'", '');
		const bodyFonts = getComputedStyle(document.documentElement).getPropertyValue("--body-font").trim();
		primaryBodyFont = bodyFonts.split(',')[0].replaceAll('"', '').replaceAll("'", '');
	}

	return (
		<>
			<PageTitleHeader title="Style Guide" />

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<h2>Color Palette</h2>
				<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
					<div style={{ backgroundColor: 'var(--primary-color)', color: '#fff' }} className="colorSwatch">Primary Color</div>
					<div style={{ backgroundColor: 'var(--secondary-color)' }} className="colorSwatch">Secondary Color</div>
					<div style={{ backgroundColor: 'var(--accent1-color)' }} className="colorSwatch">Accent 1 Color</div>
					<div style={{ backgroundColor: 'var(--accent2-color)' }} className="colorSwatch">Accent 2 Color</div>
					<div style={{ backgroundColor: 'var(--bg-color)' }} className="colorSwatch">Background Color</div>
					<div style={{ backgroundColor: 'var(--text-color)' }} className="colorSwatch">Text Color</div>
				</div>
			</PageSection>

			<style>{`
			.colorSwatch {
				color: #000; 
				border: 1px solid #ccc; 
				padding: 10px; 
				flex: 1 0 150px; 
				text-align: center;
				align-items: center;
				justify-content: center;
				display: flex;
			}
			`}</style>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="fonts-section">
				<h1>H1 - {primaryHeaderFont} font</h1>
				<h2>H2 - {primaryHeaderFont} font</h2>
				<h3>H3 - {primaryHeaderFont} font</h3>
				<h4>H4 - {primaryHeaderFont} font</h4>
				<h5>H5 - {primaryHeaderFont} font</h5>
				<h6>H6 - {primaryHeaderFont} font</h6>
				<p>{primaryBodyFont} font.  This is a paragraph of text to demonstrate the body font style. </p>
				<p>{primaryBodyFont} font.  The quick brown fox jumps over the lazy dog. </p>
				<p>{primaryBodyFont} font.  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="fonts-section">
				<h2>Information Architecture</h2>
				<ul>
					{ flattenRoutes(routes).map((r: any, index: number) => {
						return <li key={index}>{r.name} - {r.path}</li>;
					})}
				</ul>
			</PageSection>

		</>
	);
}
