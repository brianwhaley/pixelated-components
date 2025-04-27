import React, { useEffect, useState } from 'react';

// CONFIG: Replace with your values
const CLIENT_ID = '78sh51y6nl3xe8';
const CLIENT_SECRET = 'WPL_AP1.dug4iQXjl3VjEGG0.tok/0A==';
const REDIRECT_URI = 'http://localhost:6006/?path=/story/linkedin--linked-in-recommendations';
const STATE = '96573480'; // Any random string
const SCOPES = 'r_liteprofile';
const proxyUrl = 'https://proxy.pixelated.tech/prod/proxy?url=';

export function LinkedInAuthRecommendations() {

	const debug = true ;

	const [accessToken, setAccessToken] = useState(null);
	const [recommendations, setRecommendations] = useState([]);
	const [error, setError] = useState(null);

	// Step 1: Redirect user to LinkedIn login
	const initiateLogin = () => {
		if(debug) console.log("Initiating Login");
		// const url = encodeURI(`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}&scope=${encodeURIComponent(SCOPES)}`);
		const authUrl = `${proxyUrl}https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}&scope=${encodeURIComponent(SCOPES)}`;
		window.location.href = authUrl;
	};

	// Step 2: Handle LinkedIn redirect and get access token
	useEffect(() => {
		if (debug) console.log("Handling redirect and getting access token");
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		const state = urlParams.get('state');

		if (code && state === STATE) {
			// Step 3: Exchange code for access token
			if (debug) console.log("Exchanging code for access token : ", code);
			const fetchAccessToken = async () => {
				try {
					const response = await fetch(`${proxyUrl}https://www.linkedin.com/oauth/v2/accessToken`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
						},
						body: new URLSearchParams({
							grant_type: 'authorization_code',
							code,
							redirect_uri: REDIRECT_URI,
							client_id: CLIENT_ID,
							client_secret: CLIENT_SECRET, // Only safe on server
						}),
					});

					const data = await response.json();
					setAccessToken(data.access_token);
				} catch (err) {
					setError('Failed to get access token');
				}
			};
			fetchAccessToken();
		}
	}, []);

	// Step 4: Call LinkedIn API to get recommendations (hypothetical)
	useEffect(() => {
		const fetchRecommendations = async () => {
			if (!accessToken) return;
			if (debug) console.log("Calling LinkedIn API");
			try {
				const response = await fetch(`${proxyUrl}https://api.linkedin.com/v2/recommendations`, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'X-Restli-Protocol-Version': '2.0.0',
					},
				});
				const data = await response.json();
				setRecommendations(data.elements || []);
			} catch (err) {
				setError('Failed to fetch recommendations');
			}
		};
		fetchRecommendations();
	}, [accessToken]);

	// UI
	if (error) return <p className="text-red-500">Error: {error}</p>;
	if (!accessToken) {
		return (
			<div className="p-4">
				<button onClick={initiateLogin} className="px-4 py-2 bg-blue-600 text-white rounded">
          			Login with LinkedIn
				</button>
			</div>
		);
	}

	return (
		<div className="p-4">
			<h2 className="text-xl font-bold mb-2">LinkedIn Recommendations</h2>
			{recommendations.length === 0 ? (
				<p>No recommendations found.</p>
			) : (
				<ul className="space-y-4">
					{recommendations.map((rec, index) => (
						<li key={index} className="p-4 border rounded shadow">
							<p className="font-semibold">{rec.recommender?.name || 'Unknown'}</p>
							<p>{rec.text}</p>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
