import React from 'react';
import { MenuExpando } from '@/components/general/menu-expando';
import '@/css/pixelated.global.css';
import myRoutes from '@/data/routes.json';
const allRoutes = myRoutes.routes;

export default {
	title: 'General',
	component: MenuExpando
};

const MenuExpandoStory = () => {
	return (
		<div style={{ position: 'relative', height: '500px', border: '1px solid #ccc', padding: '20px' }}>
			<MenuExpando menuItems={allRoutes} />
		</div>
	);
};

export const Menu_Expando = MenuExpandoStory;
