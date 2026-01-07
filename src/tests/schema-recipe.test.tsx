import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { RecipeSchema, type RecipeSchemaType } from '@/components/general/schema-recipe';

describe('RecipeSchema', () => {
	const defaultRecipe: RecipeSchemaType['recipe'] = {
		'@context': 'https://schema.org',
		'@type': 'Recipe',
		name: 'Test Recipe',
		description: 'A delicious test recipe',
		author: {
			'@type': 'Person',
			name: 'Test Author'
		},
		image: 'https://example.com/recipe.jpg',
		recipeYield: '4 servings',
		prepTime: 'PT15M',
		cookTime: 'PT30M',
		totalTime: 'PT45M',
		recipeCategory: 'Dessert',
		recipeCuisine: 'American',
		recipeIngredient: ['2 cups flour', '1 cup sugar', '2 eggs'],
		recipeInstructions: [
			{ '@type': 'HowToStep', text: 'Mix dry ingredients' },
			{ '@type': 'HowToStep', text: 'Add wet ingredients' },
			{ '@type': 'HowToStep', text: 'Bake at 350F for 30 minutes' }
		]
	};

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
		expect(schemaData.author.name).toBe('Test Author');
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

		expect(schemaData.prepTime).toBe('PT15M');
		expect(schemaData.cookTime).toBe('PT30M');
		expect(schemaData.totalTime).toBe('PT45M');
	});

	it('should include recipe category and cuisine', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.recipeCategory).toBe('Dessert');
		expect(schemaData.recipeCuisine).toBe('American');
	});

	it('should include recipe ingredients', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.recipeIngredient).toEqual(['2 cups flour', '1 cup sugar', '2 eggs']);
	});

	it('should include recipe instructions with HowToStep format', () => {
		const { container } = render(<RecipeSchema recipe={defaultRecipe} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.recipeInstructions.length).toBe(3);
		expect(schemaData.recipeInstructions[0]['@type']).toBe('HowToStep');
		expect(schemaData.recipeInstructions[0].text).toBe('Mix dry ingredients');
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
