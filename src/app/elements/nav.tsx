"use client";

import React from "react";
import { PageSection } from "@brianwhaley/pixelated-components";
import { MenuSimple } from "@brianwhaley/pixelated-components";
import myroutes from '../data/routes.json';
const allRoutes = myroutes.routes;

// const menuItems = getAccordionMenuData(allRoutes);

export default function Nav() {
	return (
		<>
		<PageSection maxWidth="100%" id="navigation-section" 
			columns={1} padding="0px" margin="0px">
			<MenuSimple menuItems={allRoutes} />
		</PageSection>
		</>
	);
}
