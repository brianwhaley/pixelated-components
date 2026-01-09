import React from 'react';
import { RecipeBook } from '@/components/general/recipe';
import RecipeData from '@/data/recipes.json';
import '@/css/pixelated.global.css';

const categories = ['bread', 'appetizer', 'dinner', 'slow cooker', 'side dish', 'salad', 'dessert'];

export default {
	title: 'Structured',
	component: RecipeBook,
};

export const BTW_Recipe = {
	args: {
		recipeData: RecipeData,
		recipeCategories: categories
	}
};
