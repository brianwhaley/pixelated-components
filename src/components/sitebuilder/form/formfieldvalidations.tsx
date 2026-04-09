import { validateDiscountCode } from '../../shoppingcart/shoppingcart.functions';

export const inputTypes = [
	'button', 'checkbox', 'color', 'date', 'datetime-local', 'email',
	'file', 'hidden', 'image', 'month', 'number', 'password', 'radio',
	'range', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url', 'week'
];

export const booleans = ['true', 'false'];

export const formURLs = [
	'https://www.marriott.com/loyalty/createAccount/createAccountPage1.mi',
	'https://stackoverflow.com/users/signup',
	'https://www.google.com',
	'https://www.hilton.com/en/hilton-honors/join/',
	'https://www.oakleyforum.com/register/?accountType=1',
	'https://www.microfocus.com/selfreg/jsp/createAccount.jsp',
	'https://www.michaels.com/on/demandware.store/Sites-MichaelsUS-Site/default/Account-NewRegistration',
	'https://reg.usps.com/register'
];

export function getAllInvalidFields () {
	const invalids = [];
	for (const field of document.querySelectorAll('[required]')) {
		const inputField = field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
		if (typeof inputField.reportValidity === 'function' && !inputField.reportValidity()) {
			invalids.push(inputField.id);
		}
	}
	return invalids;
}

export function isOneChecked (field: { id: string; }) {
	const name = field.id.substring(0, field.id.indexOf('_') + 1);
	const boxes = document.querySelectorAll("[id^='" + name + "']");
	for (const box of Array.from(boxes)) {
		const thisBox = box as HTMLInputElement;
		if (thisBox.checked) return true;
	}
	return false;
}

export function isOneRadioSelected (field: { name: string; }) {
	const radios = document.getElementsByName(field.name);
	let isValid = false;
	for (let i = 0; i < radios.length; i++) {
		const radioElem = radios[i] as HTMLInputElement;
		if (radioElem.checked) isValid = true;
	}
	return isValid;
}

export function isValidUSZipCode (field: { value: string; }) {
	const regexStr = /^\d{5}(-\d{4})?$/;
	const regex = new RegExp(regexStr);
	return regex.test(field.value); // was match
}

export function isValidUSPhoneNumber (field: { value: string; }) {
	const regexStr = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s.]{0,1}[0-9]{3}[-\s.]{0,1}[0-9]{4}$/;
	const regex = new RegExp(regexStr);
	return regex.test(field.value); // was match
}

export function isValidEmailAddress (field: { value: any; }) {
	// let regex1 = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ;
	const regexStr = /^\S+@\S+\.\S+$/;
	const regex = new RegExp(regexStr);
	const str = String(field.value).toLowerCase();
	return regex.test(str); // was match
}

export function isValidDate (field: { value: string | number | Date; }) {
	const date = new Date(field.value);
	return date instanceof Date && !isNaN(date.valueOf());
}

export function isValidUrl (field: { value: string | URL; }) {
	try {
		return Boolean(new URL(field.value));
	} catch (e) {
		console.log("Error isValidUrl: ", e);
		return false;
	}
}

export function isValidDiscountCode(field: { value: string ; }) {
	return validateDiscountCode(field);
}