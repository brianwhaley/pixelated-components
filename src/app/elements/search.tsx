"use client";

import React from "react";
import PropTypes from 'prop-types';
import { GoogleSearch as GSearch } from "@pixelated-tech/components";

interface SearchProps {
	id: string;
}

export default function Search(props: SearchProps) {
	return (
		<div className="section-container" suppressHydrationWarning>
			<GSearch id={props.id} />
		</div>
	);
}
Search.prototypes = {
	id: PropTypes.string.isRequired,
};