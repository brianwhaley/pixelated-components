
"use client";

import React, { useState, useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { PayPal } from "./paypal";
import { CalloutHeader } from "../general/callout";
import { FormEngine } from "../sitebuilder/form/formengine";
import { FormButton } from '../sitebuilder/form/formcomponents';
import { emailJSON } from "../sitebuilder/form/formemailer";
import '../sitebuilder/form/form.css';
import { MicroInteractions } from '../general/microinteractions';
import { Modal, handleModalOpen } from '../general/modal';
import { Table } from "../general/table";
import { getCart, getShippingInfo, setShippingInfo, setDiscountCodes, getRemoteDiscountCodes, getCheckoutData, removeFromShoppingCart, clearShoppingCart, formatAsUSD, getCartItemCount } from "./shoppingcart.functions";
import type { ShoppingCartType as CartItemType, AddressType, CheckoutType } from "./shoppingcart.functions";
import { usePixelatedConfig } from '../config/config.client';
import { SmartImage } from '../general/smartimage';
import shippingToData from "./shipping.to.json";
import "./shoppingcart.css";



const debug = false;

/* ================================================ */
/* ========== SHOPPING CART UI COMPONENT ========== */
/* ================================================ */

ShoppingCart.propTypes = {
	payPalClientID: PropTypes.string.isRequired,
};
export type ShoppingCartType = InferProps<typeof ShoppingCart.propTypes>;
export function ShoppingCart( props: ShoppingCartType ) {

	const [ shoppingCart, setShoppingCart ] = useState<CartItemType[]>();
	const [ shippingData, setShippingData ] = useState<AddressType[]>();
	const [ checkoutData, setcheckoutData ] = useState<CheckoutType>();
	const [ orderData, setOrderData ] = useState() as any;
	const [ progressStep, setProgressStep ] = useState<ProgressStepType>("EmptyCart");

	type ProgressStepType = "EmptyCart" | "CartItems" | "ShippingInfo" | "Checkout" | "ThankYou" ;
	function SetProgressStep(step?: ProgressStepType){
		if (step) {
			setProgressStep(step);
		} else {
			const hasShoppingCart = getCart().length > 0;
			if (debug) console.log("hasShoppingCart", hasShoppingCart);
			const hasShippingInfo = Object.keys(getShippingInfo()).length > 0 ;
			if (debug) console.log("hasShippingInfo", hasShippingInfo);
			const hasOrderData = orderData && orderData.length > 0 ;
			if (debug) console.log("hasOrderData", hasOrderData);
			if (debug) console.log(orderData?.length);
			if ( hasOrderData ) {
				setProgressStep("ThankYou");
			} else if ( hasShippingInfo && hasShoppingCart ) {
				setProgressStep("Checkout");
			} else if (hasShoppingCart) {
				setProgressStep("ShippingInfo");
			} else {
				setProgressStep("EmptyCart");
			}
		}
	}

	/* useEffect(() => {
		// UPDATE LOCALSTORAGE IF SHOPPINGCART STATE CHANGES
		setCart(shoppingCart ?? []);
	}, [shoppingCart]); */

	/* useEffect(() => {
		// UPDATE LOCALSTORAGE IF SHIPPINGDATA STATE CHANGES
		setShippingInfo(shippingInfo);
	}, [shippingInfo]); */

	useEffect(() => {
		// UPDATE DISCOUNT CODES ON EACH PAGE LOAD
		(async () => {
			setDiscountCodes(await getRemoteDiscountCodes());
		})();
		// UPDATE SHOPPINGCART AND SHIPPINGDATA STATES IF LOCALSTORAGE CHANGES
		function handleStorageChange(){
			setShoppingCart( getCart() );
			setShippingData( getShippingInfo() );
			setcheckoutData( getCheckoutData() );
			SetProgressStep();
		}
		window.addEventListener('storage', handleStorageChange);
		window.dispatchEvent(new Event('storage'));
		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}, []);

	useEffect(() => {
		// LOAD THE SHIPPING INFO FORM WITH VALUES IF SHIPPING INFO HAS ALREADY BEEN SAVED
  		const form: HTMLFormElement = document.getElementById("address_to") as HTMLFormElement;
		if( shippingData && form ) {
			for (const key in shippingData) {
				const input = form.elements[key] as HTMLInputElement;
				if (input) { // Check if the form element exists
					input.value = shippingData[key].toString();
				}
  			}
		}
	}, [progressStep]);

	paintCartItems.PropTypes = {
		items: PropTypes.array.isRequired
	};
	function paintCartItems(items: CartItemType[]){
		if (debug) console.log("Painting Shopping Cart Items");
		let newItems = [];
		for (let key in items) {
			const myItem: CartItemType = items[key];
			const newItem = <ShoppingCartItem item={myItem} key={myItem.itemID}  />;
			newItems.push(newItem);
		}
		return newItems;
	}

	function onShippingSubmit(/* event: Event */){
		const formID = 'address_to' as const;
		const formElement = document.getElementById(formID) as HTMLFormElement;
		const formData = new FormData(formElement);
		const formObject = Object.fromEntries(formData);
		setShippingInfo(formObject);
	}

	handleOnApprove.propTypes = {
		data: PropTypes.object.isRequired
	};
	type handleOnApproveType = InferProps<typeof handleOnApprove.propTypes>;
	function handleOnApprove(props: handleOnApproveType ){
		if (debug) console.log("Handling onApprove");
		 
		setOrderData(props.data);
		clearShoppingCart();
		// SetProgressStep();
		SetProgressStep("ThankYou");
	}

	if ( progressStep === "ThankYou" ) {
		// ========== SENDMAIL ==========
		const json = {
			'to' : 'brian@pixelvivid.com',
			'from' : 'brian@pixelvivid.com',
			'subject' : 'PixelVivid Purchase',
			'orderData' : JSON.stringify(orderData, null, 2),
		};
		const sendMailResponse = emailJSON(json);
		if (debug) console.log("SendMail Response:", sendMailResponse);

		// ========== THANK YOU ==========
		const pmt = orderData.purchase_units[0].payments.captures[0];
		return (
			<div className="pixCart">
				<CalloutHeader title="Shopping Cart : " />
				<br />
				<div id="paypal-button-container" className="paypal-button-container" />
				<div>
					<h3>Thank you for your payment!</h3>
                        Payment ID : {pmt.id} <br />
                        Status : {pmt.status} <br />
                        Amount : ${pmt.amount.value + " " + pmt.amount.currency_code} <br />
                        Created : {pmt.create_time} <br />
				</div>
			</div>

		);
	} else if ( progressStep === "Checkout" ) {
		// ========== CHECKOUT ==========
		return (
			<div className="pixCart">
				<CalloutHeader title="Checkout Summary : " />
				{ checkoutData && <CheckoutItems {...checkoutData} /> }
				<br />
				<FormButton className="pixCartButton" type="button" id="backToCart" text="<= Back To Cart"
					onClick={() => SetProgressStep("ShippingInfo")} />
				<br />
				<PayPal payPalClientID={props.payPalClientID} 
					checkoutData={getCheckoutData()} 
					onApprove={handleOnApprove} />
			</div>
		);
	} else if ( progressStep === "ShippingInfo" ) {
		// ========== SHOPPING CART ==========
		// ========== SHIPPING INFO ==========
		return (
			<div className="pixCart">
				<CalloutHeader title="Shopping Cart : " />
				{ paintCartItems(shoppingCart ?? []) }
				<br />
				<div>
					<FormButton className="pixCartButton" type="button" id="backToCart" text="Clear Cart"
						onClick={() => clearShoppingCart()} />
				</div>
				<br /><br /><hr /><br /><br />
				<div>
					<CalloutHeader title="Shipping To : " />
					<FormEngine name="address_to" id="address_to" formData={shippingToData as any} onSubmitHandler={onShippingSubmit} />
				</div>
			</div>
		);
	} else {
		// ========== EMPTY SHOPPING CART ==========
		return (
			<div className="pixCart">
				<CalloutHeader title="Shopping Cart : " />
				<br />
				<div className="centered">No items in your shopping cart</div>
				<div id="paypal-button-container" className="paypal-button-container" />
			</div>

		);
	}
}


ShoppingCartItem.propTypes = {
	item: PropTypes.shape({
		itemID: PropTypes.string.isRequired,
		itemURL: PropTypes.string,
		itemTitle: PropTypes.string.isRequired,
		itemImageURL: PropTypes.string,
		itemQuantity: PropTypes.number.isRequired,
		itemCost: PropTypes.number.isRequired,
	}).isRequired
};
export type ShoppingCartItemType = InferProps<typeof ShoppingCartItem.propTypes>;
export function ShoppingCartItem(props: ShoppingCartItemType) {
	const thisItem = props.item;
	const thisItemTarget = "_self"; // "_blank"
	const config = usePixelatedConfig();
	return (
		<div className="pixCartItem row-12col">
			<div className="pixCartItemPhoto grid-s1-e4">
				{ thisItem.itemURL && thisItem.itemImageURL
					? <a href={thisItem.itemURL} target={thisItemTarget} rel="noopener noreferrer">
						<SmartImage src={thisItem.itemImageURL} alt={thisItem.itemTitle} 
							cloudinaryEnv={config?.cloudinary?.product_env}
							cloudinaryDomain={config?.cloudinary?.baseUrl}
							cloudinaryTransforms={config?.cloudinary?.transforms} />
					</a>
					: thisItem.itemImageURL 
						? (
							/* <img src={thisItem.itemImageURL} title={thisItem.itemTitle} alt={thisItem.itemTitle} /> */
							<SmartImage src={thisItem.itemImageURL} title={thisItem.itemTitle} alt={thisItem.itemTitle} 
								cloudinaryEnv={config?.cloudinary?.product_env}
								cloudinaryDomain={config?.cloudinary?.baseUrl}
								cloudinaryTransforms={config?.cloudinary?.transforms} />
						)
						: <></>
				}
			</div>
			<div className="grid-s4-e11">
				<div className="pixCartItemHeader">
					<span>
						{ thisItem.itemURL
							? <a href={thisItem.itemURL} target={thisItemTarget} rel="noopener noreferrer"><h2 className="">{thisItem.itemTitle}</h2></a>
							: <h2 className="">{thisItem.itemTitle}</h2>
						}
					</span>
				</div>
				<div className="pixCartItemDetails grid12">
					<br />
					<div><b>Item ID: </b>{thisItem.itemID}</div>
					<div><b>Quantity: </b>{thisItem.itemQuantity}</div>
					<br />
					<div>
						<FormButton className="pixCartButton" type="button" id={`btn-rm-${thisItem.itemID}`} text="Remove Item From Cart"
							onClick={()=>removeFromShoppingCart(thisItem as CartItemType)} />
					</div>
				</div>
			</div>
			<div className="grid-s11-e13">
				<div className="pixCartItemPrice">
					{ formatAsUSD(thisItem.itemCost) }
				</div>
			</div>
		</div>
	);
}



CheckoutItems.propTypes = {
	items: PropTypes.arrayOf(PropTypes.shape({
		itemID: PropTypes.string.isRequired,
		itemURL: PropTypes.string,
		itemTitle: PropTypes.string.isRequired,
		itemImageURL: PropTypes.string,
		itemQuantity: PropTypes.number.isRequired,
		itemCost: PropTypes.number.isRequired,
	})).isRequired,
	shippingTo: PropTypes.shape({
		name: PropTypes.string.isRequired,
		street1: PropTypes.string.isRequired,
		city: PropTypes.string.isRequired,
		state: PropTypes.string.isRequired,
		zip: PropTypes.string.isRequired,
	}).isRequired,
	subtotal_discount: PropTypes.number.isRequired,
	subtotal: PropTypes.number.isRequired,
	shippingCost: PropTypes.number.isRequired,
	handlingFee: PropTypes.number.isRequired,
	salesTax: PropTypes.number.isRequired,
	total: PropTypes.number.isRequired,
};
export type CheckoutItemsType = InferProps<typeof CheckoutItems.propTypes>;
export function CheckoutItems(props: CheckoutItemsType) {
	const { items, shippingTo, subtotal_discount, subtotal, shippingCost, handlingFee, salesTax, total } = props;
	const to = shippingTo;
	const addr = <><div>{to.name}</div><div>{to.street1}</div><div>{to.city}, {to.state} {to.zip}</div></> ;
	let checkoutTableData = [{
		"Name": "Shopping Cart Items : ",
		"Value": items,
	}, {
		"Name": "Subtotal Discount : ",
		"Value": formatAsUSD(subtotal_discount),
	}, {
		"Name": "Subtotal : ",
		"Value": formatAsUSD(subtotal),
	},{
		"Name": "Shipping Address : ",
		"Value": addr,
	},{
		"Name": "Shipping Cost : ",
		"Value": formatAsUSD(shippingCost),
	},{
		"Name": "Handling Fee : ",
		"Value": formatAsUSD(handlingFee),
	}, /* {
		"Name": "Insurance Cost : ",
		"Value": formatAsUSD(checkoutData.insuranceCost ?? 0),
	}, */ /* {
		"Name": "Shipping Discount : ",
		"Value": formatAsUSD(checkoutData.shipping_discount ?? 0),
	}, */{
		"Name": "Sales Tax : ",
		"Value": formatAsUSD(salesTax),
	},{
		"Name": "TOTAL : ",
		"Value": formatAsUSD(total),
	}];

	if (subtotal_discount == 0) {
		checkoutTableData = checkoutTableData.filter(obj => obj.Name !== "Subtotal Discount : ");
	}
	return (
		<Table id="pixCheckout" data={checkoutTableData} />
	);
}


CartButton.propTypes = {
	href: PropTypes.string.isRequired,
};
export type CartButtonType = InferProps<typeof CartButton.propTypes>;
export function CartButton(props: CartButtonType) {
	const config = usePixelatedConfig();
	const [ cartCount, setCartCount ] = useState(0);
	useEffect(() => {
		// UPDATE CARTCOUNT STATES IF LOCALSTORAGE CHANGES
		function handleStorageChange(){
			setCartCount( getCartItemCount( getCart() ) );
		}
		window.addEventListener('storage', handleStorageChange);
		window.dispatchEvent(new Event('storage'));
		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}, []);
	useEffect(() => {
		if (cartCount && cartCount > 0) {
			MicroInteractions({cartpulse: true});
		} else {
			MicroInteractions({cartpulse: false});
		}
	}, [cartCount]);
	return (
		<div className="pixCart">
			<button className="pixCartButton" type="button" id="pixCartButton" 
				onClick={()=>window.location.href=props.href} >
				{ /* <img src="/images/icons/cart-icon.png" title="View Shopping Cart" alt="View Shopping Cart" /> */ }
				<SmartImage src="/images/icons/cart-icon.png" title="View Shopping Cart" alt="View Shopping Cart" 
					cloudinaryEnv={config?.cloudinary?.product_env}
					cloudinaryDomain={config?.cloudinary?.baseUrl}
					cloudinaryTransforms={config?.cloudinary?.transforms} />
				<span>&nbsp;{`(${cartCount})`}</span>
			</button>
		</div>
	);
}


ViewItemDetails.propTypes = {
	href: PropTypes.string.isRequired,
	itemID: PropTypes.string.isRequired,
};
export type ViewItemDetailsType = InferProps<typeof ViewItemDetails.propTypes>;
export function ViewItemDetails(props: ViewItemDetailsType){
	return (
		<div>
			<FormButton className="pixCartButton" type="button" 
				id={`btn-item-${props.itemID}`} text="View Item Details"
				onClick={()=>window.location.href = `${props.href}/${props.itemID}`} />
		</div>
	);
}


AddToCartButton.propTypes = {
	handler: PropTypes.func.isRequired,
	item: PropTypes.object.isRequired,
	itemID: PropTypes.string.isRequired,
};
export type AddToCartButtonType = InferProps<typeof AddToCartButton.propTypes>;
export function AddToCartButton(props: AddToCartButtonType){
	const [modalContent, setModalContent] = useState<React.ReactNode>();
	useEffect(() => {
		const myContent = <div className="centered"><br /><br />Item {props.itemID} has been added to your cart.<br /><br />{GoToCartButton({href: "/cart", itemID: props.itemID})}<br /><br /></div>;
		setModalContent(myContent);
	}, [props.itemID]);
	function handleClick(e: React.MouseEvent<HTMLButtonElement>){
		props.handler(props.item);
		handleModalOpen(e.nativeEvent, "-" + props.itemID);
	}
	return (
		<div>
			<FormButton className="pixCartButton" type="button" 
				id={`btn-add-${props.itemID}`} text="Add to Shopping Cart"
				onClick={(e)=>handleClick(e)} />
			{modalContent && <Modal modalContent={modalContent} modalID={"-" + props.itemID} />}
		</div>
	);
}


GoToCartButton.propTypes = {
	href: PropTypes.string.isRequired,
	itemID: PropTypes.string.isRequired,
};
export type GoToCartButtonType = InferProps<typeof GoToCartButton.propTypes>;
export function GoToCartButton(props: GoToCartButtonType){
	return (
		<div>
			<FormButton className="pixCartButton" type="button" 
				id={`btn-cart-${props.itemID}`} text="Go to Shopping Cart"
				onClick={()=>window.location.href=props.href} />
		</div>
	);
}


// function ThankYou() { }


// function WishList() { }



