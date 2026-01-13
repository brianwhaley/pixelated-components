
import { getContentfulDiscountCodes } from "../integrations/contentful.delivery";

const debug = false;
/* ========== LOCALSTORAGE KEYS ========== */
export const shoppingCartKey = "pixelvividCart";
export const shippingInfoKey = "pixelvividCartShipping";
export const discountCodesKey = "pixelvividDiscountCodes";
export const checkoutInfoKey = "pixelvividCartCheckout";
// const sbPayPalApiKey = "AT10GG2ZHoApTtEw7dJoU6XRDYkf3wEvK2k_-eZ9GOvOK-REphG8yKCyZCqFi95OrxKgrdctlfWxayHG";
// const sbPayPalSecret = "EDUrdPonwcNYZwO5j7hNmFSmF-13zptaCndUnO0-Vr_j0GYEW4m-Tfar9IaukHwm0ixL5fUojOOFtZVk";
// const payPalApiKey = "AeWRwYpsrfslATCndF6xjL4GLcqA1UxQZLC5vxQE-FTvPezXfLbCJO_uAFk5zoXUKRFnP-zJ_73yEkBE";
// const payPalSecret = "EBvYvynRXZCI6RbK4rg2NiENNG4N8tbgl8qAmpxB6f9nUkZjXMODxXJZ91JycP439kPrQcnB7uRKp0-F";


const apiProps = {
	base_url: "https://cdn.contentful.com",
	space_id: "soi9w77t7027",
	environment: "master",
	delivery_access_token: "muY9LfpCt4qoXosDsnRkkoH3DAVVuUFEuB0WRKRdBUM",
};

/* 
https://stackoverflow.com/questions/55328748/how-to-store-and-retrieve-shopping-cart-items-in-localstorage
https://michalkotowski.pl/writings/how-to-refresh-a-react-component-when-local-storage-has-changed
*/

/* ========== TYPES ========== */

export type ShoppingCartType = {
    itemID: string,
    itemURL?: string,
    itemTitle: string,
    itemImageURL? : string,
    itemQuantity: number,
    itemCost: number,
}

/* export type ShoppingCartItemType = {
    itemID: string,
    itemURL?: string,
    itemTitle: string,
    itemQuantity: number,
    itemCost: number,
    itemDescription: string,
    itemCategory?: string,
    itemCondition?: string,
    itemProperties?: { [key: string]: any },
    itemImageThumbnail? : string,
    itemImages?: string[],
    itemSeller?: string,
    itemBuyingFormat?: string,
    itemLocation?: string,
    itemListingDate: string, 
} */

export type AddressType = {
    name: string,
    street1: string,
    city: string,
    state: string,
    zip: string,
    country: string,
    email?: string,
    phone?: string,
}

export type DiscountCodeType = {
    codeName: string,
    codeDescription: string,
    codeType: string,
    codeStart: string,
    codeEnd: string,
    codeValue: number,
};

export type CheckoutType = {
    items: ShoppingCartType[];
    subtotal: number,
    subtotal_discount: number,
    shippingTo: AddressType,
    shippingCost: number,
    handlingFee: number,
    insuranceCost?: number,
    shipping_discount?: number,
    salesTax: number;
    total: number;
}




/* ========== ARRAYS ========== */

const shippingOptions = [
	{
		id: "USPS-GA",
		region: "Domestic US",
		provider: "USPS",
		service: "Ground Advantage",
		price: "9.99",
		speed: "2 - 5 days",
	},{
		id: "USPS-PM",
		region: "Domestic US",
		provider: "USPS",
		service: "Priority Mail",
		price: "14.99",
		speed: "2 - 3 days",
	},{
		id: "USPS-PMX",
		region: "Domestic US",
		provider: "USPS",
		service: "Priority Mail Express",
		price: "39.99",
		speed: "1 - 3 days",
	},{
		id: "USPS-FCP-I",
		region: "International",
		provider: "USPS",
		service: "First-Class Package International",
		price: "24.99",
		speed: "Varies",
	},{
		id: "USPS-PM-I",
		region: "International",
		provider: "USPS",
		service: "Priority Mail International",
		price: "39.99",
		speed: "6 - 10 days",
	},{
		id: "USPS-PMX-I",
		region: "International",
		provider: "USPS",
		service: "Priority Mail Express International",
		price: "69.99",
		speed: "3 - 5 days",
	}
];




/* ======================================= */
/* ========== BACKEND FUNCTIONS ========== */
/* ======================================= */




/* ========== SHOPPING CART FUNCTIONS ========== */


export function formatAsUSD(cost: number) {
	return cost.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}


export function formatAsHundredths(num: number) {
	return Math.trunc(num * 100) / 100;
}


export function getCart() {
	const cart = localStorage.getItem(shoppingCartKey);
	return cart ? JSON.parse(cart) : [];
}


export function setCart(shoppingCartJSON: ShoppingCartType[]) {
	localStorage.setItem(shoppingCartKey, JSON.stringify(shoppingCartJSON));
	window.dispatchEvent(new Event('storage'));
}


export function alreadyInCart(cart: ShoppingCartType[], itemID: string) {
	for (const key in cart) {
		const item = cart[key];
		if (typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, 'itemID') && item.itemID == itemID) {
			return true;
		} 
	}
	return false;
}


export function increaseQuantityCart(cart: ShoppingCartType[], itemID: string) {
	for (const key in cart) {
		const item = cart[key];
		if (typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, 'itemID') && item.itemID == itemID) {
			item.itemQuantity += 1;
		} 
	}
}


export function getIndexInCart(cart: ShoppingCartType[], itemID: string) {
	for (let i = 0; i < cart.length; i++) {
		const item = cart[i];
		if (typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, 'itemID') && item.itemID == itemID) {
			return i;
		} 
	}
	return -1;
}


export function getCartItemCount(cart: ShoppingCartType[]) {
	let cartCount = 0 ;
	for (let i = 0; i < cart.length; i++) {
		const item = cart[i];
		if (typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, 'itemID') ) {
			cartCount = cartCount + ( item.itemQuantity );
		} 
	}
	return cartCount;
}


export function getCartSubTotal(cart: ShoppingCartType[]) {
	let cartSubTotal = 0;
	for (let i = 0; i < cart.length; i++) {
		const item = cart[i];
		if (typeof item === 'object' && item !== null && 
            Object.prototype.hasOwnProperty.call(item, 'itemQuantity') && 
            Object.prototype.hasOwnProperty.call(item, 'itemCost') ) {
			cartSubTotal += (item.itemQuantity * item.itemCost);
		} 
	}
	return formatAsHundredths(cartSubTotal);
}


export function addToShoppingCart(thisItem: ShoppingCartType) {
	let cart: ShoppingCartType[] = getCart();
	if(alreadyInCart(cart, thisItem.itemID)){
		const index = getIndexInCart(cart, thisItem.itemID);
		if ( cart[index].itemQuantity < thisItem.itemQuantity) {
			if (debug) console.log("Increasing quantity in cart");
			increaseQuantityCart(cart, thisItem.itemID);
		} else {
			if (debug) console.log("Cant add more than item quantity to the cart");
			// cant add moe than quantity
		}
	} else {
		// BE SURE TO ADD ONLY ONE TO THE CART
		if (debug) console.log("Adding only one to the cart");
		const cartItem = { ...thisItem };
		cartItem.itemQuantity = 1;
		cart.push(cartItem);
	} 
	localStorage.setItem(shoppingCartKey, JSON.stringify(cart));
	window.dispatchEvent(new Event('storage'));
}


export function removeFromShoppingCart(thisItem: ShoppingCartType) { 
	let cart: ShoppingCartType[] = getCart();
	if(alreadyInCart(cart, thisItem.itemID)){
		cart.splice(getIndexInCart(cart, thisItem.itemID), 1);
	}
	localStorage.setItem(shoppingCartKey, JSON.stringify(cart));
	window.dispatchEvent(new Event('storage'));
}


export function clearShoppingCart() { 
	localStorage.removeItem( shoppingCartKey );
	localStorage.removeItem( shippingInfoKey );
	window.dispatchEvent(new Event('storage'));
}


/* ========== SHIPPING INFO FUNCTIONS ========== */


export function getShippingInfo(){
	const ship = localStorage.getItem(shippingInfoKey);
	return ship ? JSON.parse(ship) : [];
}


export function setShippingInfo(shippingFormData: any) { 
	localStorage.setItem(shippingInfoKey, JSON.stringify(shippingFormData) );
	window.dispatchEvent(new Event('storage'));
}


export function getShippingCost(): number {
	const ship = getShippingInfo();
	const method = ship.shippingMethod;
	const option = shippingOptions.find(item => item.id === method);
	return (option && option.price) ? formatAsHundredths(Number(option.price)) : 0;
}


/* ========== DISCOUNT CODE FUNCTIONS ========== */


export async function validateDiscountCode(field: { value: string ; }) { 
	try {
		const codeList = await getContentfulDiscountCodes({ apiProps: apiProps, contentType: "discountCodes" });
		if (!codeList) { return false; } // If no codes are found, return false
		if(field.value == '') { return true; } // If the field is empty, return true (no code entered)
		if ( codeList.some((code : DiscountCodeType) => code && code.codeName.toLowerCase() === field.value.toLowerCase() )) {
			// if code is in the codeList
			const foundCode = codeList.find((code : DiscountCodeType) => code.codeName.toLowerCase() === field.value.toLowerCase() );
			if(foundCode) {
				// if code is active - between start and end date
				const startDate = new Date(foundCode.codeStart);
				const endDate = new Date(foundCode.codeEnd);
				const today = new Date();
				const isActive = today >= startDate && today <= endDate;
				return isActive;
			}
		} else {
			// if code is not in the codeList
			return false;
		}
	} catch (error) {
		console.error("Error fetching discount codes:", error); // Handle potential errors
		throw error; // Or return false;
	}
}


export async function getRemoteDiscountCodes(){
	if (debug) console.log("Getting Contentful Discount Codes");
	try {
		const discountCodes = await getContentfulDiscountCodes({ 
			apiProps: apiProps, 
			contentType: "discountCodes" 
		});
		if (debug) console.log("Retrieved Contentful Discount Codes: ", discountCodes);
		return discountCodes;
	} catch ( error ) {
		console.error("An error occurred getting discount codes:", error);
	};
}


export function getLocalDiscountCodes(){
	const discountCodes = localStorage.getItem(discountCodesKey);
	return discountCodes ? JSON.parse(discountCodes) : [];

}


export function setDiscountCodes(discountCodesJSON: DiscountCodeType[]) {
	if (debug) console.log("Set Discount Codes LocalStorage: ", discountCodesJSON);
	localStorage.setItem(discountCodesKey, JSON.stringify(discountCodesJSON));
	window.dispatchEvent(new Event('storage'));
}


export function getDiscountCode(codeString: string){
	if (debug) console.log("Getting Discount Code Object");
	if (!codeString || codeString === '') { return undefined; } // If the code is empty, return null
	const discountCodes: DiscountCodeType[] = getLocalDiscountCodes();
	if (!discountCodes) { return undefined; } // If no codes are found, return null
	// Find the discount code in the list
	const discountCode = discountCodes.find((code: DiscountCodeType) => {
		if (code && code.codeName){
			return code.codeName.toLowerCase() === codeString.toLowerCase();
		}else {
			return undefined;
		}
	});
	return discountCode;
}


export function getCartSubtotalDiscount(cart: ShoppingCartType[]) {
	if (!cart) { return 0; } // If cart is empty, return null
	const cartSubTotal = getCartSubTotal(cart);
	const shippingInfo = getShippingInfo();
	const discountCode = getDiscountCode(shippingInfo.discountCode);
	if (!discountCode) { return 0; } // If no codes are found, return null
	let discountAmount = 0;
	if(discountCode.codeType === 'amount'){
		discountAmount = formatAsHundredths(discountCode.codeValue);
	} else if(discountCode.codeType === 'percent'){
		discountAmount = formatAsHundredths(cartSubTotal * discountCode.codeValue);
	}
	return discountAmount;
}



/* ========== CHECKOUT FUNCTIONS ========== */


export function getHandlingFee(){
	return 3.99;
}


export function getSalesTax(): number {
	const itemCost = getCartSubTotal(getCart());
	const shippingCost = getShippingCost();
	const handlingFee = getHandlingFee();
	const njSalesTaxRate = 0.06675;
	const salesTax = njSalesTaxRate * (itemCost + shippingCost + handlingFee);
	return formatAsHundredths(salesTax); 
}


export function getCheckoutTotal() {
	const itemCost = getCartSubTotal(getCart());
	const itemDiscount = getCartSubtotalDiscount(getCart());	
	const shippingCost = getShippingCost();
	const handlingFee = getHandlingFee();
	const insuranceCost = 0;
	const shipping_discount = 0;
	const salesTax = getSalesTax();
	const checkoutTotal = itemCost - itemDiscount + shippingCost + handlingFee + insuranceCost + shipping_discount + salesTax;
	return formatAsHundredths(checkoutTotal);
}


export function getCheckoutData(){
	const checkoutObj: CheckoutType = {
		items: getCart(),
		subtotal: getCartSubTotal(getCart()),
		subtotal_discount: getCartSubtotalDiscount(getCart()),
		shippingTo: getShippingInfo(),
		shippingCost: getShippingCost(),
		handlingFee: getHandlingFee(),
		insuranceCost: undefined,
		shipping_discount: undefined,
		salesTax: getSalesTax(),
		total: getCheckoutTotal(),
	};
	if (debug) console.log(checkoutObj);
	return checkoutObj;
}


/* function completeCheckout() {
} */

