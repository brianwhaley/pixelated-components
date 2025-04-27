import React, { useState, useEffect } from 'react';

export function LinkedIn() {

	const debug = true ;
	
	const [accessToken, setAccessToken] = useState();
	const [recommendations, setRecommendations] = useState();
	const proxyURL = 'https://proxy.pixelated.tech/prod/proxy?url=';
	
	let codeParam, stateParam, myHref ; 
	if (typeof window !== 'undefined') {
		const urlParams = new URLSearchParams(window.location.search);
		codeParam = urlParams.get('code');
		stateParam = urlParams.get('state');
		myHref = window.location.origin ;
	}
	
	const LinkedInApi = {
		clientID : '78sh51y6nl3xe8',
		clientSecret : 'WPL_AP1.dug4iQXjl3VjEGG0.tok/0A==',
		appID : '222241632',
		redirectUrl: `${myHref}/linkedin`,
		state: '96573480', // epoch time for Monday, January 22, 1973 12:58:00 PM GMT-05:00
		oAuthUrl : 'https://www.linkedin.com/oauth/v2/authorization',
		oAuthResponseType : 'code',
		oAuthScope: 'w_member_social',
		tokenUrl : 'https://www.linkedin.com/oauth/v2/accessToken',
		// recommendUrl : 'https://api.linkedin.com/v2/recommendations/urn:li:recommendation:(urn:li:person:brianwhaley)',
		recommendUrl : 'https://api.linkedin.com/v2/recommendation',
		meUrl : 'https://api.linkedin.com/v2/me',
	};

	async function fetchOAuth() {
		if (debug) console.log("Fetching LinkedIn oAuth Token");
		const oAuthParams = new URLSearchParams({
			response_type: LinkedInApi.oAuthResponseType,
			client_id: LinkedInApi.clientID,
			state: LinkedInApi.state,
			scope: encodeURIComponent(LinkedInApi.oAuthScope),
			redirect_uri: LinkedInApi.redirectUrl
		});
		const fullOAuthURL = /* proxyURL + */ LinkedInApi.oAuthUrl + "?" + oAuthParams.toString();
		try {
			if (debug) console.log("OAuth URL : ", fullOAuthURL);
			window.location.href = fullOAuthURL;
		} catch (err) {
			console.log("Error Fetching OAuth Token : ", err);
		}
	}

	async function fetchAccessToken() {
		if (accessToken) return;
		if (debug) console.log("Fetching LinkedIn Access Token");
		const fullTokenURL = proxyURL + LinkedInApi.tokenUrl ;
		try {
			if (debug) console.log("oAuth Code : ", codeParam);
			if (debug) console.log("Access Token URL : ", fullTokenURL);
			const tokenRequestBody = new URLSearchParams({
				'grant_type' : 'authorization_code' ,
				'code' : codeParam ,
				'redirect_uri' : LinkedInApi.redirectUrl ,
				'client_id' : LinkedInApi.clientID ,
				'client_secret' : LinkedInApi.clientSecret
			});
			if (debug) console.log("FETCHBODY : ", tokenRequestBody.toString());
			if (debug) console.log("FETCHBODY LENGTH : ", tokenRequestBody.toString().length);
			const tokenResponse = await fetch(fullTokenURL, { 
				method: "POST",
				headers: {
					"Content-Type" : "application/x-www-form-urlencoded" ,
					// "Content-Length" : tokenRequestBody.toString().length ,
				}, 
				body: tokenRequestBody
			});
			if(tokenResponse.ok){
				const tokenData = await tokenResponse.json();
				console.log(await tokenData);
				setAccessToken(tokenData.access_token);
				if (debug) console.log("Access Token : " , await tokenData);
			} else {
				console.error(`HTTP Error : Status: ${tokenResponse.status}`);
      			// Optionally, throw an error to be caught later
      			throw new Error(`HTTP Error : Status: ${tokenResponse.status}`);
			}
		} catch (err) {
			console.log("Error Fetching Access Token : ", err);
		}
		return;
	}

	async function fetchRecommendations() {
		if(!accessToken || recommendations) return;
		if (debug) console.log("Fetching LinkedIn Recommendations");
		const recommendParams = new URLSearchParams({
			// "q": "received-recommendations",
			// oauth2_access_token: accessToken,
			"q" : "recipient",
			"statusFilters" : "List(VISIBLE)",
		}); 
		const fullRecommendsURL = proxyURL + LinkedInApi.recommendUrl + "?" + recommendParams.toString() ;	
		try {
			console.log("RECOMMEND URL : ", fullRecommendsURL);
			console.log("ACCESS TOKEN : ", accessToken);
			const recommendResponse = await fetch(fullRecommendsURL, { 
				method: 'GET', 
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'X-Restli-Protocol-Version': '2.0.0',
				},
				/* body: new URLSearchParams({
					"recommendee": "urn:li:person:ro87f5eyg_",
					"status": "VISIBLE",
				}) */
			});
			console.log("RECOMMEND RESPONSE : ", recommendResponse);
			const recommendData = await recommendResponse.json();
			if (recommendData.elements) setRecommendations(recommendData.elements);
			if (debug) console.log("Recommendations : ", await recommendData);
		} catch (err) {
			console.log("Error Fetching LinkedIn Recommendations : ", err);
		}
	}

	useEffect(() => {
		if(codeParam && stateParam) { 
			if (debug) console.log("oAuth Code Is Present");
			if (accessToken) {
				if (debug) console.log("Access Token Is Present");
				if (!recommendations) {
					if (debug) console.log("No Recommendations Are Present");
					fetchRecommendations();
				} else {
					if (debug) console.log("Recommendations Already Retrieved");
				}
			} else if (!accessToken) {
				if (debug) console.log("No Access Token Is Present");
				fetchAccessToken();
			}
		} else {
			if (debug) console.log("No oAuth Code Present");
			fetchOAuth();
		}
	}, [accessToken] );




	return (
		<div>
			<div>
				{recommendations ? <div>{JSON.stringify(recommendations)}</div> : <p>Loading...</p>}
			</div>
		</div>
	);
}

/* 
https://www.linkedin.com/company/pixelatedtech
https://www.linkedin.com/company/106825397/admin/dashboard/

https://developer.linkedin.com/
https://www.linkedin.com/developers/apps/222241632/products?refreshKey=1743873578146
https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/reputation-guides/recommendation
https://learn.microsoft.com/en-us/answers/questions/1021872/how-do-i-get-access-to-this-linkedin-api-connectio

https://github.com/jsushank17/LinkedIN-Rest-API-with-React-JS-and-Express/blob/master/CustomLinkedIN.jsx
https://reintech.io/blog/integrating-linkedin-testimonials-on-your-website

*/