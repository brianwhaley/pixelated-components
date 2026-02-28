'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';

/**
 * Recipe Schema Component
 * Generates JSON-LD structured data for recipes
 * https://schema.org/Recipe
 */

/**
 * RecipeSchema — embeds a recipe as JSON-LD for SEO (schema.org/Recipe).
 *
 * @param {shape} [props.recipe] - Recipe object conforming to schema.org/Recipe; will be serialized as JSON-LD.
 * @param {string} [props.name] - Recipe title.
 * @param {string} [props.description] - Short recipe description.
 * @param {shape} [props.author] - Author information (name and @type).
 * @param {string} [props.datePublished] - ISO date the recipe was published.
 * @param {string} [props.image] - Primary image URL for the recipe.
 * @param {string} [props.recipeYield] - Yield or serving size (e.g., '4 servings').
 * @param {string} [props.prepTime] - Prep time in ISO 8601 duration (e.g. 'PT20M').
 * @param {string} [props.cookTime] - Cook time in ISO 8601 duration.
 * @param {string} [props.totalTime] - Total time in ISO 8601 duration.
 * @param {string} [props.recipeCategory] - Category of the recipe (e.g., 'Dessert').
 * @param {string} [props.recipeCuisine] - Cuisine (e.g., 'Italian').
 * @param {arrayOf} [props.recipeIngredient] - List of ingredient strings.
 * @param {arrayOf} [props.recipeInstructions] - Structured list of instruction steps or paragraphs.
 * @param {string} [props.license] - License URL or short string for the recipe content.
 */
RecipeSchema.propTypes = {
/** Recipe information object to be serialized as JSON-LD. */
	recipe: PropTypes.shape({
		'@context': PropTypes.string.isRequired,
		'@type': PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		description: PropTypes.string,
		author: PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		}),
		datePublished: PropTypes.string,
		image: PropTypes.string,
		recipeYield: PropTypes.string,
		prepTime: PropTypes.string,
		cookTime: PropTypes.string,
		totalTime: PropTypes.string,
		recipeCategory: PropTypes.string,
		recipeCuisine: PropTypes.string,
		recipeIngredient: PropTypes.arrayOf(PropTypes.string),
		recipeInstructions: PropTypes.arrayOf(PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			text: PropTypes.string.isRequired,
		})),
		license: PropTypes.string,
	}).isRequired,
};
export type RecipeSchemaType = InferProps<typeof RecipeSchema.propTypes>;
export function RecipeSchema(props: RecipeSchemaType) {
	const { recipe } = props;
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(recipe) }}
		/>
	);
}

export default RecipeSchema;
