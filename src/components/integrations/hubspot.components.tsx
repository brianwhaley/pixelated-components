'use client';

import React, { useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { usePixelatedConfig } from '../config/config.client';




export function initializeHubSpotScript(region: string, portalId: string) {
	if (typeof document === 'undefined') return;
	const scriptId = `hubspot-script-${region}-${portalId}`;
	if (document.getElementById(scriptId)) return;
	const script = document.createElement('script');
	script.id = scriptId;
	script.src = `https://js-${region}.hsforms.net/forms/embed/${portalId}.js`;
	// script.async = true;
	script.defer = true;
	document.head.appendChild(script);
}

/**
 * HubSpotForm — Embed a HubSpot form by injecting the HubSpot script and creating a form instance.
 *
 * @param {string} [props.region] - HubSpot region code (e.g., 'na1').
 * @param {string} [props.portalId] - HubSpot portal ID (account identifier).
 * @param {string} [props.formId] - HubSpot form GUID to render.
 * @param {string} [props.target] - CSS selector target for where the form will be injected (overrides containerId).
 * @param {string} [props.containerId] - ID of the container element to mount the form into (default: 'hubspot-form-container').
 */
HubSpotForm.propTypes = {
/** HubSpot region code */
	region: PropTypes.string,
	/** HubSpot portal/account ID */
	portalId: PropTypes.string,
	/** HubSpot form GUID */
	formId: PropTypes.string,
	/** CSS selector or target element for the form */
	target: PropTypes.string,
	/** DOM ID of the container element for the form */
	containerId: PropTypes.string,
};
export type HubSpotFormType = InferProps<typeof HubSpotForm.propTypes>;
export function HubSpotForm({
	region, portalId, formId, target, containerId = 'hubspot-form-container'
}: HubSpotFormType) {
	const config = usePixelatedConfig();
	
	const finalRegion = region || config?.hubspot?.region || 'na1';
	const finalPortalId = portalId || config?.hubspot?.portalId || '';
	const finalFormId = formId || config?.hubspot?.formId || '';
	
	const formTarget = target || `#${containerId}`;
	useEffect(() => {
		const createHubspotForm = () => {
			const win = window as any;
			if (win.hbspt && win.hbspt.forms) {
				win.hbspt.forms.create({
					region: finalRegion,
					portalId: finalPortalId,
					formId: finalFormId,
					target: formTarget
				});
			} else {
				// no window object yet; this will rerun again
			}
		};
		createHubspotForm();
	}, [finalRegion, finalPortalId, finalFormId, formTarget]);

	return <div 
		className="hs-form-frame" 
		data-region={finalRegion} 
		data-form-id={finalFormId}
		data-portal-id={finalPortalId} 
	/>;
}




/**
 * HubspotTrackingCode — Inject the HubSpot tracking script for the given portal ID.
 *
 * @param {string} [props.hubID] - HubSpot portal ID used to load the tracking script.
 */
HubspotTrackingCode.propTypes = {
/** HubSpot portal ID for tracking script injection */
	hubID: PropTypes.string.isRequired,
};
export type HubspotTrackingCodeType = InferProps<typeof HubspotTrackingCode.propTypes>;
export function HubspotTrackingCode(props: HubspotTrackingCodeType) {
	return (
		<>
			{ /* <!-- Start of HubSpot Embed Code --> */ }
			<script type="text/javascript" id="hs-script-loader" async defer src={`//js-na2.hs-scripts.com/${props.hubID}.js`} />
			{ /* <!-- End of HubSpot Embed Code -->*/ }
		</>
	);
}





/**
 * getHubspotFormSubmissions — Retrieve submissions for a HubSpot form via the HubSpot Forms API (proxied).
 *
 * @param {string} [props.proxyURL] - Proxy base URL used to avoid CORS (must include trailing slash if required by proxy).
 * @param {string} [props.formGUID] - HubSpot form GUID to fetch submissions for.
 * @param {string} [props.apiToken] - HubSpot API token used for authorization.
 */
getHubspotFormSubmissions.propTypes = {
/** Proxy base URL to route the request through */
	proxyURL: PropTypes.string.isRequired,
	/** HubSpot form GUID */
	formGUID: PropTypes.string.isRequired,
	/** Bearer API token for HubSpot requests */
	apiToken: PropTypes.string.isRequired,
};
export type getHubspotFormSubmissionsType = InferProps<typeof getHubspotFormSubmissions.propTypes>;
export async function getHubspotFormSubmissions(props: getHubspotFormSubmissionsType) {
	const url = `${props.proxyURL}https://api.hubapi.com/form-integrations/v1/submissions/forms/${props.formGUID}`;
	const headers = {
		Authorization: "Bearer " + props.apiToken,
	};
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: headers,
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching HubSpot form submissions:', error);
		return null;
	}
}
