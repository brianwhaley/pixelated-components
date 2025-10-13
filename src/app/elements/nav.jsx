import React, { } from 'react';
import { MenuSimple } from '@brianwhaley/pixelated-components';
// import '@brianwhaley/pixelated-components/dist/esm/components/menu/pixelated.menu-simple.css';
import myroutes from '../data/routes.json';
const allRoutes = myroutes.routes;
const menuItems = {};
allRoutes.forEach((route) => {
  menuItems[route.name] = route.path;
});

export default function Nav() {
  /* const menuItems = {
    Home: '/',
    Resume: '/resume',
  }; */

  return (
    <div>
      <MenuSimple menuItems={menuItems} ref={(myMenu) => { window.myMenu = myMenu; }} />
    </div>
  );
}
