import React from 'react';
import { addToShoppingCart, clearShoppingCart, setShippingInfo } from '@/components/shoppingcart/shoppingcart.functions';
import { ShoppingCart } from '@/components/shoppingcart/shoppingcart.components';

const sbPayPalApiKey = "AT10GG2ZHoApTtEw7dJoU6XRDYkf3wEvK2k_-eZ9GOvOK-REphG8yKCyZCqFi95OrxKgrdctlfWxayHG";
const sbPayPalSecret = "EDUrdPonwcNYZwO5j7hNmFSmF-13zptaCndUnO0-Vr_j0GYEW4m-Tfar9IaukHwm0ixL5fUojOOFtZVk";
const payPalApiKey = "AeWRwYpsrfslATCndF6xjL4GLcqA1UxQZLC5vxQE-FTvPezXfLbCJO_uAFk5zoXUKRFnP-zJ_73yEkBE";
const payPalSecret = "EBvYvynRXZCI6RbK4rg2NiENNG4N8tbgl8qAmpxB6f9nUkZjXMODxXJZ91JycP439kPrQcnB7uRKp0-F";

export default {
	title: 'ShoppingCart',
};

const item1 = { 
	itemImageURL: "https://i.ebayimg.com/images/g/CLoAAOSwYWplGdV6/s-l225.jpg",
    itemID: "123456",
    itemTitle: "Blue Widget with Silver Clips",
    itemQuantity: 1,
    itemCost: 149.00,
	itemURL: "https://www.ebay.com",
}; 
const item2 = { 
	itemImageURL: "https://i.ebayimg.com/images/g/h~cAAOSwY95lSaV~/s-l225.jpg",
    itemID: "246810",
    itemTitle: "Red Widget with Chrome Bits",
    itemQuantity: 1,
    itemCost: 139.00,
	itemURL: "https://www.ebay.com",
}; 
const item3 = { 
	itemImageURL: "https://i.ebayimg.com/images/g/uNMAAOSwzfNj4BN2/s-l225.jpg",
    itemID: "036912",
    itemTitle: "Squishy Widget with Slippery Areas",
    itemQuantity: 1,
    itemCost: 159.00,
	itemURL: "https://www.ebay.com",
}; 

// Parent Component
const ParentShoppingCart = () => {
	return (
	  	<>
			<div>
				<button type="button" onClick={()=>addToShoppingCart(item1)}>Add item1 To Cart</button><br />
				<button type="button" onClick={()=>addToShoppingCart(item2)}>Add item2 To Cart</button><br />
				<button type="button" onClick={()=>addToShoppingCart(item3)}>Add item3 To Cart</button><br />
				<button type="button" onClick={()=>clearShoppingCart()}>Clear Shopping Cart</button><br />
				<button type="button" onClick={()=>setShippingInfo('')}>Clear Shippin Info</button><br />
			</div>
            <br />
			<div>
				<ShoppingCart payPalClientID={sbPayPalApiKey} />
			</div>
		</>
	);
};

export const ShoppingCartPage = () => <ParentShoppingCart />;
ShoppingCartPage.args = { };