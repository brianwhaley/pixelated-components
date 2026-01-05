"use client";

import React, { useEffect, useRef } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import './modal.css';

/*
https://www.w3schools.com/howto/howto_css_modals.asp
*/

Modal.propTypes = {
	modalContent: PropTypes.node.isRequired,
	modalID: PropTypes.string,
	isOpen: PropTypes.bool,
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
