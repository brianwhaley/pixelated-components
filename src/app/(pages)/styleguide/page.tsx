"use client";

import { PageHeader, PageSection } from "@brianwhaley/pixelated-components";

export default function Home() {
    
	return (
		<>

			<PageHeader title="Style Guide - Oaktree Landscaping" />

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="colors-section">
				<h2>Color Palette</h2>
				<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
					<div style={{ backgroundColor: 'var(--primary-color)', color: '#fff', padding: '10px', flex: '1 0 150px', textAlign: 'center' }}>Primary Color</div>
					<div style={{ backgroundColor: 'var(--secondary-color)', color: '#000', padding: '10px', flex: '1 0 150px', textAlign: 'center' }}>Secondary Color</div>
					<div style={{ backgroundColor: 'var(--accent1-color)', color: '#000', padding: '10px', flex: '1 0 150px', textAlign: 'center' }}>Accent 1 Color</div>
					<div style={{ backgroundColor: 'var(--accent2-color)', color: '#000', padding: '10px', flex: '1 0 150px', textAlign: 'center' }}>Accent 2 Color</div>
					<div style={{ backgroundColor: 'var(--bg-color)', color: '#000', padding: '10px', flex: '1 0 150px', textAlign: 'center' }}>Background Color</div>
					<div style={{ backgroundColor: 'var(--text-color)', color: '#FFF', padding: '10px', flex: '1 0 150px', textAlign: 'center' }}>Text Color</div>
				</div>

				<h3>Primary Color: Live Oak Deep Green</h3>
				<p>Usage: Logos, heavy headers, footer backgrounds. Represents stability and year-round health.</p>

				<h3>Secondary Color: Spanish Moss</h3>
				<p>Usage: Sub-headers, icons, secondary buttons. A soft, gray-green that evokes the SC coastline.</p>

				<h3>Accent 1: Lowcountry Brick</h3>
				<p>Usage: Call-to-action buttons (CTAs), highlights. Represents the hardscaping/masonry focus (red clay and historic brick).</p>

				<h3>Accent 2: Marsh Grass Gold</h3>
				<p>Usage: Thin lines, borders, premium badges. Adds the &#39;High-End&#39; luxury feel without being shiny gold.</p>

				<h3>Background: Oyster Shell White</h3>
				<p>Usage: Main page backgrounds. Not a sterile clinical white; a warm, natural cream.</p>

				<h3>Text Color: Wrought Iron</h3>
				<p>Usage: All body text. Softer than pure black for better readability.</p>

			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="fonts-section">
				<h1>H1 - Playfair Display Font</h1>
				<h2>H2 - Playfair Display Font</h2>
				<h3>H3 - Playfair Display Font</h3>
				<h4>H4 - Playfair Display Font - for Headings.  A high-contrast serif font. It feels editorial, expensive, and classic.</h4>
				<h5>H5 - Playfair Display Font - for Headings.  A high-contrast serif font. It feels editorial, expensive, and classic.</h5>
				<h6>H6 - Playfair Display Font - for Headings.  A high-contrast serif font. It feels editorial, expensive, and classic.</h6>
				<br />
				<p>Body Text - Lato Font</p>
				<p>A clean, geometric sans-serif.  It is easy to read on mobile and looks professional and corporate. </p>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt 
				ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
				ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
				reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
				Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt 
				mollit anim id est laborum.</p>
			</PageSection>

			<PageSection columns={1} maxWidth="1024px" padding="20px" id="fonts-section">
				<h2>Information Architecture</h2>
				<ul>
					<li>Home
						<ul>
							<li>Hero</li>
							<li>Our Mission</li>
							<li>Services</li>
							<li>Service Area</li>
						</ul>
					</li>
					<li>About Us
						<ul>
							<li>Our Team</li>
							<li>Our History</li>
							<li>Testimonials</li>
						</ul>
					</li>
					<li>Commercial
						<ul>
							<li>Lawn Care</li>
							<li>Garden Care</li>
							<li>Irrigation</li>
							<li>Hardscaping</li>
							<li>Tree Services</li>
						</ul>
					</li>
					<li>Residential
						<ul>
							<li>Lawn Care</li>
							<li>Garden Care</li>
							<li>Irrigation</li>
							<li>Hardscaping</li>
							<li>Tree Services</li>
						</ul>
					</li>
					<li>Our Projects</li>
					<li>Blog
						<ul>
							<li>Landscaping Tips</li>
							<li>Seasonal Advice</li>
							<li>Industry News</li>
							<li>DIY Guides</li>
							<li>Community Service</li>
							<li>Company News</li>
						</ul>
					</li>
					<li>Contact Us
						<ul>
							<li>Request a Quote</li>
							<li>Schedule a Quote</li>
							<li>Customer Support</li>
							<li>Email and Phone</li>
						</ul>
					</li>
				</ul>
			</PageSection>

		</>
	);
}
