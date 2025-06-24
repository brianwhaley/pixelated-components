import React from 'react';
import { ShoppingCart, AddToShoppingCart, ClearShoppingCart, SetShippingInfo } from '../components/shoppingcart/pixelated.shoppingcart';

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
				<button type="button" onClick={()=>AddToShoppingCart(item1)}>Add item1 To Cart</button><br />
				<button type="button" onClick={()=>AddToShoppingCart(item2)}>Add item2 To Cart</button><br />
				<button type="button" onClick={()=>AddToShoppingCart(item3)}>Add item3 To Cart</button><br />
				<button type="button" onClick={()=>ClearShoppingCart()}>Clear Shopping Cart</button><br />
				<button type="button" onClick={()=>SetShippingInfo('')}>Clear Shippin Info</button><br />
			</div>
            <br />
			<div>
				<ShoppingCart />
			</div>
		</>
	);
};

export const ShoppingCartPage = () => <ParentShoppingCart />;
ShoppingCartPage.args = { };