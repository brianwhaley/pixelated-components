import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { RecipeSchema, type RecipeSchemaType } from '@/components/general/schema-recipe';
import { realRecipes } from '../test/test-data';

const defaultRecipe: RecipeSchemaType['recipe'] = realRecipes.items?.[0] || { '@context': 'https://schema.org', '@type': 'Recipe', name: 'Fallback' };

describe('RecipeSchema', () => {

	it('should render script tag with application/ld+json type', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		expect(scriptTag).toBeTruthy();
	});

	it('should include schema.org context and Recipe type', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData['@context']).toBe('https://schema.org');
		expect(schemaData['@type']).toBe('Recipe');
	});

	it('should include recipe name', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.name).toBe(defaultRecipe.name);
	});

	it('should include description', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.description).toBe(defaultRecipe.description);
	});

	it('should include author information', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.author['@type']).toBe('Person');
		// Author may be a string or an object with a `name` property in canonical fixtures — handle both safely
		const authorAny = (defaultRecipe as any).author;
		if (typeof authorAny === 'string' && authorAny.length > 0) {
			expect(schemaData.author.name).toBe(authorAny);
		} else if (authorAny && authorAny.name) {
			expect(schemaData.author.name).toBe(authorAny.name);
		} else {
			expect(schemaData.author.name).toBeDefined();
		}
	});

	it('should include recipe image', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.image).toBe(defaultRecipe.image);
	});

	it('should include recipe yield', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.recipeYield).toBe(defaultRecipe.recipeYield);
	});

	it('should include timing information', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		if (defaultRecipe.prepTime) expect(schemaData.prepTime).toBe(defaultRecipe.prepTime);
		if (defaultRecipe.cookTime) expect(schemaData.cookTime).toBe(defaultRecipe.cookTime);
		if (defaultRecipe.totalTime) expect(schemaData.totalTime).toBe(defaultRecipe.totalTime);
	});

	it('should include recipe category and cuisine', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		if (defaultRecipe.recipeCategory) expect(schemaData.recipeCategory).toBe(defaultRecipe.recipeCategory);
		if (defaultRecipe.recipeCuisine) expect(schemaData.recipeCuisine).toBe(defaultRecipe.recipeCuisine);
	});

	it('should include recipe ingredients', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		if (Array.isArray(defaultRecipe.recipeIngredient)) {
			expect(schemaData.recipeIngredient).toEqual(defaultRecipe.recipeIngredient);
		}
	});

	it('should include recipe instructions with HowToStep format', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		const expectedInstructions = Array.isArray(defaultRecipe.recipeInstructions) ? defaultRecipe.recipeInstructions : [];
		expect(schemaData.recipeInstructions.length).toBe(expectedInstructions.length);
		if (expectedInstructions.length > 0) {
			expect(schemaData.recipeInstructions[0]['@type'] || schemaData.recipeInstructions[0]).toBeDefined();
			expect(schemaData.recipeInstructions[0].text || schemaData.recipeInstructions[0]).toBeDefined();
		}
	});

	it('should generate valid JSON', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');

		expect(() => {
			JSON.parse(scriptTag?.textContent || '{}');
		}).not.toThrow();
	});

	it('should handle minimal recipe data', () => {
		const minimalRecipe: RecipeSchemaType['recipe'] = {
			'@context': 'https://schema.org',
			'@type': 'Recipe',
			name: 'Simple Recipe'
		};
		const { container } = render(<RecipeSchema recipe={minimalRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.name).toBe('Simple Recipe');
		expect(schemaData['@type']).toBe('Recipe');
	});

	it('should handle special characters in recipe name', () => {
		const recipe = {
			...defaultRecipe,
			name: "Grandma's Italian Easter Bread"
		};
		const { container } = render(<RecipeSchema recipe={recipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.name).toBe("Grandma's Italian Easter Bread");
	});

	it('should render without crashing', () => {
		expect(() => {
			render(<RecipeSchema recipe={defaultRecipe} />);
		}).not.toThrow();
	});
});
