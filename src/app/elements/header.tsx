"use client";

import React from "react";

// import { MenuAccordionButton } from "../components/menu/pixelated.menu-accordion";
import { MenuAccordionButton } from "@brianwhaley/pixelated-components";

export default function Header() {
	return (
		<div className="section-container">
			<MenuAccordionButton />
			<h2 className="pull-left pad textHalo">Brian Whaley</h2>
		</div>
	);
}
