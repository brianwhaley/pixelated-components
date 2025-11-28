"use client";

import { MenuSimple } from '@brianwhaley/pixelated-components';
import myroutes from '../data/routes.json';
const allRoutes = myroutes.routes;

export default function Nav() {
  return (
    <div>
      <MenuSimple menuItems={allRoutes} ref={(myMenu) => { window.myMenu = myMenu; }} />
    </div>
  );
}
