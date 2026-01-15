"use client";

import React, { useState, useEffect } from "react";
import PropTypes, { InferProps } from "prop-types";
import { Carousel } from '../general/carousel';
import { SmartImage } from "../general/smartimage";
import { getEbayItems, getEbayItem, getShoppingCartItem, getEbayRateLimits, getEbayAppToken } from "./ebay.functions";
import { addToShoppingCart } from "./shoppingcart.functions";
import { AddToCartButton, /* GoToCartButton */ ViewItemDetails } from "./shoppingcart.components";
import { getCloudinaryRemoteFetchURL as getImg} from "../integrations/cloudinary";
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
	const config = usePixelatedConfig();
	const [ items, setItems ] = useState<any[]>([]);
	const [ aspects, setAspects ] = useState<any[]>([]);
	const apiProps = { ...(config?.ebay || {}), ...props.apiProps };

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
				apiProps={apiProps}
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
	apiProps: PropTypes.any,
};
export type EbayListItemType = InferProps<typeof EbayListItem.propTypes>;
export function EbayListItem(props: EbayListItemType) {
	const thisItem = props.item;
	const apiProps = props.apiProps;
	// const itemURL = thisItem.itemWebUrl;
	const itemURL = "./store/" + thisItem.legacyItemId;
	const itemURLTarget = "_self"; /* "_blank" */
	const itemImage = (props.cloudinaryProductEnv) 
		? getImg({url: thisItem.thumbnailImages[0].imageUrl, product_env: props.cloudinaryProductEnv}) 
		: thisItem.thumbnailImages[0].imageUrl;
	const shoppingCartItem = getShoppingCartItem({ thisItem: thisItem, cloudinaryProductEnv: props.cloudinaryProductEnv, apiProps: apiProps });
	// CHANGE EBAY URL TO LOCAL EBAY ITEM DETAIL URL
	shoppingCartItem.itemURL = itemURL;
	const config = usePixelatedConfig();
	const itemImageComponent = <SmartImage src={itemImage} title={thisItem.title} alt={thisItem.title} 
		cloudinaryEnv={props.cloudinaryProductEnv ?? undefined}
		cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
		cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined} />;
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
					<div><b>Quantity: </b>{thisItem.categories[0].categoryId == apiProps.itemCategory ? 1 : 10}</div>
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
	const config = usePixelatedConfig();
	const [ item, setItem ] = useState({});
	const apiProps = { ...(config?.ebay || {}), ...props.apiProps };
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
		const shoppingCartItem = getShoppingCartItem({thisItem: thisItem, cloudinaryProductEnv: props.cloudinaryProductEnv, apiProps: apiProps });
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
							<div><b>Quantity: </b>{thisItem.categoryId == apiProps.itemCategory ? 1 : 10}</div>
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


/* ========== EBAY RATE LIMITS VISUALIZER ========== */

EbayRateLimitsVisualizer.propTypes = {
	token: PropTypes.string,
	apiProps: PropTypes.object,
};
export type EbayRateLimitsVisualizerType = InferProps<typeof EbayRateLimitsVisualizer.propTypes>;
export function EbayRateLimitsVisualizer(props: EbayRateLimitsVisualizerType) {
	const config = usePixelatedConfig();
	const apiProps = { 
		...(config?.ebay || {}), 
		...props.apiProps 
	};

	const [token, setToken] = useState(props.token || '');
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [fetchingToken, setFetchingToken] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchToken = async () => {
		setFetchingToken(true);
		setError(null);
		try {
			const newToken = await getEbayAppToken({ apiProps });
			if (newToken) {
				setToken(newToken);
				return newToken;
			} else {
				setError('Failed to fetch eBay token. Check your appId and appCertId.');
			}
		} catch (e: any) {
			setError('Token fetch error: ' + e.message);
		} finally {
			setFetchingToken(false);
		}
	};

	// Auto-fetch token on mount if credentials are available
	useEffect(() => {
		if (!token && apiProps.appId && apiProps.appCertId) {
			fetchToken();
		}
	}, []);

	const fetchData = async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await getEbayRateLimits({ 
				token: token, 
				apiProps: apiProps
			});
			setData(result);
		} catch (e: any) {
			setError(e.message || 'Failed to fetch data');
		} finally {
			setLoading(false);
		}
	};

	const showMockData = () => {
		setData({
			rate_limit: {
				apiContext: "Buy",
				apiName: "Browse",
				apiVersion: "v1",
				resources: [
					{
						resourceName: "item_summary",
						methods: [
							{
								methodName: "search",
								quotaTotal: 5000,
								quotaRemaining: 4950,
								quotaResets: "2026-01-10T00:00:00.000Z"
							}
						]
					}
				]
			},
			user_rate_limit: {
				userContext: "Individual",
				resources: [
					{
						resourceName: "item",
						methods: [
							{
								methodName: "get",
								quotaTotal: 1000,
								quotaRemaining: 990,
								quotaResets: "2026-01-10T00:00:00.000Z"
							}
						]
					}
				]
			}
		});
	};

	// Check for API-level errors in the returned data
	const hasTokenError = data?.rate_limit?.errors?.[0]?.message === "Invalid access token" || 
						 data?.user_rate_limit?.errors?.[0]?.message === "Invalid access token";

	return (
		<div style={{ padding: '20px', fontFamily: 'sans-serif', border: '1px solid #ddd', borderRadius: '8px' }}>
			<h3>Ebay Rate Limits Data Visualizer</h3>
			
			<div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
					<label htmlFor="ebay-token"><b>Token:</b></label>
					<input 
						id="ebay-token"
						type="text" 
						value={token} 
						onChange={(e) => setToken(e.target.value)} 
						placeholder="Paste eBay token here"
						style={{ flexGrow: 1, padding: '5px', fontFamily: 'monospace' }}
					/>
					<button onClick={fetchToken} disabled={fetchingToken || !apiProps.appId}>
						{fetchingToken ? 'Fetching Token...' : 'Auto-Fetch Token'}
					</button>
				</div>
				
				<div style={{ display: 'flex', gap: '10px' }}>
					<button 
						onClick={fetchData} 
						disabled={loading || !token} 
						style={{ padding: '8px 16px', cursor: 'pointer', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
					>
						{loading ? 'Fetching Limits...' : 'Fetch Rate Limits'}
					</button>
					<button onClick={showMockData} style={{ padding: '8px 16px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}>
						Load Sample Structure
					</button>
				</div>
			</div>

			{error && (
				<div style={{ color: '#d00', background: '#fff5f5', padding: '10px', borderRadius: '4px', marginBottom: '10px', border: '1px solid #feb2b2' }}>
					<b>Error:</b> {error}
				</div>
			)}

			{hasTokenError && (
				<div style={{ color: '#c53030', background: '#fff5f5', padding: '10px', borderRadius: '4px', marginBottom: '10px', border: '1px solid #feb2b2' }}>
					🚨 <b>Authentication Error:</b> Your eBay access token is invalid or expired. Use &quot;Auto-Fetch Token&quot; if credentials are set, or paste a new one.
				</div>
			)}

			{data ? (
				<div style={{ marginTop: '20px' }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<h4>Response Data:</h4>
						<button onClick={() => setData(null)} style={{ padding: '4px 8px', fontSize: '12px' }}>Clear</button>
					</div>
					<pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', overflow: 'auto', border: '1px solid #e9ecef', fontSize: '13px' }}>
						{JSON.stringify(data, null, 2)}
					</pre>
				</div>
			) : (
				<div style={{ color: '#666', fontStyle: 'italic', marginTop: '20px' }}>
					No rate limit data loaded yet.
				</div>
			)}
		</div>
	);
}
