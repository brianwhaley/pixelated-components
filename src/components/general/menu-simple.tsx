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

/**
 * MenuSimple — renders a simple flat navigation menu from an array of items.
 *
 * @param {arrayOf} [props.menuItems] - Array of menu item objects ({ name, path, target, hidden, routes }).
 */
MenuSimple.propTypes = {
/** Array of menu items to render (flat list). */
	menuItems: PropTypes.arrayOf(menuItemShape).isRequired,
};
export type MenuSimpleType = InferProps<typeof MenuSimple.propTypes>;
export function MenuSimple(props: MenuSimpleType) {
	function generateMenuItems() {
		const myItems = [];
		for (const itemKey in props.menuItems) {
			const myItem = props.menuItems[itemKey];
			if (!myItem) continue; // Skip null/undefined items
			// if (myItem.hidden) continue; // Skip nested routes
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

/**
 * MenuSimpleItem — Single entry for the flat `MenuSimple` menu.
 *
 * @param {string} [props.name] - Display text for the item.
 * @param {string} [props.path] - Destination href or path for the item.
 * @param {string} [props.target] - Optional link target (e.g., '_self' or '_blank').
 * @param {boolean} [props.hidden] - When true, the item is treated as hidden (applies CSS to hide it).
 * @param {array} [props.routes] - Optional nested routes (not used by `MenuSimpleItem` but accepted for compatibility).
 */
MenuSimpleItem.propTypes = {
/** Display text for the item */
	name: PropTypes.string.isRequired,
	/** Destination href or path */
	path: PropTypes.string.isRequired,
	/** Optional link target */
	target: PropTypes.string,
	/** When true, the item is hidden */
	hidden: PropTypes.bool,
	/** Optional nested routes (ignored by this renderer) */
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
