"use client";

import React from "react";

// import { MenuAccordionButton } from "../components/menu/pixelated.menu-accordion";
import { MenuAccordionButton } from "@brianwhaley/pixelated-components";
import { CartButton } from "@brianwhaley/pixelated-components";

export default function Header() {
	return (
		<div className="section-container">
			<MenuAccordionButton />
			<h2 className="pull-left pad">Brian Whaley</h2>
			<div className="right">
				<CartButton href={'/cart'} />
			</div>
		</div>
	);
}
