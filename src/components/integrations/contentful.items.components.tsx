"use client";

import React, { useState, useEffect } from "react";
import PropTypes, { InferProps } from "prop-types";
import { Carousel } from '../general/carousel';
import type { CarouselCardType } from "../general/carousel";
import { getContentfulEntriesByType, getContentfulEntryByEntryID } from "./contentful.delivery";
import { usePixelatedConfig } from '../config/config.client';
import { addToShoppingCart  } from "../shoppingcart/shoppingcart.functions";
import { AddToCartButton, /* GoToCartButton */ ViewItemDetails } from "../shoppingcart/shoppingcart.components";
import { getCloudinaryRemoteFetchURL as getImg} from "./cloudinary";
import type { ShoppingCartType } from "../shoppingcart/shoppingcart.functions";
// import { Loading, ToggleLoading } from "../general/pixelated.loading";	
import { SmartImage } from "../general/smartimage";
import "../../css/pixelated.grid.scss";
import "./contentful.items.css";
const debug = false;


let ContentfulApiProps = {
	proxyURL: 'https://proxy.pixelated.tech/prod/proxy?url=',
 	base_url: "https://cdn.contentful.com",
 	space_id: "soi9w77t7027",
 	environment: "master",
	management_access_token: "",
 	delivery_access_token: "muY9LfpCt4qoXosDsnRkkoH3DAVVuUFEuB0WRKRdBUM",
	preview_access_token: "",
};
const contentfulContentType: string = "item";


/* ========== CONTENTFUL ITEMS PAGE ========== */

ContentfulItems.propTypes = {
	apiProps: PropTypes.object.isRequired,
	cloudinaryProductEnv: PropTypes.string,
};
export type ContentfulItemsType = InferProps<typeof ContentfulItems.propTypes>;
export function ContentfulItems(props: ContentfulItemsType) {
	const [ items, setItems ] = useState<any[]>([]);
	const [ assets, setAssets ] = useState<any[]>([]);

	// Merge precedence: defaults < env vars < provider config < explicit props
	// const providerContentful = usePixelatedConfig()?.contentful;
	// const localContentfulApiProps = { ...ContentfulApiProps };
	/* if (providerContentful) {
		if (providerContentful.space_id) localContentfulApiProps.space_id = providerContentful.space_id;
		if (providerContentful.delivery_access_token) localContentfulApiProps.delivery_access_token = providerContentful.delivery_access_token;
		if (providerContentful.preview_access_token) localContentfulApiProps.preview_access_token = providerContentful.preview_access_token;
		if (providerContentful.base_url) localContentfulApiProps.base_url = providerContentful.base_url;
		if ((providerContentful as any).proxyURL) localContentfulApiProps.proxyURL = (providerContentful as any).proxyURL;
	} */
	const providerContentfulApiProps = usePixelatedConfig()?.contentful;
	const mergedApiProps = { ...ContentfulApiProps, ...providerContentfulApiProps, ...props.apiProps, };
	const [ apiProps ] = useState(mergedApiProps);

	paintItems.propTypes = {
		items: PropTypes.array.isRequired,
		assets: PropTypes.array.isRequired,
		cloudinaryProductEnv: PropTypes.string,
	};
    type paintItemsType = InferProps<typeof paintItems.propTypes>;
    function paintItems(props: paintItemsType){
    	if (debug) console.log("Painting Contentful Items");
    	let newItems = [];
    	for (let key in props.items) {
    		const item = props.items[key];
    		const itemImagesMatches = [];
    		const itemImages = item.fields.images ? item.fields.images : []	;
    		for (let imgKey in itemImages) {
    			const img = itemImages[imgKey];
    			const itemAssets = props.assets.filter( ( asset ) => (
    				asset.sys.id === img.sys.id
    			));
    			itemImagesMatches.push(...itemAssets);
    		}
    		itemImagesMatches.sort( (a, b) => {
    			return a.sys.createdAt < b.sys.createdAt ? -1 : 1;
    		});
    		if ( itemImagesMatches.length > 0 ) {
    			item.fields.imageUrl = itemImagesMatches[0].fields.file.url;
    			item.fields.imageAlt = itemImagesMatches[0].fields.title;
    		}
    		const newItem = <ContentfulListItem item={item} key={item.sys.id} 
    			cloudinaryProductEnv={props.cloudinaryProductEnv} />;
    		newItems.push(newItem);
    	}
    	return newItems;
    }

    async function fetchItems() {
    	try {
    		const response: any = await getContentfulEntriesByType({ 
    			apiProps: apiProps, 
    			contentType: contentfulContentType 
    		});
    		if (debug) console.log("Contentful API Get Items Data", response);
    		setItems(response.items);
    		setAssets(response.includes.Asset);
    	} catch (error) {
    		console.error("Error fetching Contentful items:", error);
    	}
    }

    useEffect(() => {
    	if (debug) console.log("Running useEffect");
    	// DISABLING FOR NOW TO AVOID LOADING TWICE 
    	// ToggleLoading(true);
    	fetchItems();
    	// ToggleLoading(false);
    }, []);

    if (items.length > 0 ) {
    	return (
    		<>
    			{ /* <Loading /> */ }
    			<div className="contentful-items-header">
    				{ items.length === 1
    					? <ContentfulItemHeader title={`${items.length} Featured Item`} />
    					: <ContentfulItemHeader title={`${items.length} Featured Items`} />
    				}
    			</div>
    			<div id="contentful-items" className="contentful-items">
    				{ paintItems({ items: items, assets: assets, cloudinaryProductEnv: props.cloudinaryProductEnv }) }
    			</div>
    		</>
    	);
    } else {
    	return (
    		<div id="contentful-items" className="contentful-items">
    			{ /* <Loading /> */ }
    		</div>
    	);
    }

}





/* ========== CONTENTFUL LIST ITEM ========== */

ContentfulListItem.propTypes = {
	item: PropTypes.any.isRequired,
	cloudinaryProductEnv: PropTypes.string,
};
export type ContentfulListItemType = InferProps<typeof ContentfulListItem.propTypes>;
export function ContentfulListItem(props: ContentfulListItemType) {
	const thisItem = props.item;
	const itemURL = "./store/" + thisItem.sys.id;
	const itemURLTarget = "_self"; 

	const shoppingCartItem: ShoppingCartType = {
		itemID: thisItem.sys.id,
		itemURL: itemURL,
		itemTitle: thisItem.fields.title,
		itemImageURL: thisItem.fields.imageUrl,
		itemQuantity: thisItem.fields.quantity,
		itemCost: thisItem.fields.price,
	};

	const itemImage = (props.cloudinaryProductEnv) 
		? getImg({url: "https://" + thisItem.fields.imageUrl, product_env: props.cloudinaryProductEnv}) 
		: thisItem.fields.imageUrl;

	const config = usePixelatedConfig();
	const imgComponent = <SmartImage src={itemImage} title={thisItem.fields.title} alt={thisItem.fields.title} 
		cloudinaryEnv={config?.cloudinary?.product_env ?? undefined}
		cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
		cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined} />;
	// <img src={itemImage} title={thisItem.fields.title} alt={thisItem.fields.title} />
	
	return (
		<div className="contentful-item row-12col">
			<div className="contentful-item-photo grid-s1-e5">
				{ itemURL
					? <a href={itemURL} target={itemURLTarget} rel="noopener noreferrer">{ imgComponent }</a>
					: ( imgComponent )
				}
			</div>
			<div className="contentful-item-body grid-s5-e13">
				<div className="contentful-item-header">
					{ itemURL
						? <ContentfulItemHeader url={itemURL} target={itemURLTarget} title={thisItem.fields.title} />
						: <ContentfulItemHeader title={thisItem.fields.title} />
					}
				</div>
				<div className="contentful-item-details grid12">
					<div><b>Item ID: </b>{thisItem.sys.id}</div>
					<div><b>UPC ID: </b>{thisItem.fields.id}</div>
					<div><b>Quantity: </b>{thisItem.fields.quantity}</div>
					<div><b>Brand / Model: </b>{thisItem.fields.brand} {thisItem.fields.model}</div>
					<div><b>Listing Date: </b>{thisItem.fields.date}</div>
				</div>
				<div className="contentful-item-price">
					{ itemURL
						? <a href={itemURL} target={itemURLTarget} rel="noreferrer">${thisItem.fields.price} USD</a>
						: "$" + thisItem.fields.price + " USD"
					}
				</div>
				<br />
				<div className="contentful-item-addtocart">
					<ViewItemDetails href={"/store"} itemID={thisItem.sys.id} />
					<AddToCartButton handler={addToShoppingCart} item={shoppingCartItem} itemID={thisItem.sys.id} />
					{ /* <GoToCartButton href={"/cart"} itemID={thisItem.sys.id} /> */}
				</div>
			</div>
		</div>
	);
}





/* ========== CONTENTFUL ITEM HEADER ========== */

ContentfulItemHeader.propTypes = {
	title: PropTypes.string.isRequired,
	url: PropTypes.string,
	target: PropTypes.string,
};
export type ContentfulItemHeaderType = InferProps<typeof ContentfulItemHeader.propTypes>;
export function ContentfulItemHeader(props: ContentfulItemHeaderType) {
	return (
		<span>
			{ props.url
				? <a href={props.url} target={props.target ?? ''} rel="noopener noreferrer"><h2 className="">{props.title}</h2></a>
				: <h2 className="">{props.title}</h2>
			}
		</span>
	);
}





/* ========== CONTENTFUL ITEM DETAIL PAGE ========== */

ContentfulItemDetail.propTypes = {
	apiProps: PropTypes.object.isRequired,
	entry_id: PropTypes.string.isRequired,
	cloudinaryProductEnv: PropTypes.string,
};
export type ContentfulItemDetailType = InferProps<typeof ContentfulItemDetail.propTypes>;
export function ContentfulItemDetail(props: ContentfulItemDetailType)  {
	const [ item, setItem ] = useState({});
	 
	const [ assets, setAssets ] = useState({});
	const [ cards, setCards ] = useState<CarouselCardType[]>([]);

	const providerContentfulApiProps = usePixelatedConfig()?.contentful;
	const [ apiProps ] = useState({ ...ContentfulApiProps, ...providerContentfulApiProps, ...props.apiProps });

	useEffect(() => {
		if (debug) console.log("Running useEffect");
		async function fetchStuff() {
			try {
				// Get Item Data From Entry ID
				const entryResponse: any = await getContentfulEntryByEntryID({ 
					apiProps: apiProps, 
					entry_id: props.entry_id });
				if (debug) console.log("Contentful API Get Item Data", entryResponse);
				const item = entryResponse;
				setItem(item);

				// Get Item Assets From Entries
				const assetsResponse: any = await getContentfulEntriesByType({ 
					apiProps: apiProps, 
					contentType: contentfulContentType 
				});
				if (debug) console.log("Contentful API Get Contentful Assets Data", assetsResponse);
				const assetImages = assetsResponse.includes.Asset;
				setAssets(assetImages);

				// Get Item Image URLs From Item Images and Entry Assets
				const itemImages = item.fields.images ? item.fields.images : []	;
				const imageCards : CarouselCardType[] = [];
				for (let imgKey in itemImages) {
					const img = itemImages[imgKey];
					const itemAsset = assetImages.filter( ( asset: any ) => (
						asset.sys.id === img.sys.id
					));
					/* Contentful Asset URLs start with two slashes */
					const absURL = (itemAsset[0].fields.file.url.startsWith("//")) 
						? "https:" + itemAsset[0].fields.file.url
						: itemAsset[0].fields.file.url;
					if ( itemAsset.length > 0 ) {
						imageCards.push({
							index: Number(imgKey),
							cardIndex: imageCards.length,
							cardLength: itemImages.length,
							image: absURL,
							imageAlt: itemAsset[0].fields.title,
							headerText: "",
							bodyText: "",
							link: "",
							linkTarget: "_self"
						});
					}
				}
				setCards(imageCards);
				
			} catch (error) {
				console.error("Error fetching Contentful item images and assets:", error);
			}
		}
		fetchStuff();
	}, [props.entry_id, apiProps]);

	if ( item && Object.keys(item) && Object.keys(item).length > 0 ) {
		const thisItem = { ...item } as any;
		if (debug) console.log(thisItem);
		
		const itemURL = undefined;
		const itemURLTarget = "_self"; 
		
		const shoppingCartItem: ShoppingCartType = {
			itemID: thisItem.sys.id,
			itemURL: itemURL,
			itemTitle: thisItem.fields.title,
			itemImageURL: thisItem.fields.imageUrl,
			itemQuantity: thisItem.fields.quantity,
			itemCost: thisItem.fields.price,
		};
		
		shoppingCartItem.itemURL = itemURL;
		return (
			<>
				<div className="contentful-item row-12col">
					<div className="contentful-item-header grid-s1-e13">
						{ itemURL
							? <ContentfulItemHeader url={itemURL} title={thisItem.fields.title} />
							: <ContentfulItemHeader title={thisItem.fields.title} />
						}
					</div>
					<br />
					<div className="contentful-item-photo-carousel grid-s1-e7">
						<Carousel 
							cards={cards} 
							draggable={true} 
							imgFit={"contain"}
						/>
					</div>
					<div className="grid-s7-e13">
						<div className="contentful-item-details grid12">
							<div dangerouslySetInnerHTML={{ __html: thisItem.fields.description.replace(/(<br\s*\/?>\s*){2,}/gi, '') }} />
						</div>
						<br />
						<div className="contentful-item-details grid12">
							<div><b>Item ID: </b>{thisItem.sys.id}</div>
							<div><b>UPC ID: </b>{thisItem.fields.id}</div>
							<div><b>Quantity: </b>{thisItem.fields.quantity}</div>
							<div><b>Brand / Model: </b>{thisItem.fields.brand} {thisItem.fields.model}</div>
							<div><b>Listing Date: </b>{thisItem.fields.date}</div>
							<br />
						</div>
						<div className="contentful-item-price">
							{ itemURL
								? <a href={itemURL} target={itemURLTarget} rel="noreferrer">${thisItem.fields.price} USD</a>
								: "$" + thisItem.fields.price + " USD"
							}
						</div>
						<br />
						<div className="contentful-item-addtocart">
							<AddToCartButton handler={addToShoppingCart} item={shoppingCartItem} itemID={thisItem.sys.id} />
						</div>

					</div>
				</div>
			</>
		);
	} else {
		return (
			<>
				<div id="contentful-items" className="contentful-items">
					<div className="centered">Loading...</div>
				</div>
			</>
		);
	}
} 
