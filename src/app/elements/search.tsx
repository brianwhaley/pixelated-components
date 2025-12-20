"use client";

import React from "react";
import PropTypes from 'prop-types';
import { GoogleSearch as GSearch } from "@pixelated-tech/components";

export default function Search() {
	return (
		<div className="section-container" suppressHydrationWarning>
			<GSearch id="56d5332a6e6df4229"  />
		</div>
	);
}
Search.prototypes = {
	id: PropTypes.string.isRequired,
};