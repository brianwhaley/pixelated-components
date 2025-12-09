"use client";

import React from "react";
import { PageTitleHeader, PageSection } from "@pixelated-tech/components";
import { RecipeBook } from "@pixelated-tech/components";
import RecipeData from "@/app/data/recipes.json";

export default function Recipes() {
	const recipeCategories = ["bread", "appetizer", "dinner", "slow cooker", "side dish", "salad", "dessert"];

	return (
		<PageSection columns={1} id="recipes-container">
			<PageTitleHeader title="Pace, Barbano, and Whaley Family Recipes" />
			<div>&nbsp;</div>
			<RecipeBook recipeData={RecipeData} recipeCategories={recipeCategories} />
		</PageSection>
	);
}
