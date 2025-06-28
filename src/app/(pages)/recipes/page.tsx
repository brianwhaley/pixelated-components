"use client";

import React from "react";
import { PageHeader } from "@/app/components/general/pixelated.general";
import { RecipeBook } from "@brianwhaley/pixelated-components";
import RecipeData from "@/app/data/recipes.json";

export default function Recipes() {
	const recipeCategories = ["bread", "appetizer", "dinner", "slow cooker", "side dish", "salad", "dessert"];
	return (
		<div className="section-container">
			<PageHeader title="Pace, Barbano, and Whaley Family Recipes" />
			<div>&nbsp;</div>
			<RecipeBook recipeData={RecipeData} recipeCategories={recipeCategories} />
		</div>
	);
}
