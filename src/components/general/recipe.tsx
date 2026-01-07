'use client';

import React, { useState, useEffect, JSX } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SmartImage } from './smartimage';
import { usePixelatedConfig } from '../config/config.client';
import './recipe.css';

/* 
TODO #9 Recipe Component: Change URL so you can deep link to a specific recipe
TODO: #22 Recipe Component: Convert to TypeScript
*/


/* http://microformats.org/wiki/h-recipe */


/* ========== RECIPE HELPERS ========== */
/* Maps schema.org Recipe format to component display format */


export type RecipeOutputType = {
	name: string;
	photo: string;
	summary: string;
	author: string;
	published: string;
	duration: string;
	yield: string;
	ingredients: string[];
	instructions: string[];
	category: string[];
	license: string;
};

export function mapSchemaRecipeToDisplay(schemaRecipe: any): RecipeOutputType {
	// Parse ISO 8601 duration and convert to readable format
	function parseDuration(iso8601: string): string {
		if (!iso8601 || iso8601 === 'PT0M') return '';
		
		const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
		const match = iso8601.match(regex);
		
		if (!match) return iso8601;
		
		const hours = match[1] ? parseInt(match[1]) : 0;
		const minutes = match[2] ? parseInt(match[2]) : 0;
		
		if (hours > 0 && minutes > 0) {
			return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
		} else if (hours > 0) {
			return `${hours} hour${hours > 1 ? 's' : ''}`;
		} else if (minutes > 0) {
			return `${minutes} minutes`;
		}
		
		return '';
	}
	
	// Extract author name
	const authorName = typeof schemaRecipe.author === 'string'
		? schemaRecipe.author
		: schemaRecipe.author?.name || '';
	
	// Convert instructions from HowToStep format to plain text
	const instructions = Array.isArray(schemaRecipe.recipeInstructions)
		? schemaRecipe.recipeInstructions.map((instruction: any) =>
			typeof instruction === 'string' ? instruction : instruction.text || ''
		)
		: [];
	
	// Combine cook and prep times for display
	let displayDuration = '';
	if (schemaRecipe.totalTime) {
		displayDuration = parseDuration(schemaRecipe.totalTime);
	}
	
	return {
		name: schemaRecipe.name || '',
		photo: schemaRecipe.image || '',
		summary: schemaRecipe.description || '',
		author: authorName,
		published: schemaRecipe.datePublished || '',
		duration: displayDuration,
		yield: schemaRecipe.recipeYield || '',
		ingredients: schemaRecipe.recipeIngredient || [],
		instructions,
		category: schemaRecipe.recipeCategory ? [schemaRecipe.recipeCategory] : [],
		license: schemaRecipe.license || ''
	};
}

/* ========== RECIPE TYPES ========== */


type RecipeType = {
	'@context': string;
	'@type': string;
	name: string;
	description: string;
	author: {
		'@type': string;
		name: string;
	};
	recipeYield: string;
	prepTime: string;
	cookTime: string;
	totalTime: string;
	recipeCategory: string;
	recipeCuisine: string;
	recipeIngredient: string[];
	recipeInstructions: Array<{
		'@type': string;
		text: string;
	}>;
	license?: string;
	image?: string;
	datePublished?: string;
};




type RecipeDataType = {
	items: RecipeType[];
};



/* ========== RECIPE BOOK ========== */
RecipeBook.propTypes = {
	recipeData: PropTypes.shape({
		items: PropTypes.array.isRequired
	}).isRequired,
	recipeCategories: PropTypes.array.isRequired
};
export type RecipeBookType = InferProps<typeof RecipeBook.propTypes>;
export function RecipeBook(props: RecipeBookType) {
	
	const [ recipeElems ] = useState( generateMyElems() );
	const [ outputElems, setOutputElems ] = useState<React.ReactElement[]>([]); 
	const [ showOnlyCat, setShowOnlyCat ] = useState('');
	const [ showOnlyRecipe, setShowOnlyRecipe ] = useState(''); 

	function generateMyElems () {
		const myElems: any[] = [];
		const recipeBookItems = props.recipeData.items as RecipeType[];
		for (const catKey in props.recipeCategories) {
			const category: any = props.recipeCategories[catKey];
			myElems[category] = [];
			for (const recipeKey in recipeBookItems as RecipeType[]) {
				const recipe = recipeBookItems[recipeKey] as RecipeType;
				const outputRecipe = mapSchemaRecipeToDisplay(recipe);
				const recipeCat = outputRecipe.category;
				if (recipeCat.includes(category)) {
					myElems[category].push(outputRecipe);
				}
			}
		}
		return myElems;
	}

	function outputMyElems () {
		const myElems = [];
		let catKey = 1;
		for (const category in recipeElems) {
			const cID = 'c' + (catKey);
			myElems.push(<RecipeCategory key={cID} id={cID} className='h-recipe-category' category={category} showOnly={showOnlyCat} />);
			for (const recipeKey in recipeElems[category]) {
				const recipe = recipeElems[category][recipeKey] as RecipeOutputType;
				const cats = recipe.category;
				const rID = cID + '-r' + (parseInt(recipeKey, 10) + 1);
				if (cats.includes(category)) {
					myElems.push(<RecipeBookItem key={rID} id={rID} recipeData={recipe} showOnly={showOnlyRecipe} />);
				}
			}
			catKey += 1;
		}
		return myElems;
	}

	useEffect(() => {
		setOutputElems( outputMyElems() );
	}, [ showOnlyCat, showOnlyRecipe ]);

	// Deep linking: read URL hash on mount and select recipe if present
	useEffect(() => {
		const hash = window.location.hash.replace('#', '');
		if (hash && hash.length > 0) {
			onRecipePickListChange(hash);
		}
	}, []); // Empty dependency array - only run on mount

	function onRecipePickListChange (optionVal: string) {
		let cID, rID;
		if (optionVal.includes('-')) {
			cID = optionVal.substring(0, optionVal.indexOf('-'));
			rID = optionVal;
		} else {
			cID = optionVal;
			rID = optionVal;
		}
		setShowOnlyCat(cID);
		setShowOnlyRecipe(rID);
		setOutputElems(outputMyElems());
		window.location.hash = rID;
	}

	return (
		<div id="recipes">
			<BackToTop />
			<RecipePickList 
				recipeData={props.recipeData} 
				recipeCategories={props.recipeCategories} 
				handleRecipePickListChange={onRecipePickListChange} 
			/>
			{ outputElems }
		</div>
	);
}



/* ========== RECIPE CATEGORY ========== */
RecipeCategory.propTypes = {
	id: PropTypes.string.isRequired,
	className: PropTypes.string.isRequired,
	category: PropTypes.string.isRequired,
	showOnly: PropTypes.string.isRequired
};
export type RecipeCategoryType = InferProps<typeof RecipeCategory.propTypes>;
export function RecipeCategory(props: RecipeCategoryType) {
	const isHidden = ((props.showOnly.length > 0) && (!(props.id.includes(props.showOnly))) 
		? { display: 'none' } 
		: { display: 'initial' });
	return (
		<h2 id={props.id} className={props.className} style={isHidden}>{props.category}</h2>
	);
}



/* ========== RECIPE ========== */
RecipeBookItem.propTypes = {
	recipeData: PropTypes.object.isRequired,
	id: PropTypes.string.isRequired,
	showOnly: PropTypes.string.isRequired
};
export type RecipeBookItemType = InferProps<typeof RecipeBookItem.propTypes>;
export function RecipeBookItem (props: RecipeBookItemType) {
	
	const config = usePixelatedConfig();

	const recipe: RecipeOutputType = props.recipeData as RecipeOutputType;
	const ingredients = recipe.ingredients.map((ingredient: string, iKey: number) =>
		<li key={iKey} className="p-ingredient">{ingredient}</li>
	);
	const instructions = recipe.instructions.map((instruction: string, iKey: number) =>
		<li key={iKey} className="p-instruction">{instruction}</li>
	);
	/* ? <img className='u-photo' src={recipe.photo} title={recipe.name} alt={recipe.name} /> */
	const recipeImage = (recipe.photo.length > 0 
		? <SmartImage className='u-photo' src={recipe.photo} title={recipe.name} alt={recipe.name}
			cloudinaryEnv={config?.cloudinary?.product_env ?? undefined}
			cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
			cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined}
		 />
		: null);
	const isHidden = ((props.showOnly.length > 0) && (!(props.id.includes(props.showOnly))) ? { display: 'none' } : { display: 'initial' });
	/* event.preventDefault(); */
	
	return (
		<article id={props.id} className="h-recipe" style={isHidden}>
			{ /* name < - > id */ }
			<h3 className="p-name"><a id={props.id} href={`#${props.id}`} onClick={() => { return false; }}>{recipe.name}</a></h3>
			{ recipeImage }
			<p className="p-summary">{recipe.summary}</p>
			<p>&nbsp;</p>
			<p className="p-author">Author: {recipe.author}</p>
			<p className="p-published">Published: {recipe.published}</p>
			<p className="dt-duration">Duration: {recipe.duration}</p>
			<p className="p-yield">Yield: {recipe.yield}</p>
			<h4 className="e-ingredients">Ingredients</h4>
			<ul>
				{ ingredients }
			</ul>
			<h4 className="e-instructions">Instructions</h4>
			<ol>
				{ instructions }
			</ol>
		</article>
	);
}


/* ========== RECIPE PICK LIST ========== */
RecipePickList.propTypes = {
	recipeData: PropTypes.object.isRequired,
	recipeCategories: PropTypes.array.isRequired,
	handleRecipePickListChange: PropTypes.func.isRequired
};
export type RecipePickListType = InferProps<typeof RecipePickList.propTypes>;
export function RecipePickList(props: RecipePickListType) {

	const [recipeOptions, setRecipeOptions] = useState<JSX.Element[]>([]);

	function generateMyOptions () {
		const myOpts = [];
		myOpts.push(<option key='x0' value=''>Choose a recipe below:</option>);
		for (const catKey in props.recipeCategories) {
			const category = props.recipeCategories[catKey];
			const cID = 'c' + (parseInt(catKey, 10) + 1);
			myOpts.push(<option key={cID} value={cID}>=== {category.toUpperCase()} ===</option>);
			let rID = 1;
			const recipeData = props.recipeData as RecipeDataType;
			const recipeDataItems = recipeData.items as RecipeType[];
			for (const recipeKey in recipeDataItems) {
				const recipe = recipeDataItems[recipeKey];
				const outputRecipe = mapSchemaRecipeToDisplay(recipe);
				const cats = outputRecipe.category;
				if (cats.includes(category)) {
					myOpts.push(<option key={cID + '-r' + rID} value={cID + '-r' + rID}>{outputRecipe.name}</option>);
					rID += 1;
				}
			}
		}
		return myOpts;
	}

	function recipeListChanged (e: React.ChangeEvent<HTMLSelectElement>) {
		if (e.target.value.length > 0) {
			props.handleRecipePickListChange(e.target.value);
		} else {
			props.handleRecipePickListChange('');
		}
	}

	useEffect(() => {
		setRecipeOptions( generateMyOptions() );
	}, [props.recipeData, props.recipeCategories]);

	return (
		<form>
			<select id="recipe-list" name="recipe-list" onChange={recipeListChanged}>
				{ recipeOptions }
			</select>
		</form>
	);
}

/* ========== RECIPE BACK TO TOP ========== */
BackToTop.propTypes = {};
export type BackToTopType = InferProps<typeof BackToTop.propTypes>;
export function BackToTop() {
	function scrollToTop(){
		window.scroll({
			top: 0,
			left: 0,
			behavior: 'smooth'
		});
		return false;
	}
	const config = usePixelatedConfig();
	return (
		<div className="backToTop">
			<a href="#top" onClick={scrollToTop}>
				<div>
					{ /* <img src="/images/icons/up.jpg" title="Back To Top" alt="Back To Top" /> */ }
					<SmartImage src="/images/icons/up.jpg" title="Back To Top" alt="Back To Top"
						cloudinaryEnv={config?.cloudinary?.product_env ?? undefined}
						cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
						cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined}
					/>
				</div>
				<div>Back To Top</div>
			</a>
		</div>
	);
}
