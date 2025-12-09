"use client";

import React from "react";
import { PageTitleHeader } from "@pixelated-tech/components";
import { LinkedIn } from '@/app/components/pixelated.linkedin';

export default function Recommends() {
	return (
		<div className="section-container">
			<PageTitleHeader title="LinkedIn Recommendations" />
			<LinkedIn />
		</div>
	);
}
