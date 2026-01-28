'use client';

import React, { useEffect, useRef } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import './menu-accordion.css';

const hamburgerIcon = "≡"; /* (U+2261) */ /* ||| */

declare global {
	interface Window {
		moveMenu: () => void;
	}
}

const menuItemShape = PropTypes.shape({
	name: PropTypes.string.isRequired,
	path: PropTypes.string,
	target: PropTypes.string,
	routes: PropTypes.array, // Will be refined after function declaration
	hidden: PropTypes.bool,
});

export type MenuItem = MenuAccordionType['menuItems'][0];

// Update the recursive reference after the shape is defined
(menuItemShape as any).routes = PropTypes.arrayOf(menuItemShape);

function generateMenuItems({menuData, state = "hide"}: {menuData: { [x: string]: any; }, state: string}) {
	const myItems: React.ReactNode[] = [];
	let index = 0;
	for (const itemKey in menuData) {
		const myItem = menuData[itemKey];
		const safeName = (myItem && myItem.name) ? String(myItem.name).replace(/\s+/g, '_') : 'item';
		const keyBase = `${safeName}-${itemKey}-${index}`;
		// if ( typeof myItem === 'object' && myItem !== null ){
		if (!myItem.hidden) {
			// ITEM OR GROUP IS NOT HIDDEN
			if ( typeof myItem === 'object' && myItem.routes ) {
				// MENU GROUP - push the toggle and the nested group separately with unique keys
				myItems.push(
					<MenuAccordionItem key={`${keyBase}-parent`} name={"▶ " + myItem.name} href={''} />,
					<MenuAccordionGroup key={`${keyBase}-group`} menuItems={myItem} state={state} />
				);
			} else {
				// INDIVIDUAL MENU ITEM
				myItems.push(
					<MenuAccordionItem key={`${keyBase}-item`} name={myItem.name} href={myItem.path} target={myItem.target} />
				);
			}
		}
		index++;
	}
	return myItems;
}

/**
 * MenuAccordion — Accordion-style navigational menu that supports nested menu groups and individual items.
 *
 * @param {arrayOf} [props.menuItems] - Array (or object) of menu items; items should include { name, path?, target?, hidden?, routes? }.
 * @param {boolean} [props.showHidden] - When true, items marked as `hidden` will be shown.
 */
MenuAccordion.propTypes = {
/** Array of menu items (can contain nested `routes`) */
	menuItems: PropTypes.arrayOf(menuItemShape).isRequired,
	/** Show items marked `hidden` */
	showHidden: PropTypes.bool,
};
export type MenuAccordionType = InferProps<typeof MenuAccordion.propTypes>;
export function MenuAccordion(props: MenuAccordionType) {
	const debug = false;
	const left = useRef(-250);
	function setLeft(leftVal: number) { left.current = leftVal; };
	const documentRef = useRef<Document | null>(null);
	// const [ menuItems, setMenuItems ] = useState();

	
	// only works for 2 layers deep
	const menuItems = props.menuItems.map((menuItem: any) => {
		// MAIN MENU ITEMS
		if (props.showHidden === true && menuItem.hidden === true) {
			delete menuItem.hidden;
		}
		// SUB MENU ITEMS
		if (menuItem.routes ) {
			const subMenuItems = menuItem.routes.map((subMenuItem: any) => {
				if (props.showHidden === true && subMenuItem.hidden === true) {
					delete subMenuItem.hidden;
				}
				return subMenuItem;
			});
			return { ...menuItem,  routes: subMenuItems  };
		}
		return menuItem;
	});
	
	function moveMenu() {
		if (debug) console.log("Moving Menu... Left: ", left);
		const menu = documentRef.current ? documentRef.current.getElementById('accordionMenu') : null;
		const menuParent = menu ? menu.parentElement : null;
		if (left.current === 0) { 
			if (debug) console.log("Moving Menu Out");
			menuParent?.classList.remove('accordionDown'); /* accordionIn */
			menuParent?.classList.add('accordionUp'); /* accordionOut */
			setLeft( -250 ); 
		} else { 
			if (debug) console.log("Moving Menu In");
			menuParent?.classList.remove('accordionUp'); /* accordionOut */
			menuParent?.classList.add('accordionDown'); /* accordionIn */
			setLeft( 0 ); 
		}
	};

	function expandMenuItem(clickedItem: Element) {
		if (debug) console.log("Expanding Menu Item...");
		const parent = clickedItem.parentElement;
		const subMenu = parent?.nextElementSibling;
		if (subMenu && subMenu.classList.contains('menuHide')) { 
			if (debug) console.log("Opening Submenu");
			subMenu.classList.add('menuShow'); 
			subMenu.classList.remove('menuHide'); 
		} else { 
			if (debug) console.log("Closing Submenu");
			if (subMenu) subMenu.classList.add('menuHide'); 
			if (subMenu) subMenu.classList.remove('menuShow'); 
		}
		
	}
	
	useEffect(() => {
		window.moveMenu = moveMenu; // attach moveMenu function to the window object for use in MenuAccordionButton
		documentRef.current = document; // for moveMenu
		const menu = document.getElementById('accordionMenu');
		const menuBtn = document.getElementById('panelMenuButton');
		function handleMenuClick(event: MouseEvent) {
			if (debug) console.log("event : ", event, "target : ", event.target);
			// const isClicked = (menu.contains(event.target) || menuBtn.contains(event.target));
			const isMenuClicked = menu?.contains(event.target as Element);
			const isMenuBtnClicked = menuBtn?.contains(event.target as Element);
			if (debug) console.log("isMenuBtnClicked : ", isMenuBtnClicked);
			if (isMenuClicked) {
				// MENU ITEM CLICKED
				const target = event.target as HTMLAnchorElement;
				if ( !(target.href) || !(target.href.length > 0)) {
					// NO HREF - EXPAND / COLLAPSE SUB MENU
					// event.preventDefault();
					event.stopPropagation();
					expandMenuItem(target);
				} else {
					// HREF - NAVIGATE
				}
			} else if (isMenuBtnClicked) {
				// MENU BUTTON CLICKED
				// event.preventDefault();
				event.stopPropagation();
				moveMenu();
			} else if (!isMenuBtnClicked && left.current === 0 ) {
				// NON-MENU AREA CLICKED
				moveMenu();
			}
		};
		document.addEventListener('click', handleMenuClick, true);
		return () => {
			document.removeEventListener('click', handleMenuClick);
		};
	}, [] );

	return (
		<div className="accordionMenuWrapper accordionUp" suppressHydrationWarning>
			<div className="accordionMenu" id="accordionMenu">
				<MenuAccordionGroup key="accordionRoot" menuItems={menuItems} state={undefined} />
			</div>
		</div>
	);
}





/* ========== MENU GROUP ========== */
/**
 * MenuAccordionGroup — Renders a group of menu items (may be a single item with `routes` or an array of items).
 *
 * @param {oneOfType} [props.menuItems] - A menu item object or an array of menu items (used for nested groups).
 * @param {string} [props.state] - Optional visibility state ('hide' or 'show').
 */
MenuAccordionGroup.propTypes = {
/** Menu item or array of menu items (routes) */
	menuItems: PropTypes.oneOfType([
		menuItemShape,
		PropTypes.arrayOf(menuItemShape)
	]).isRequired,
	/** Visibility state 'hide' | 'show' */
	state: PropTypes.string,
};
export type MenuAccordionGroupType = InferProps<typeof MenuAccordionGroup.propTypes>;
export function MenuAccordionGroup(props: MenuAccordionGroupType) {
	const myMenuItems = ((props.menuItems as any).routes) ? (props.menuItems as any).routes : props.menuItems;
	return (
		<ul className={(props.state === "hide" ? "menuHide" : "menuShow")} key={"menu-group-" + (props.menuItems as any).name}>
			{ generateMenuItems( {menuData: myMenuItems, state: props.state ?? "hide"} ) }
		</ul>
	);
}




/* ========== MENU ITEM ========== */
/**
 * MenuAccordionItem — Single menu entry used by the accordion.
 *
 * @param {string} [props.name] - Display text for the menu item.
 * @param {string} [props.href] - Destination href (empty string for expand/collapse toggles).
 * @param {string} [props.target] - Optional link target (e.g., '_self' or '_blank').
 */
MenuAccordionItem.propTypes = {
/** Display text for the menu item */
	name: PropTypes.string.isRequired,
	/** Link href (or empty string for toggle items) */
	href: PropTypes.string.isRequired,
	/** Optional link target attribute */
	target: PropTypes.string,
};
export type MenuAccordionItemType = InferProps<typeof MenuAccordionItem.propTypes>;
export function MenuAccordionItem(props: MenuAccordionItemType) {
	// Always render the same JSX structure to avoid hydration mismatch
	// href will be undefined or an empty string, target might be undefined
	return ( 
		<li key={"menu-item-" + props.name}>
			<a href={props.href || undefined} target={props.target || undefined}>{props.name}</a>
		</li>
	);
}





/* ========== MENU BUTTON ========== */

/* 
https://www.unclebigbay.com/blog/building-the-world-simplest-hamburger-with-html-and-css
*/

/** MenuAccordionButton — Mobile menu toggle button.
 * @param {any} [props] - No props are accepted by MenuAccordionButton.
 */
MenuAccordionButton.propTypes = { /** no props */ };
export type MenuAccordionButtonType = InferProps<typeof MenuAccordionButton.propTypes>;   
export function MenuAccordionButton(props: MenuAccordionButtonType) {  
	function slideMobilePanel() {
		if (typeof window !== 'undefined' && window.moveMenu) {
			window.moveMenu();
		}
	} 

	// suppressHydrationWarning suppresses hydration mismatch warnings for this button
	return (
		<button 
			className="panelMenuButton" 
			id="panelMenuButton" 
			onClick={slideMobilePanel}
			suppressHydrationWarning
		>
			<span className="hamburger text-outline">{hamburgerIcon}</span>
		</button>
	);
}
