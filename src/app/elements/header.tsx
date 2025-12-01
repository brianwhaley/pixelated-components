"use client";

import { PageSection } from "@brianwhaley/pixelated-components";
import { SmartImage } from "@brianwhaley/pixelated-components";
import { MenuAccordion, MenuAccordionButton } from "@brianwhaley/pixelated-components";
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
					src="/images/oaktree-horizontal.png"
					alt="Oak Tree Landscaping"
					width={1462}
					height={424}
				/>
			</PageSection>
		</>
	);
}
