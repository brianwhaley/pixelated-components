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
		<PageSection columns={1} maxWidth="100%" id="navigation-section" >
			<MenuSimple menuItems={allRoutes} />
		</PageSection>
		</>
	);
}
