 
'use client';

import React, { useEffect, useRef } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SmartImage } from './smartimage';
import './menu-expando.css';

MenuExpando.propTypes = {
	menuItems: PropTypes.oneOfType([
		PropTypes.objectOf(PropTypes.string),
		PropTypes.arrayOf(PropTypes.shape({
			name: PropTypes.string.isRequired,
			path: PropTypes.string.isRequired,
			routes: PropTypes.array,
		}))
	]).isRequired
};
export type MenuExpandoType = InferProps<typeof MenuExpando.propTypes>;
export function MenuExpando(props: MenuExpandoType) {
	const detailsRef = useRef<HTMLDetailsElement>(null);
	const ulRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		const details = detailsRef.current;
		const ul = ulRef.current;
		if (!details || !ul) return;

		const summary = details.querySelector('summary');
		if (!summary) return;

		// Initialize nested menus to be closed
		const nestedDetails = details.querySelectorAll('details.menuExpandoNested');
		nestedDetails.forEach((nested: any) => {
			const nestedUl = nested.querySelector('ul');
			if (nestedUl) {
				nestedUl.style.maxHeight = '0px';
				nestedUl.style.opacity = '0';
				nestedUl.style.overflow = 'hidden';
			}
		});

		let isAnimating = false;

		summary.addEventListener('click', (e) => {
			if (isAnimating) {
				e.preventDefault();
				return;
			}

			e.preventDefault();
			isAnimating = true;

			if (details.open) {
				// Closing animation
				ul.style.animation = 'menuExpandoSlideUp 0.3s ease-out forwards';
				setTimeout(() => {
					details.open = false;
					ul.style.animation = '';
					isAnimating = false;
				}, 300);
			} else {
				// Opening animation
				details.open = true;
				ul.style.animation = 'menuExpandoSlideDown 0.3s ease-out forwards';
				setTimeout(() => {
					ul.style.animation = '';
					isAnimating = false;
				}, 300);
			}
		});

		// Handle nested menu animations
		const nestedDetailsForAnimation = details.querySelectorAll('details.menuExpandoNested');
		nestedDetailsForAnimation.forEach((nested: any) => {
			nested.addEventListener('toggle', (e: any) => {
				const nestedUl = nested.querySelector('ul');
				if (nestedUl) {
					if (nested.open) {
						nestedUl.style.maxHeight = '0px';
						nestedUl.style.opacity = '0';
						nestedUl.style.overflow = 'hidden';
						// Force reflow
						void nestedUl.offsetHeight;
						nestedUl.style.transition = 'max-height 0.3s ease-out, opacity 0.3s ease-out';
						nestedUl.style.maxHeight = '500px';
						nestedUl.style.opacity = '1';
						setTimeout(() => {
							nestedUl.style.overflow = 'visible';
							nestedUl.style.transition = '';
						}, 300);
					} else {
						nestedUl.style.overflow = 'hidden';
						nestedUl.style.transition = 'max-height 0.3s ease-out, opacity 0.3s ease-out';
						nestedUl.style.maxHeight = '0px';
						nestedUl.style.opacity = '0';
						setTimeout(() => {
							nestedUl.style.transition = '';
						}, 300);
					}
				}
			});
		});
	}, []);

	function generateMenuItems() {
		const myItems = [];
		// Handle both object format (name: href) and array format (with name/path properties)
		if (Array.isArray(props.menuItems)) {
			// Array format like MenuAccordion
			for (const item of props.menuItems) {
				if (item && item.routes && item.routes.length > 0) {
					// Item has nested routes - create expandable submenu
					myItems.push(
						<li key={item.name}>
							<details className="menuExpandoNested">
								<summary><a href={item.path}>{item.name}</a></summary>
								<ul>
									{item.routes.map((route: any) => (
										<MenuExpandoItem 
											key={route.name} 
											name={route.name} 
											href={route.path} 
										/>
									))}
								</ul>
							</details>
						</li>
					);
				} else if (item) {
					// Regular item without nested routes
					myItems.push(
						<MenuExpandoItem 
							key={item.name} 
							name={item.name} 
							href={item.path} 
						/>
					);
				}
			}
		} else {
			// Object format
			for (const itemKey in props.menuItems) {
				const href = props.menuItems[itemKey];
				if (typeof href === 'string') {
					myItems.push(
						<MenuExpandoItem 
							key={itemKey} 
							name={itemKey} 
							href={href} 
						/>
					);
				}
			}
		}
		return myItems;
	}

	return (
		<div className="menuExpando" id="menuExpando">
			<details className="menu-expando-wrapper" id="menu-expando-wrapper" ref={detailsRef}>
				<summary></summary>
				<ul ref={ulRef}>
					{generateMenuItems()}
				</ul>
			</details>
		</div>
	);
}

MenuExpandoItem.propTypes = {
	name: PropTypes.string.isRequired,
	href: PropTypes.string.isRequired
};
export type MenuExpandoItemType = InferProps<typeof MenuExpandoItem.propTypes>;
export function MenuExpandoItem(props: MenuExpandoItemType) {
	return (
		<li><a href={props.href}>{props.name}</a></li>
	);
}


MenuExpandoButton.propTypes = {};
export type MenuExpandoButtonType = InferProps<typeof MenuExpandoButton.propTypes>;
export function MenuExpandoButton(props: MenuExpandoButtonType) {  
	function handleMenuExpandoButtonClick(event: React.MouseEvent<HTMLDivElement>) {
		event.preventDefault();
		event.stopPropagation();
		const details = document.getElementById('menu-expando-wrapper') as HTMLDetailsElement;
		if (details) details.open = !details.open;
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleMenuExpandoButtonClick(event as any);
		}
	}

	return (
		<div 
			className="menuExpandoButton" 
			id="menuExpandoButton" 
			onClick={handleMenuExpandoButtonClick}
			onKeyDown={handleKeyDown}
			tabIndex={0}
			role="button"
			aria-label="Toggle mobile menu"
		>
			<SmartImage src="/images/icons/mobile-menu2.png" title="Mobile Menu" alt="Mobile Menu"/>
		</div>
	);
}
