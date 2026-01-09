"use client";

import React, { useState, useEffect } from "react";
import PropTypes, { InferProps } from "prop-types";
import { Carousel } from '../general/carousel';
import { SmartImage } from "../general/smartimage";
import { defaultEbayProps, ebaySunglassCategory, getEbayItems, getEbayItem, getShoppingCartItem } from "./ebay.functions";
import { addToShoppingCart } from "./shoppingcart.functions";
import { AddToCartButton, /* GoToCartButton */ ViewItemDetails } from "./shoppingcart.components";
import { getCloudinaryRemoteFetchURL as getImg} from "../general/cloudinary";
import { Loading , ToggleLoading } from "../general/loading";
import { usePixelatedConfig } from "../config/config.client";
import "../../css/pixelated.grid.scss";
import "./ebay.css";
const debug = false;


/* ========== EBAY ITEMS PAGE ========== */

EbayItems.propTypes = {
	apiProps: PropTypes.object.isRequired,
	cloudinaryProductEnv: PropTypes.string,
};
export type EbayItemsType = InferProps<typeof EbayItems.propTypes>;
export function EbayItems(props: EbayItemsType) {
	// https://developer.ebay.com/devzone/finding/HowTo/GettingStarted_JS_NV_JSON/GettingStarted_JS_NV_JSON.html
	const [ items, setItems ] = useState<any[]>([]);
	const [ aspects, setAspects ] = useState<any[]>([]);
	const [ apiProps ] = useState({ ...defaultEbayProps , ...props.apiProps});

	paintItems.propTypes = {
		items: PropTypes.array.isRequired,
		cloudinaryProductEnv: PropTypes.string,
	};
	type paintItemsType = InferProps<typeof paintItems.propTypes>;
	function paintItems(props: paintItemsType){
		if (debug) console.log("Painting Items");
		let newItems = [];
		for (let key in props.items) {
			const item = props.items[key];
			const newItem = <EbayListItem item={item} key={item.legacyItemId} 
				cloudinaryProductEnv={props.cloudinaryProductEnv} />;
			newItems.push(newItem);
		}
		return newItems;
	}

	fetchItems.propTypes = {
		aspectName: PropTypes.string,
		aspectValue: PropTypes.string,
	};
	type fetchItemsType = InferProps<typeof fetchItems.propTypes>;
	async function fetchItems(props?: fetchItemsType) {
		try {
			if (debug) console.log("Fetching ebay API Items Data");
			const myApiProps = { ...apiProps };
			if(props) {
				const params = new URLSearchParams(myApiProps.qsSearchURL);
				let aspects = params.get('aspect_filter'); 
				const newAspects = props.aspectName + ":{" + props.aspectValue + "}";
				aspects = (aspects) ? aspects + "," + newAspects : newAspects ;
				params.set('aspect_filter', aspects);
				myApiProps.qsSearchURL = "?" + decodeURIComponent(params.toString());
			}
			const response: any = await getEbayItems({ apiProps: myApiProps });
			if (debug) console.log("eBay API Search Items Data:", response);
			setItems(response?.itemSummaries);
			setAspects(response?.refinement?.aspectDistributions);
		} catch (error) {
			console.error("Error fetching eBay items:", error);
		}
	}

	useEffect(() => {
		if (debug) console.log("Running useEffect");
		ToggleLoading(true);
		fetchItems();
		ToggleLoading(false);
	}, []);

	if (items && items.length > 0 ) {
		return (
			<>
				{ /* <Loading /> */}
				<div className="ebayItemsHeader">
					<EbayItemHeader title={`${items.length} Store Items`} />
				</div>
				<div className="ebayItemsHeader">
					<EbayListFilter aspects={aspects} callback={fetchItems} />
				</div>
				<div id="ebayItems" className="ebayItems">
					{ paintItems({ items: items, cloudinaryProductEnv: props.cloudinaryProductEnv }) }
				</div>
			</>
		);
	} else {
		return (
			<div className="section-container">
				<div id="ebayItems" className="ebayItems">
					{ /* <Loading /> */}
				</div>
			</div>
		);
	}

}




EbayListFilter.propTypes = {
	aspects: PropTypes.any.isRequired,
	callback: PropTypes.func.isRequired,
};
export type EbayListFilterType = InferProps<typeof EbayListFilter.propTypes>;
export function EbayListFilter(props: EbayListFilterType) {

	if (!props.aspects || !Array.isArray(props.aspects)) {
		return null;
	}

	const aspectNames = props.aspects.map(( aspect: any ) => (
		aspect.localizedAspectName 
	)).sort();

	let aspectNamesValues: any = {};
	for (const aspect of props.aspects) {
		const thisAspectName: string = aspect.localizedAspectName;
		const aspectNameValues = aspect.aspectValueDistributions.map(( aspectValue: any ) => {
			return ( aspectValue.localizedAspectValue );
		}).sort();
		aspectNamesValues[thisAspectName] = aspectNameValues;
	}

	function onAspectNameChange(){
		const aspectName = document.getElementById("aspectName") as HTMLSelectElement;
		const aspectValue = document.getElementById("aspectValue") as HTMLSelectElement;
		const aspectNameValues = aspectNamesValues[aspectName.value];
		aspectNameValues.unshift("");
		aspectValue.options.length = 0;
		aspectNameValues.forEach( (aspectValueString: string) => {
			const option = document.createElement('option');
			option.textContent = aspectValueString; 
			option.value = aspectValueString;
			aspectValue.appendChild(option);
		});
	}

	function onAspectValueChange(){
		// const aspectName = document.getElementById("aspectName") as HTMLSelectElement;
		// const aspectValue = document.getElementById("aspectValue") as HTMLSelectElement;
		return ;
	}

	function handleAspectFilter(){
		const aspectName = document.getElementById("aspectName") as HTMLSelectElement;
		const aspectValue = document.getElementById("aspectValue") as HTMLSelectElement;
		if (aspectName.value && aspectValue.value) {
			props.callback({ aspectName: aspectName.value, aspectValue: aspectValue.value });
		}
	}

	return (
		<form name="ebayItemsFilter" id="ebayItemsFilter">
			<span className="filterInput">
				<label htmlFor="aspectName">Aspect:</label>
				<select id="aspectName" onChange={onAspectNameChange}>
					<option value=""></option>
					{ aspectNames.map((aspectName: any, index: number) =>
						<option key={index} value={aspectName}>{aspectName}</option>
					)}
				</select>
			</span>
			<span className="filterInput">
				<label htmlFor="aspectValue" onChange={onAspectValueChange}>Value:</label>
				<select id="aspectValue">
					<option value=""></option>
				</select>
			</span>
			<span className="filterInput">
				<button type="button" onClick={handleAspectFilter}>Filter</button>
			</span>
		</form>
	);
}





EbayListItem.propTypes = {
	item: PropTypes.any.isRequired,
	cloudinaryProductEnv: PropTypes.string,
};
export type EbayListItemType = InferProps<typeof EbayListItem.propTypes>;
export function EbayListItem(props: EbayListItemType) {
	const thisItem = props.item;
	// const itemURL = thisItem.itemWebUrl;
	const itemURL = "./store/" + thisItem.legacyItemId;
	const itemURLTarget = "_self"; /* "_blank" */
	const itemImage = (props.cloudinaryProductEnv) 
		? getImg({url: thisItem.thumbnailImages[0].imageUrl, product_env: props.cloudinaryProductEnv}) 
		: thisItem.thumbnailImages[0].imageUrl;
	const shoppingCartItem = getShoppingCartItem({ thisItem: thisItem, cloudinaryProductEnv: props.cloudinaryProductEnv });
	// CHANGE EBAY URL TO LOCAL EBAY ITEM DETAIL URL
	shoppingCartItem.itemURL = itemURL;
	const config = usePixelatedConfig();
	const itemImageComponent = <SmartImage src={itemImage} title={thisItem.title} alt={thisItem.title} 
		cloudinaryEnv={props.cloudinaryProductEnv ?? undefined}
		cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
		cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined} />;
	// <img src={itemImage} title={thisItem.title} alt={thisItem.title} />
	return (
		<div className="ebayItem row-12col">
			<div className="ebayItemPhoto grid-s1-e5">
				{ itemURL
					? <a href={itemURL} target={itemURLTarget} rel="noopener noreferrer">{itemImageComponent}</a>
					: ( itemImageComponent )
				}
			</div>
			<div className="ebayItemBody grid-s5-e13">
				<div className="ebayItemHeader">
					{ itemURL
						? <EbayItemHeader url={itemURL} target={itemURLTarget} title={thisItem.title} />
						: <EbayItemHeader title={thisItem.title} />
					}
				</div>
				<div className="ebayItemDetails grid12">
					<div><b>Item ID: </b>{thisItem.legacyItemId}</div>
					<div><b>Quantity: </b>{thisItem.categories[0].categoryId == ebaySunglassCategory ? 1 : 10}</div>
					<div><b>Condition: </b>{thisItem.condition}</div>
					<div><b>Seller: </b>{thisItem.seller.username} ({thisItem.seller.feedbackScore})<br />{thisItem.seller.feedbackPercentage}% positive</div>
					<div><b>Buying Options: </b>{thisItem.buyingOptions[0]}</div>
					<div><b>Location: </b>{thisItem.itemLocation.postalCode + ", " + thisItem.itemLocation.country}</div>
					<div><b>Listing Date: </b>{thisItem.itemCreationDate}</div>
				</div>
				<div className="ebayItemPrice">
					{ itemURL
						? <a href={itemURL} target={itemURLTarget} rel="noreferrer">${thisItem.price.value + " " + thisItem.price.currency}</a>
						: "$" + thisItem.price.value + " " + thisItem.price.currency
					}
				</div>
				<br />
				<div className="ebayItemAddToCart">
					<ViewItemDetails href={"/store"} itemID={thisItem.legacyItemId} />
					<AddToCartButton handler={addToShoppingCart} item={shoppingCartItem} itemID={thisItem.legacyItemId} />
					{ /* <GoToCartButton href={"/cart"} itemID={thisItem.legacyItemId} /> */}
				</div>
			</div>
		</div>
	);
}



EbayItemHeader.propTypes = {
	title: PropTypes.string.isRequired,
	url: PropTypes.string,
	target: PropTypes.string,
};
export type EbayItemHeaderType = InferProps<typeof EbayItemHeader.propTypes>;
export function EbayItemHeader(props: EbayItemHeaderType) {
	return (
		<span>
			{ props.url
				? <a href={props.url} target={props.target ?? ''} rel="noopener noreferrer"><h2 className="">{props.title}</h2></a>
				: <h2 className="">{props.title}</h2>
			}
		</span>
	);
}


/* ========== EBAY ITEM DETAIL PAGE ========== */


EbayItemDetail.propTypes = {
	apiProps: PropTypes.object.isRequired,
	itemID: PropTypes.string.isRequired, // currently not used
	cloudinaryProductEnv: PropTypes.string,
};
export type EbayItemDetailType = InferProps<typeof EbayItemDetail.propTypes>;
export function EbayItemDetail(props: EbayItemDetailType)  {
	const [ item, setItem ] = useState({});
	const [ apiProps ] = useState({ ...defaultEbayProps, ...props.apiProps });
	useEffect(() => {
		if (debug) console.log("Running useEffect");
		async function fetchItem() {
			try {
				const response: any = await getEbayItem({ apiProps: apiProps });
				if (debug) console.log("eBay API Get Items Data", response);
				setItem(response);
			} catch (error) {
				console.error("Error fetching eBay items:", error);
			}
		}
		fetchItem();
	}, []);
	if ( item && Object.keys(item) && Object.keys(item).length > 0 ) {
		const thisItem = { ...item } as any;
		if (debug) console.log(thisItem);
		const images = thisItem.additionalImages.map(( thisImage: any ) => (
			{ image: (props.cloudinaryProductEnv) 
				? getImg({url: thisImage.imageUrl, product_env: props.cloudinaryProductEnv}) 
				: thisImage.imageUrl }
		));
		const itemURL = undefined;
		const itemURLTarget = "_self"; /* "_blank" */
		const shoppingCartItem = getShoppingCartItem({thisItem: thisItem, cloudinaryProductEnv: props.cloudinaryProductEnv });
		shoppingCartItem.itemURL = itemURL;
		return (
			<>
				<div className="ebayItem row-12col">
					<div className="ebayItemHeader grid-s1-e13">
						{ itemURL
							? <EbayItemHeader url={itemURL} title={thisItem.title} />
							: <EbayItemHeader title={thisItem.title} />
						}
					</div>
					<br />
					<div className="ebayItemPhotoCarousel grid-s1-e7">
						<Carousel 
							cards={images} 
							draggable={true} 
							imgFit={"contain"}
						/>
					</div>
					<div className="grid-s7-e13">
						<div className="ebayItemDetails grid12">
							<div dangerouslySetInnerHTML={{ __html: thisItem.description.replace(/(<br\s*\/?>\s*){2,}/gi, '') }} />
						</div>
						<br />
						<div className="ebayItemDetails grid12">
							<div><b>Item ID: </b>{thisItem.legacyItemId}</div>
							<div><b>Quantity: </b>{thisItem.categoryId == ebaySunglassCategory ? 1 : 10}</div>
							<div><b>Category: </b>{thisItem.categoryPath}</div>
							<div><b>Condition: </b>{thisItem.condition}</div>
							<div><b>Seller: </b>{thisItem.seller.username} ({thisItem.seller.feedbackScore})<br />{thisItem.seller.feedbackPercentage}% positive</div>
							<div><b>Buying Options: </b>{thisItem.buyingOptions[0]}</div>
							<div><b>Location: </b>{thisItem.itemLocation.city + ", " + thisItem.itemLocation.stateOrProvince}</div>
							<div><b>Listing Date: </b>{thisItem.itemCreationDate}</div>
							<br />
						</div>
						<div className="ebayItemPrice">
							{ itemURL
								? <a href={itemURL} target={itemURLTarget} rel="noreferrer">${thisItem.price.value + " " + thisItem.price.currency}</a>
								: "$" + thisItem.price.value + " " + thisItem.price.currency
							}
						</div>
						<br />
						<div className="ebayItemAddToCart">
							<AddToCartButton handler={addToShoppingCart} item={shoppingCartItem} itemID={thisItem.legacyItemId} />
							{ /* <GoToCartButton href={"/cart"} itemID={thisItem.legacyItemId} /> */}
						</div>

					</div>
				</div>
			</>
		);
	} else {
		return (
			<>
				<div id="ebayItems" className="ebayItems">
					<div className="centered">Loading...</div>
				</div>
			</>
		);
	}
}
