"use client";

import React, { useEffect, useRef } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import './modal.css';

/*
https://www.w3schools.com/howto/howto_css_modals.asp
*/

/**
 * Modal — accessible modal overlay component that can use either DOM events or a React close callback.
 *
 * @param {node} [props.modalContent] - Content to render inside the modal dialog (usually React nodes).
 * @param {string} [props.modalID] - Optional suffix used to form DOM ids for compatibility with legacy event-based controls.
 * @param {boolean} [props.isOpen] - Whether the modal is currently open and visible.
 * @param {function} [props.handleCloseEvent] - Optional callback to close the modal (used by React-driven consumers).
 */
Modal.propTypes = {
/** Content rendered inside the modal dialog. */
	modalContent: PropTypes.node.isRequired,
	/** Optional id suffix for the modal; used for legacy DOM-style open/close helpers. */
	modalID: PropTypes.string,
	/** Flag indicating whether the modal is visible. */
	isOpen: PropTypes.bool,
	/** Optional close callback invoked by escape key, overlay click, or controls. */
	handleCloseEvent: PropTypes.func,
};
export type ModalType = InferProps<typeof Modal.propTypes>;
export function Modal({ modalContent, modalID, isOpen = false, handleCloseEvent }: ModalType) {

	const myModalID = "myModal" + (modalID ?? '');
	const myModalCloseID = "myModalClose" + (modalID ?? '');
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Only use DOM event listeners for backward compatibility when handleCloseEvent is not provided
		if (!handleCloseEvent) {
			const handleModalClose = (event: MouseEvent) => {
				event.preventDefault();
				const myModal = document.getElementById(myModalID);
				if (myModal) { myModal.style.display = 'none'; }
			};
			const myModalClose = document.getElementById(myModalCloseID);
			if (myModalClose) { myModalClose.addEventListener('click', handleModalClose); } ;

			const handleWindowOnClick = (event: MouseEvent) => {
				const myModal = document.getElementById(myModalID);
				if (event.target == myModal) {
					if (myModal) { myModal.style.display = 'none'; }
				}
			};
			window.addEventListener('click', handleWindowOnClick);

			return () => {
				window.removeEventListener('click', handleWindowOnClick);
				if (myModalClose) { myModalClose.removeEventListener('click', handleModalClose); } ;
			};
		} else {
			// For React approach, add escape key listener
			const handleEscape = (event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					handleCloseEvent();
				}
			};
			document.addEventListener('keydown', handleEscape);
			return () => {
				document.removeEventListener('keydown', handleEscape);
			};
		}
	}, [myModalID, myModalCloseID, handleCloseEvent]);

	const handleCloseClick = handleCloseEvent ? (event: React.MouseEvent) => {
		event.preventDefault();
		handleCloseEvent();
	} : undefined;

	const handleCloseKeyDown = handleCloseEvent ? (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleCloseEvent();
		}
	} : undefined;

	const handleModalClick = handleCloseEvent ? (event: React.MouseEvent) => {
		if (event.target === modalRef.current) {
			handleCloseEvent();
		}
	} : undefined;

	const handleModalKeyDown = handleCloseEvent ? (event: React.KeyboardEvent) => {
		if (event.key === 'Escape' && event.target === modalRef.current) {
			handleCloseEvent();
		}
	} : undefined;

	return (
		<div
			id={myModalID}
			className="modal"
			style={{display: isOpen ? 'block' : 'none'}}
			ref={modalRef}
			onClick={handleModalClick}
			onKeyDown={handleModalKeyDown}
			tabIndex={-1}
			role="presentation"
			aria-label="Modal overlay"
		>
			<div className="modal-content" role="dialog" aria-modal="true">
				<button
					id={myModalCloseID}
					className="modal-close"
					aria-label="Close modal"
					onClick={handleCloseClick}
					onKeyDown={handleCloseKeyDown}
					type="button"
				>
					&times;
				</button>
				{ modalContent }
			</div>
		</div>
	);
}

export const handleModalOpen = (event: MouseEvent, modalID?: string) => {
	const myModalID = "myModal" + (modalID ?? '');
	event.preventDefault();
	const myModal = document.getElementById(myModalID);
	if (myModal) { myModal.style.display = 'block'; } ;
};
