'use client';

import React, { useState } from 'react';
import { SidePanel, MenuAccordion } from '@pixelated-tech/components';
import myroutes from '../data/routes.json';
const allRoutes = myroutes.routes;

export default function Nav() {
	const [isOpen, setIsOpen] = useState(false);
  	return (
		<SidePanel
			isOpen={isOpen}
			onClose={() => setIsOpen(false)}
			onToggle={() => setIsOpen(!isOpen)}
			position="left"
			width="300px"
			showOverlay={true}
			showTab={true}
			tabIcon="☰"
		>
        <MenuAccordion menuItems={allRoutes} />
    </SidePanel>
  );
}