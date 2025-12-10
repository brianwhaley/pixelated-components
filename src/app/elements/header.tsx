"use client";

import { PageSection } from "@pixelated-tech/components";
import { SmartImage } from "@pixelated-tech/components";
import { MenuAccordion, MenuAccordionButton } from "@pixelated-tech/components";
import myroutes from '../data/routes.json';
const allRoutes = myroutes.routes;

export default function Header() {
    
	return (
		<>
			<MenuAccordionButton />
			<MenuAccordion menuItems={allRoutes} />
			<PageSection columns={1} id="header-section">
				<SmartImage
					id="logo"
					src="/images/logo/oaktree-logo-horizontal.png"
					alt="Oaktree Landscaping"
					width={3500}
					height={811}
				/>
			</PageSection>
		</>
	);
}
