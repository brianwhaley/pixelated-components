"use client";

import React from "react";
import { GoogleAnalytics } from "@pixelated-tech/components";
// import { GoogleAnalytics } from '@next/third-parties/google';


export default function Footer() {
	return (
		<div className="section-container" suppressHydrationWarning={true} >
			
			<GoogleAnalytics id="G-K5QDEDTRB4" />
			{ /* <GoogleAnalytics gaId="G-1J1W90VBE1" /> */ }
			
			<hr style={{ margin: "0 auto", width: "80%" }} />
			<br />
			<div className="centered">
				<p className="footer-text">&copy; {new Date().getFullYear()} Brian T. Whaley. All rights reserved.</p>
			</div>
			<br /><br />

		</div>
	);
}
