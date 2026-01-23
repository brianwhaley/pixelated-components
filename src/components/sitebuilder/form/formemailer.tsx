 
/* 
event.target.id = form id
event.body : {
to: "",
from: "",
subject: ""
}
*/
export async function emailFormData(e: Event, callback: (e: Event) => void) {

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
		// Ensure callback is invoked so calling code shows the same UX as a normal submit
		callback(e);
		return;
	}

	myFormData.Date = new Date().toLocaleDateString() ;
	myFormData.Status = "Submitted" ;
	await fetch(sendmail_api, {
		method: 'POST',
		mode: 'cors', 
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(myFormData),
	})
		.then((response) => {
			if (response.status !== 200) {
				throw new Error(response.statusText);
			}
			return response.json();
		});
	if (debug) console.debug('emailFormData — submission data:', myFormData);
	callback(e);
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
	await fetch(sendmail_api, {
		method: 'POST',
		mode: 'cors', 
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(myJsonData),
	})
		.then(async (response) => {
			if (response.status !== 200) {
				throw new Error(response.statusText);
			}
			return await response.json();
		}); 
	if (callback) callback();
}
