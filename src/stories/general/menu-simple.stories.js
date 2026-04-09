import { MenuSimple } from '@/components/general/menu-simple';
import myRoutes from '@/data/routes2.json';
const allRoutes = myRoutes.routes;
import '@/css/pixelated.global.css';

export default {
	title: 'General',
	component: MenuSimple
};

export const Menu_Simple = {
	args: {
		menuItems: allRoutes
	}
};
