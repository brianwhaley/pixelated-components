/* SidePanel canonical implementation */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes, { InferProps } from 'prop-types';
import './sidepanel.css';

// Define const arrays for options - used by both PropTypes and form generation
export const positions = ['left', 'right'] as const;

// TypeScript types from the const arrays
export type PositionType = typeof positions[number];

/**
 * SidePanel — off-canvas panel that can be opened from the left or right with optional overlay and tab toggle.
 *
 * @param {boolean} [props.isOpen] - Whether the panel is currently open.
 * @param {function} [props.onClose] - Callback invoked to request the panel be closed.
 * @param {function} [props.onToggle] - Callback to toggle the panel open/closed.
 * @param {oneOf} [props.position] - Which side the panel appears on ('left' | 'right').
 * @param {string} [props.width] - CSS width (e.g., '300px') used for panel size.
 * @param {boolean} [props.showOverlay] - Whether to render a click-to-close overlay behind the panel.
 * @param {boolean} [props.showTab] - Whether to display a persistent toggle tab.
 * @param {node} [props.tabIcon] - Optional icon node to render inside the tab button.
 * @param {string} [props.tabLabel] - Optional text label to show on the tab button.
 * @param {node} [props.children] - Panel content to render inside the side panel.
 * @param {string} [props.className] - Additional CSS class names to apply to the panel container.
 */
SidePanel.propTypes = {
/** Whether the panel is open (controls visible state). */
	isOpen: PropTypes.bool.isRequired,
	/** Function called to request closing the panel. */
	onClose: PropTypes.func.isRequired,
	/** Optional toggle callback to open/close the panel. */
	onToggle: PropTypes.func,
	/** Position of the panel on the screen ('left' or 'right'). */
	position: PropTypes.oneOf([...positions]),
	/** CSS width value for the panel (e.g., '300px'). */
	width: PropTypes.string,
	/** When true an overlay is shown and clicking it closes the panel. */
	showOverlay: PropTypes.bool,
	/** Whether to render a fixed tab toggle for the panel. */
	showTab: PropTypes.bool,
	/** Optional icon node shown inside the persistent tab. */
	tabIcon: PropTypes.node,
	/** Optional label text for the tab toggle. */
	tabLabel: PropTypes.string,
	/** Panel content as React children. */
	children: PropTypes.node,
	/** Extra CSS class names to apply to the component. */
	className: PropTypes.string,
};
export type SidePanelType = InferProps<typeof SidePanel.propTypes>;
export default function SidePanel({
	isOpen,
	onClose,
	onToggle,
	position = 'left',
	width = '300px',
	showOverlay = true,
	showTab = false,
	tabIcon /* = "≡" */ ,
	tabLabel,
	children,
	className = ''
}: SidePanelType) {
	const portalRootRef = useRef<HTMLElement | null>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		if (typeof document === 'undefined') return;
		// Reuse existing root or create one
		let root = document.getElementById('sidepanel-portal-root');
		if (!root) {
			root = document.createElement('div');
			root.id = 'sidepanel-portal-root';
			document.body.appendChild(root);
		}
		portalRootRef.current = root;
		setHasMounted(true);
	}, []);

	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && isOpen && onClose();
		document.addEventListener('keydown', handleKey);
		return () => document.removeEventListener('keydown', handleKey);
	}, [isOpen, onClose]);

	useEffect(() => {
		if (isOpen) document.body.style.overflow = 'hidden';
		else document.body.style.overflow = '';
		return () => { document.body.style.overflow = ''; };
	}, [isOpen]);

	// Close on click outside if no overlay
	useEffect(() => {
		if (!isOpen || showOverlay) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen, showOverlay, onClose]);

	if (!hasMounted || !portalRootRef.current) return null;

	const overlay = showOverlay && (
		<div 
			className="sidepanel-overlay"
			data-state={isOpen ? 'open' : 'closed'}
			onClick={onClose} 
			aria-hidden="true" 
		/>
	);

	const content = (
		<div 
			className="sidepanel-wrapper" 
			ref={wrapperRef}
			data-position={position}
			data-state={isOpen ? 'open' : 'closed'}
			data-has-tab={showTab ? 'true' : 'false'}
			style={{ '--panel-width': width } as React.CSSProperties}
		>
			<div 
				className={`sidepanel ${className}`} 
				role="dialog" 
				aria-modal="true" 
				aria-hidden={!isOpen}
			>
				<div className="sidepanel-content">{children}</div>
			</div>
			
			{showTab && (
				<button 
					className="sidepanel-fixed-tab" 
					onClick={() => onToggle?.()} 
					aria-label={isOpen ? 'Close panel' : 'Open panel'} 
					type="button"
				>
					{tabIcon && <span className="sidepanel-tab-icon">{tabIcon}</span>}
					{tabLabel && <span className="sidepanel-tab-label">{tabLabel}</span>}
				</button>
			)}
		</div>
	);

	return createPortal(
		<div className="sidepanel-portal">{overlay}{content}</div>,
		portalRootRef.current
	);
}

export { SidePanel };
