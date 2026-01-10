import React from 'react';
import { RecipeBook } from '@/components/general/recipe';
import RecipeData from '@/data/recipes.json';
import '@/css/pixelated.global.css';

const categories = ['bread', 'appetizer', 'dinner', 'slow cooker', 'side dish', 'salad', 'dessert'];

export default {
	title: 'General',
	component: RecipeBook,
};

export const Recipe_Book = {
	args: {
		recipeData: RecipeData,
		recipeCategories: categories
	}
};
