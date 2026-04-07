"use client";

import React, { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { createContext, useContext } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { ToggleLoading } from '../../general/loading';
import { handleModalOpen } from '../../general/modal';
import { Loading } from '../../general/loading';
import { Modal } from '../../general/modal';
import { smartFetch } from '../../general/smartfetch';

/* 
event.target.id = form id
event.body : {
to: "",
from: "",
subject: ""
}
*/
export type EmailFormDataResult = {
	success: boolean;
	response?: any;
	error?: Error;
};

export async function emailFormData(e: Event, callback?: (e: Event) => void): Promise<EmailFormDataResult> {

	const debug = false;

	// const sendmail_api = "https://nlbqdrixmj.execute-api.us-east-2.amazonaws.com/default/sendmail";
	const sendmail_api = "https://sendmail.pixelated.tech/default/sendmail";
	const target = e.target as HTMLFormElement;
	const myform = document.getElementById(target.id) as HTMLFormElement | null;

	e.preventDefault?.();
	const myFormData: { [key: string]: any } = {};
	const formData = new FormData(myform as HTMLFormElement);
	for (const [key, value] of formData.entries()) {
		myFormData[key] = value ;
	}

	const hpField = myform?.elements.namedItem('winnie') as HTMLInputElement;
	const hpFieldVal = hpField?.value.toString();

	// If either DOM or FormData indicate a filled honeypot, silently drop the submission.
	if ((hpField && hpFieldVal.trim())) {
		// Prevent native navigation where possible and mirror success path.
		try {
			(e as Event)?.preventDefault?.();
		} catch (err) {
			if (debug) console.debug('preventDefault failed in honeypot guard', err);
		}
		if (debug) console.info('honeypot triggered — dropping submit');
		callback?.(e);
		return { success: true, response: null };
	}

	myFormData.Date = new Date().toLocaleDateString() ;
	myFormData.Status = "Submitted" ;
	const startTime = new Date().toISOString();
	if (debug) console.info('[emailFormData] submit-start', { sendmail_api, startTime, myFormData });
	try {
		const responseData = await smartFetch(sendmail_api, {
			requestInit: {
				method: 'POST',
				mode: 'cors',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(myFormData),
			}
		});
		const elapsedMs2 = new Date().getTime() - new Date(startTime).getTime();
		if (debug) console.info('[emailFormData] submit-finish', { sendmail_api, elapsedMs: elapsedMs2, responseData });
		const parsed = responseData;
		if (debug) console.debug('emailFormData — submission data:', myFormData, 'response:', parsed);
		callback?.(e);
		return { success: true, response: parsed };
	} catch (err) {
		console.error('emailFormData error', err);
		callback?.(e);
		return { success: false, error: err as Error };
	}
}



export async function emailJSON(jsonData: any, callback?: () => void) {
	// const sendmail_api = "https://nlbqdrixmj.execute-api.us-east-2.amazonaws.com/default/sendmail";
	const sendmail_api = "https://sendmail.pixelated.tech/default/sendmail";
	const myJsonData: { [key: string]: any } = {};
	for (const [key, value] of Object.entries(jsonData)) {
		myJsonData[key] = value ;
	}
	// MVP honeypot guard: check both the canonical id/key 'winnie' and the
	// FormHoneypot default name 'website' to cover both DOM- and JSON-based calls.
	if (myJsonData['winnie'] || myJsonData['website']) {
		if (callback) callback();
		return;
	}
	myJsonData.Date = new Date().toLocaleDateString() ;
	myJsonData.Status = "Submitted" ;
	try {
		await smartFetch(sendmail_api, {
			requestInit: {
				method: 'POST',
				mode: 'cors',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(myJsonData),
			}
		});
		if (callback) callback();
	} catch (err) {
		console.error('emailJSON error', err);
		if (callback) callback();
	}
}

const DEFAULT_MODAL_CONTENT = (
	<div className="centered">
		<br /><br />
		Thank you for your submission!<br />
		We will get back to you as soon as we can.
		<br /><br /><br />
	</div>
);

export type UseFormSubmitOptions = {
	// Feature flags
	toggleLoading?: boolean;
	openModal?: boolean;
	resetForm?: boolean;
	
	// Modal content
	modalContent?: React.ReactNode;
	
	// Lifecycle callbacks (run after defaults)
	onStart?: () => void;
	onSuccess?: (event: Event, response?: any) => void;
	onError?: (event: Event, error: Error) => void;
	onFinally?: (event: Event) => void;
};

export function useFormSubmit(options: UseFormSubmitOptions = {}) {
	const {
		toggleLoading = true,
		openModal = true,
		resetForm = true,
		modalContent = DEFAULT_MODAL_CONTENT,
		onStart,
		onSuccess,
		onError,
		onFinally,
	} = options;

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<Error | null>(null);
	const [submitResponse, setSubmitResponse] = useState<any>(null);

	const handleSubmit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			const nativeEvent = event.nativeEvent as unknown as Event;

			// Start
			if (toggleLoading) ToggleLoading({ show: true });
			onStart?.();

			setIsSubmitting(true);
			setSubmitError(null);

			// Submit
			const result = await emailFormData(nativeEvent);
			setSubmitResponse(result.response);

			// Handle result
			if (result.success) {
				// Run defaults first
				if (openModal) {
					// Use the Modal context if available, or try handleModalOpen
					try {
						handleModalOpen(nativeEvent as MouseEvent);
					} catch (err) {
						// Modal system not available in test/story context
						if (typeof window !== 'undefined' && (window as any).__DEV__) {
							console.debug('handleModalOpen not available', err);
						}
					}
				}
				if (resetForm) {
					const form = nativeEvent.target as HTMLFormElement;
					if (form) form.reset();
				}

				// Run custom callback
				onSuccess?.(nativeEvent, result.response);
			} else {
				const error = result.error ?? new Error('Form submission failed');
				setSubmitError(error);

				// Run custom callback
				onError?.(nativeEvent, error);
			}

			// Finalize
			onFinally?.(nativeEvent);

			if (toggleLoading) ToggleLoading({ show: false });
			setIsSubmitting(false);
		},
		[toggleLoading, openModal, resetForm, onStart, onSuccess, onError, onFinally]
	);

	return {
		isSubmitting,
		submitError,
		submitResponse,
		handleSubmit,
		modalContent: modalContent as NonNullable<React.ReactNode>,
	};
}

/* ===== FORM SUBMIT WRAPPER ===== */

type FormSubmitContextType = {
	handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
	isSubmitting: boolean;
};

const FormSubmitContext = createContext<FormSubmitContextType | undefined>(undefined);

/**
 * FormSubmitWrapper — Encapsulates form submission lifecycle (loading, modal, submit handling)
 * 
 * Internally calls useFormSubmit() and manages Loading/Modal display.
 * FormEngine components within should call useFormSubmitContext() to access handleSubmit.
 */
export type FormSubmitWrapperProps = UseFormSubmitOptions & {
	children: React.ReactNode;
};

FormSubmitWrapper.propTypes = {
	/** Enable/disable loading spinner during submission (default: true) */
	toggleLoading: PropTypes.bool,
	/** Enable/disable thank you modal after submission (default: true) */
	openModal: PropTypes.bool,
	/** Enable/disable form reset after submission (default: true) */
	resetForm: PropTypes.bool,
	/** Custom content to display in thank you modal */
	modalContent: PropTypes.node,
	/** Callback invoked at start of submission */
	onStart: PropTypes.func,
	/** Callback invoked on successful submission */
	onSuccess: PropTypes.func,
	/** Callback invoked on submission error */
	onError: PropTypes.func,
	/** Callback invoked at end of submission lifecycle */
	onFinally: PropTypes.func,
	/** Form components to render within the wrapper */
	children: PropTypes.node.isRequired,
};
export type FormSubmitWrapperType = InferProps<typeof FormSubmitWrapper.propTypes>;
export function FormSubmitWrapper(props: FormSubmitWrapperType) {
	const { children, ...options } = props;
	const { handleSubmit, isSubmitting, modalContent } = useFormSubmit(options as UseFormSubmitOptions);

	return (
		<FormSubmitContext.Provider value={{ handleSubmit, isSubmitting }}>
			<Loading />
			<Modal modalContent={modalContent} />
			{children}
		</FormSubmitContext.Provider>
	);
}

/**
 * Hook to access form submission context within FormSubmitWrapper
 */
export function useFormSubmitContext() {
	const context = useContext(FormSubmitContext);
	if (!context) {
		throw new Error('useFormSubmitContext must be used within FormSubmitWrapper');
	}
	return context;
}
