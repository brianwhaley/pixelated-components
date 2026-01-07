import React from 'react';
import PropTypes, { InferProps } from 'prop-types';

/**
 * Recipe Schema Component
 * Generates JSON-LD structured data for recipes
 * https://schema.org/Recipe
 */

RecipeSchema.propTypes = {
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
