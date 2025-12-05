"use client";

import React from "react";
import { PageHeader } from "@pixelated-tech/components";
import { LinkedIn } from '@/app/components/pixelated.linkedin';

export default function Recommends() {
	return (
		<div className="section-container">
			<PageHeader title="LinkedIn Recommendations" />
			<LinkedIn />
		</div>
	);
}
