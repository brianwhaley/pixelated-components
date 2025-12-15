"use client";

import React from "react";
import { PageSection } from "@pixelated-tech/components";
import { GoogleAnalytics } from "@pixelated-tech/components";
// import { GoogleAnalytics } from '@next/third-parties/google';


export default function Footer() {
	return (
		<PageSection columns={1} padding="20px 0 0 0">
			<div suppressHydrationWarning={true} >
				<GoogleAnalytics id="G-S4FFGHP3ZN" />
				<hr style={{ margin: "0 auto", width: "80%" }} />
				<br />
				<div className="centered">
					<p className="footer-text">&copy; {new Date().getFullYear()} Oaktree Landscaping. All rights reserved.</p>
				</div>
			</div>
		</PageSection>
	);
}
