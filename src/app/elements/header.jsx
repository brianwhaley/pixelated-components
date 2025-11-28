"use client";

import React from 'react';
import { SmartImage } from "@brianwhaley/pixelated-components";

export default function Header() {
	return (
		<div>
			<div className="logo"><a href="/">
				<SmartImage 
					src="/images/informationfocus.png" 
					className="logo" alt="InformationFocus"
					aboveFold={true} />
				</a>
			</div>
			<div className="title">
				<a href="/">
					<h1>InformationFocus</h1>
				</a>
			</div>
			<div className="contactinfo">
				Mary Ann Sarao, Principal
				<br />
				maryann.sarao@gmail.com
			</div>
		</div>
	);
}
