"use client";

import React from "react";
import { MenuAccordion } from "@brianwhaley/pixelated-components";
import { getAccordionMenuData } from "../components/metadata/pixelated.metadata";
import myroutes from '../data/routes.json';
const allRoutes = myroutes.routes;

const menuItems = getAccordionMenuData(allRoutes);

export default function Nav() {
	return (
		<MenuAccordion menuItems={menuItems} />
	);
}
