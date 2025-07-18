import React from 'react';
import { MenuAccordionButton, MenuAccordion } from '../components/menu/pixelated.menu-accordion';
import { getAccordionMenuData } from "../components/metadata/pixelated.metadata";
import '../components/menu/pixelated.menu-accordion.css';
import '../css/pixelated.global.css';
import myRoutes from '../data/routes.json';
const allRoutes = myRoutes.routes;

const menuItems = getAccordionMenuData(allRoutes);

export default {
	title: 'Menu - Accordion',
	component: MenuAccordion
};

// Parent Component
const ParentAccordionMenu = () => {
	return (
	  	<>
			<div style={{ left: '10px', top:'10px' }} >
				<MenuAccordionButton />
			</div>
			<h2 className="pull-left pad textOutline">SiteName</h2>
			<div style={{ position: 'fixed', left: '10px', top:'100px' }}>
				<MenuAccordion menuItems={menuItems} />
			</div>
		</>
	);
};

export const Primary = () => <ParentAccordionMenu />;
Primary.args = { menuItems: menuItems};