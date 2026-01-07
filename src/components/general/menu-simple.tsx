'use client';

import React, { useEffect } from 'react';
import PropTypes, { InferProps } from "prop-types";
import './menu-simple.css';

const menuItemShape = PropTypes.shape({
	name: PropTypes.string.isRequired,
	path: PropTypes.string,
	target: PropTypes.string,
	hidden: PropTypes.bool,
	routes: PropTypes.array,
});

MenuSimple.propTypes = {
	menuItems: PropTypes.arrayOf(menuItemShape).isRequired,
};
export type MenuSimpleType = InferProps<typeof MenuSimple.propTypes>;
export function MenuSimple(props: MenuSimpleType) {
	function generateMenuItems() {
		const myItems = [];
		for (const itemKey in props.menuItems) {
			const myItem = props.menuItems[itemKey];
			if (!myItem) continue; // Skip null/undefined items
			if (myItem.routes) continue; // Skip nested routes
			myItems.push(<MenuSimpleItem
				key={itemKey}
				name={myItem.name}
				path={myItem.path || ''}
				target={myItem.target || undefined}
				hidden={myItem.hidden || undefined}
			/>);
		}
		return myItems;
	}
	function styleSelectedMenuItem() {
		if (typeof window === 'undefined') return;
		const menuitems = document.querySelectorAll('.menu-item a');
		const currentURL = window.location.href;
		menuitems.forEach( (menuitem) => {
			if ((menuitem as HTMLAnchorElement).href === currentURL) {
				menuitem.classList.add('selected');
			}
		});
	}
	useEffect(() => {
		styleSelectedMenuItem();
	}, []);
	return (
		<div className="menu-wrapper">
			{ /* <hr /> */ }
			<div className="menu" id="menu">
				<ul>{ generateMenuItems() }</ul>
			</div>
			{ /* <hr /> */}
		</div>
	);
}


/* ========== MENU ITEM ========== */

MenuSimpleItem.propTypes = {
	name: PropTypes.string.isRequired,
	path: PropTypes.string.isRequired,
	target: PropTypes.string,
	hidden: PropTypes.bool,
	routes: PropTypes.array,
};
export type MenuSimpleItemType = InferProps<typeof MenuSimpleItem.propTypes>;
export function MenuSimpleItem(props: MenuSimpleItemType) {
	const classNames = ['menu-item'];
	if (props.hidden) {
		classNames.push('menu-item-hidden');
	}

	return (
		<li className={classNames.join(' ')}>
			{props.target
				? <a href={props.path || undefined} target={props.target}>{props.name}</a>
				: <a href={props.path || undefined}>{props.name}</a>}
		</li>
	);
}
