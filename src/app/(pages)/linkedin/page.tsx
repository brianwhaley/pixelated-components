"use client";

import React from "react";
import { PageHeader } from "@brianwhaley/pixelated-components";
import { LinkedIn } from '@/app/components/linkedin/pixelated.linkedin';

export default function Recommends() {
	return (
		<div className="section-container">
			<PageHeader title="LinkedIn Recommendations" />
			<LinkedIn />
		</div>
	);
}
