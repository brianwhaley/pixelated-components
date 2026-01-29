/* eslint-disable */
// @ts-nocheck

import React from 'react';
import ReactDOM from "react-dom"
import PropTypes, { InferProps } from 'prop-types';
import type { CartItemType, CheckoutType } from "./shoppingcart.functions";
const debug = false;

function isScriptSrc(scriptSrc) {
    const scripts = document.querySelectorAll('script[src]');
    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes(scriptSrc)) {
            return true;
        }
    }
    return false;
}

/* 
https://www.freecodecamp.org/news/integrate-paypal-into-html-css-js-product-pages/
https://dev.to/evansifyke/how-to-integrate-paypal-with-html-css-and-javascript-2mnb
*/

PayPal.PropTypes = {
    payPalClientID: PropTypes.string.isRequired,
    checkoutData: PropTypes.object.isRequired,
    onApprove: PropTypes.func.isRequired
}
export type PayPalType = InferProps<typeof PayPal.propTypes>;
export function PayPal(props: any) {
    const paypalScript = document.createElement('script');
    paypalScript.src = `https://www.paypal.com/sdk/js?client-id=${props.payPalClientID}&currency=USD&components=buttons&enable-funding=venmo,applepay,card&disable-funding=paylater`;
    paypalScript.onload = () => {
        if (window.paypal) {
            // Now you can access paypal object within the window scope
            const PayPalButton = paypal.Buttons.driver("react", {
                React,
                ReactDOM
            });
            initPayPalButton({checkoutData: props.checkoutData, onApprove: props.onApprove});
        }
    };
    if(!isScriptSrc('https://www.paypal.com/sdk/js')) {
        document.head.appendChild(paypalScript);
    }
	return (
		<>
			<link rel="stylesheet" type="text/css" href="https://www.paypalobjects.com/webstatic/en_US/developer/docs/css/cardfields.css"/>
			<div id="paypal-button-container" className="paypal-button-container" />
		</>
	);
}

export function initPayPalButton(props: {checkoutData: CheckoutType, onApprove: any}) {
	window.paypal.Buttons({
        style: {
            shape: "rect",
            color: "gold",
            layout: "vertical",
            label: "paypal",
        },
        createOrder: function (data, actions) {
            // const userInput = document.getElementById("donate-amount").value;
            // const paypalAmount = parseFloat(userInput) / 100;
            const checkoutData = props.checkoutData;
            const orderObject = {
                "purchase_units": [
                    { 
                        "amount": { 
                            "currency_code": "USD", 
                            "value": checkoutData.total,
                            "breakdown": {
                                "item_total": { "currency_code": "USD", "value": checkoutData.subtotal },
                                "shipping": { "currency_code": "USD", "value": checkoutData.shippingCost },
                                "handling": { "currency_code": "USD", "value": checkoutData.handlingFee },
                                "tax_total": { "currency_code":"USD", "value": checkoutData.salesTax},
                                // "insurance": { "currency_code": "USD", "value": checkoutData.insuranceCost },
                                // "shipping_discount": { "currency_code": "USD", "value": checkoutData.shippingDiscount },
                                "discount": { "currency_code": "USD", "value": checkoutData.subtotal_discount },
                            }
                        },
                        "items": checkoutData.items.map((item: CartItemType) => {
                            return({
                                "name": item.itemID,
                                "quantity": item.itemQuantity.toString(),
                                "unit_amount": {
                                    "currency_code": "USD",
                                    "value": item.itemCost.toString(),
                                },
                                "description": item.itemTitle,
                                "category": "PHYSICAL_GOODS",
                                "url": item.itemURL,
                            })
                        }),
                        "shipping": {
                            "name": {
                                "full_name": checkoutData.shippingTo.name,
                            },
                            "address": {
                                "address_line_1": checkoutData.shippingTo.street1,
                                "address_line_2": "",
                                "admin_area_2": checkoutData.shippingTo.city,
                                "admin_area_1": checkoutData.shippingTo.state,
                                "postal_code": checkoutData.shippingTo.zip,
                                "country_code": checkoutData.shippingTo.country,
                            },
                            "email_address": checkoutData.shippingTo.email,
                            "phone": {
                                "phone_number": checkoutData.shippingTo.phone,
                            },
                        }
                    },
                ],
                "payment_source": {
                    "paypal": {
                        "name": {
                            "given_name": checkoutData.shippingTo.name.split(' ').slice(0, -1).join(' '),
                            "surname": checkoutData.shippingTo.name.split(' ').slice(-1).join(' '),
                        },
                        "address": {
                            "address_line_1": checkoutData.shippingTo.street1,
                            "address_line_2": "",
                            "admin_area_2": checkoutData.shippingTo.city,
                            "admin_area_1": checkoutData.shippingTo.state,
                            "postal_code": checkoutData.shippingTo.zip,
                            "country_code": checkoutData.shippingTo.country,
                        },
                        "email_address": checkoutData.shippingTo.email,
                        "phone": {
                            "phone_type": "OTHER",
                            "phone_number": {
                                "national_number": checkoutData.shippingTo.phone.replace(/\D/g, ''),
                            }
                        },
                        "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
                        "experience_context": {
                            // return_url: "https://example.com/returnUrl",
                            // cancel_url: "https://example.com/cancelUrl",
                            // "shipping_preference": "SET_FROM_PROVIDER"
                            "shipping_preference": "SET_PROVIDED_ADDRESS",
                            "user_action": "PAY_NOW" // or "CONTINUE"
                        }
                    }
                }
            };
            return actions.order.create(orderObject);
        },
        onApprove: function (data, actions) {
            return actions.order.capture().then(function (orderData) {
                if (debug) console.log("Capture result", orderData, JSON.stringify(orderData, null, 2));
                props.onApprove({data: orderData});
                // Show a success message within this page, for example:
                /* const element = document.getElementById("paypal-button-container");
                if(element){
                    element.innerHTML = "";
                    element.innerHTML = "<h3>Thank you for your payment!</h3>";
                } */
                // Or go to another URL:  actions.redirect('thank_you.html');
            });
        },
        onError: function (err: Error) {
            console.log(err);
            switch (e.toString()) {
                case 'Error: Detected popup close':
                    showInfoBanner('PayPal Payment cancelled'); // Or handle as needed
                    break;
                default:
                    showError('PayPal error');
            }
        },
        onCancel: function(data) {
            // Show a cancel page or return to cart
            // For example, redirect the user to a cancellation page:
            window.location.href = "/cart";
        }
    })
    .render("#paypal-button-container");
}
