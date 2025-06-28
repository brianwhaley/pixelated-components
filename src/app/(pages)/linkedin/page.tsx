"use client";

import React from "react";
import { PageHeader } from "@/app/components/general/pixelated.general";
import { LinkedIn } from '@/app/components/linkedin/pixelated.linkedin';

export default function Recommends() {
	return (
		<div className="section-container">
			<PageHeader title="LinkedIn Recommendations" />
			<LinkedIn />
		</div>
	);
}
