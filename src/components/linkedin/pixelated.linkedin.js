import React, { useState, useEffect } from 'react';

export function LinkedIn(props) {

	const [data, setData] = useState(null);
	const proxyURL = 'https://proxy.pixelated.tech/prod/proxy?url=';
	const urlParams = new URLSearchParams(window.location.search);
	const codeParam = urlParams.get('code');

	const LinkedInApi = {
		clientID : '78sh51y6nl3xe8',
		clientSecret : 'WPL_AP1.dug4iQXjl3VjEGG0.tok/0A==',
		appID : '222241632',
		// redirectUrl: 'https://www.pixelated.tech/linkedin',
		redirectUrl: 'http://localhost:6006',
		tokenUrl : 'https://www.linkedin.com/oauth/v2/accessToken',
		oAuthUrl : 'https://www.linkedin.com/oauth/v2/authorization',
		oAuthResponseType : 'code',
		oAuthScope: 'r_basicprofile', // 'r_liteprofile r_emailaddress w_member_social',
		recommendUrl : 'https://api.linkedin.com/v2/recommendations/urn:li:recommendation:(urn:li:person:brianwhaley)',
		meUrl : 'https://api.linkedin.com/v2/me',
		state: '96573480' // epoch time for Monday, January 22, 1973 12:58:00 PM GMT-05:00
	};

	const oAuthParams = new URLSearchParams({
		response_type: LinkedInApi.oAuthResponseType,
		client_id: LinkedInApi.clientID,
		state: LinkedInApi.state,
		scope: LinkedInApi.oAuthScope,
		redirect_uri: LinkedInApi.redirectUrl
	});
	const fullOAuthURL = proxyURL + LinkedInApi.oAuthUrl + "?" + oAuthParams.toString();

	const recommendParams = new URLSearchParams({
		q: 'received',
		oauth2_access_token: codeParam
	});
	const fullRecommendsURL = proxyURL + LinkedInApi.recommendUrl + "?" + recommendParams.toString();

	async function fetchOAuth() {
		console.log("Fetching LinkedIn oAuth Token");
		try {
			console.log("OAuth URL : ", fullOAuthURL);
			// const oAuthPromise = await fetch(fullOAuthURL, { method: 'GET' });
			// const oAuthPromise = await fetch(LinkedInApi.oAuthUrl + "?" + oAuthParams.toString(), { method: 'GET' });

			window.location.href = fullOAuthURL;

			console.log(await oAuthPromise);
			const response = await oAuthPromise.response;
			console.log(await response);
		} catch (err) {
			console.log("Error : ", err);
		}
	}

	async function fetchAccessToken() {
		console.log("Fetching LinkedIn Access Token");
		try {
			const fullTokenURL = proxyURL + LinkedInApi.tokenUrl ;
			console.log("Access Token URL : ", fullTokenURL);
			const tokenPromise = await fetch(fullTokenURL, { 
				method: 'POST',
				headers: {
					'Content-Type' : 'application/x-www-form-urlencoded' ,
					'grant_type' : 'authorization_code' ,
					// 'grant_type' : 'client_credentials',
					'code' : codeParam ,
					'redirect_uri' : LinkedInApi.redirectUrl , 
					'client_id' : LinkedInApi.clientID ,
					'client_secret' : LinkedInApi.clientSecret
				}
			});
			console.log(tokenPromise);
			const response = await tokenPromise.response;
			console.log(await response);
			console.log("Access Token : " , await response.data);
		} catch (err) {
			console.log("Error : ", err);
		}
	}

	async function fetchRecommendations() {
		console.log("Fetching LinkedIn Recommendations");
		try {
			console.log(fullRecommendsURL);
			const recommendPromise = await fetch(fullRecommendsURL, { method: 'GET' });
			console.log(await recommendPromise);
			const response = await recommendPromise.response;
			console.log(await response);
			console.log(await response.body);
			setData(await response.body);
		} catch (err) {
			console.log("Error : ", err);
		}
	}

	useEffect(() => {
		if(codeParam) { 
			console.log("Access Token Is Present");
			fetchAccessToken()
				.then(fetchRecommendations());
		} else {
			fetchOAuth();
		}
	}, []);




	return (
		<div>
			<div>
				<a href={fullOAuthURL}>Click it!</a>
			</div>
			<div>
				{data ? <div>{JSON.stringify(data)}</div> : <p>Loading...</p>}
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

https://github.com/jsushank17/LinkedIN-Rest-API-with-React-JS-and-Express/blob/master/CustomLinkedIN.jsx
https://reintech.io/blog/integrating-linkedin-testimonials-on-your-website

*/