import React from 'react';
import { MenuAccordionButton, MenuAccordion } from '@/components/general/menu-accordion';
import { getAccordionMenuData } from "@/components/general/metadata.functions";
import '@/css/pixelated.global.css';
import myRoutes from '@/data/routes.json';
const allRoutes = myRoutes.routes;

// const menuItems = getAccordionMenuData(allRoutes);

export default {
	title: 'Menu',
	component: MenuAccordion
};

// Parent Component
const ParentAccordionMenu = () => {
	return (
	  	<>
			<div style={{ left: '10px', top:'10px' }} >
				<MenuAccordionButton />
			</div>
			<h2 className="pull-left text-outline">SiteName</h2>
			<div style={{ position: 'fixed', left: '10px', top:'100px' }}>
				<MenuAccordion menuItems={allRoutes} />
			</div>
		</>
	);
};

export const Accordion = () => <ParentAccordionMenu />;
Accordion.args = { menuItems: allRoutes};