import React from 'react';
import { RecipeBook } from '@/components/general/recipe';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';
import RecipeData from '@/data/recipes.json';
import '@/css/pixelated.global.css';

const mockConfig = {
	cloudinary: {
		product_env: 'dlbon7tpq',
		baseUrl: 'https://res.cloudinary.com',
		transforms: 'f_auto,c_limit,q_auto,dpr_auto',
	},
};

const categories = ['bread', 'appetizer', 'dinner', 'slow cooker', 'side dish', 'salad', 'dessert'];

export default {
	title: 'Structured',
	component: RecipeBook,
	decorators: [
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(Story) => (
			<PixelatedClientConfigProvider config={mockConfig}>
				<Story />
			</PixelatedClientConfigProvider>
		),
	],
};

export const BTW_Recipe = {
	args: {
		recipeData: RecipeData,
		recipeCategories: categories
	}
};
