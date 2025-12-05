"use client";

import React from "react";
import { PageSection } from "@brianwhaley/pixelated-components";
import { GoogleAnalytics, GoogleAnalyticsEvent } from "@brianwhaley/pixelated-components";
// import { GoogleAnalytics } from '@next/third-parties/google';


export default function Footer() {
	return (
		<PageSection columns={1} padding="20px 0 0 0">
			<div suppressHydrationWarning={true} >
				<GoogleAnalytics id="G-1J1W90VBE1" />
				<GoogleAnalytics id="AW-17721931789" />
				<GoogleAnalyticsEvent event_name="conversion" 
					event_parameters={{ 
						send_to: "AW-17721931789/qOjmCM77-74bEI3wvIJC", 
						value: 1.0, 
						currency: "USD" 
					}} 
				/>
				{ /* <GoogleAnalytics gaId="G-1J1W90VBE1" /> */ }
				<hr style={{ margin: "0 auto", width: "80%" }} />
				<br />
				<div className="centered">
					<p className="footer-text">&copy; {new Date().getFullYear()} Oaktree Landscaping. All rights reserved.</p>
				</div>
			</div>
		</PageSection>
	);
}
