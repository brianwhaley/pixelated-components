'use client';

import { PageSection } from "@pixelated-tech/components";
import "./home.css";

export default function HomePage() {
	return (
		<PageSection maxWidth="1024px" columns={1}>
			<div className="home-page-wrapper">
				<div className="home-content-container">
					<h1 className="home-title">Welcome to Pixelated Admin</h1>
					<p className="home-subtitle">Use the menu button to navigate to different sections.</p>
				</div>
			</div>
		</PageSection>
	);
}
