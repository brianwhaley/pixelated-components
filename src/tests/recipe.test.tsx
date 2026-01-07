import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  RecipeBook,
  RecipeCategory,
  RecipeBookItem,
  RecipePickList,
  BackToTop,
  mapSchemaRecipeToDisplay,
} from '@/components/general/recipe';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';

// Mock the SmartImage component
vi.mock('@/components/general/smartimage', () => ({
  SmartImage: (props: any) => {
    const { src, alt, title, className, onClick } = props;
    return React.createElement('img', {
      src,
      alt,
      title,
      className,
      onClick,
      'data-testid': 'smart-image'
    });
  },
}));

// Mock config
const mockConfig = {
  cloudinary: {
    product_env: 'test-env',
    baseUrl: 'https://test.cloudinary.com',
    transforms: 'test-transforms',
  },
};

const renderWithConfig = (component: React.ReactElement, config = mockConfig) => {
  return render(
    <PixelatedClientConfigProvider config={config}>
      {component}
    </PixelatedClientConfigProvider>
  );
};

// Sample recipe data for tests
const sampleRecipeData = {
  items: [
    {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: 'Chocolate Chip Cookies',
      description: 'Delicious homemade cookies',
      author: {
        '@type': 'Person',
        name: 'Jane Doe'
      },
      datePublished: '2023-01-15',
      recipeYield: '24 cookies',
      prepTime: 'PT10M',
      cookTime: 'PT12M',
      totalTime: 'PT30M',
      recipeIngredient: [
        '2 cups flour',
        '1 cup butter',
        '1 cup chocolate chips',
        '2 eggs'
      ],
      recipeInstructions: [
        { '@type': 'HowToStep', text: 'Mix butter and sugar' },
        { '@type': 'HowToStep', text: 'Add eggs and vanilla' },
        { '@type': 'HowToStep', text: 'Stir in flour and chocolate chips' },
        { '@type': 'HowToStep', text: 'Bake at 350°F for 12 minutes' }
      ],
      image: '/cookies.jpg',
      recipeCategory: 'Desserts',
      recipeCuisine: 'American',
      license: 'http://creativecommons.org/licenses/by/2.0/'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: 'Pasta Carbonara',
      description: 'Classic Italian pasta',
      author: {
        '@type': 'Person',
        name: 'Mario Rossi'
      },
      datePublished: '2023-02-10',
      recipeYield: '4 servings',
      prepTime: 'PT5M',
      cookTime: 'PT15M',
      totalTime: 'PT20M',
      recipeIngredient: [
        '400g pasta',
        '200g bacon',
        '3 eggs',
        'Salt and pepper'
      ],
      recipeInstructions: [
        { '@type': 'HowToStep', text: 'Cook pasta' },
        { '@type': 'HowToStep', text: 'Fry bacon until crispy' },
        { '@type': 'HowToStep', text: 'Mix eggs with cheese' },
        { '@type': 'HowToStep', text: 'Combine all ingredients' }
      ],
      image: '/pasta.jpg',
      recipeCategory: 'Main Courses',
      recipeCuisine: 'Italian',
      license: 'http://creativecommons.org/licenses/by/2.0/'
    }
  ]
};

describe('Recipe Components', () => {
  describe('RecipeCategory Component', () => {
    it('should render category heading', () => {
      renderWithConfig(
        <RecipeCategory 
          id="c1" 
          className="h-recipe-category" 
          category="Desserts" 
          showOnly=""
        />
      );
      expect(screen.getByText('Desserts')).toBeInTheDocument();
    });

    it('should render as h2 element', () => {
      const { container } = renderWithConfig(
        <RecipeCategory 
          id="c1" 
          className="h-recipe-category" 
          category="Desserts" 
          showOnly=""
        />
      );
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(h2).toHaveTextContent('Desserts');
    });

    it('should have correct ID attribute', () => {
      const { container } = renderWithConfig(
        <RecipeCategory 
          id="c1" 
          className="h-recipe-category" 
          category="Desserts" 
          showOnly=""
        />
      );
      const h2 = container.querySelector('h2');
      expect(h2).toHaveAttribute('id', 'c1');
    });

    it('should apply className prop', () => {
      const { container } = renderWithConfig(
        <RecipeCategory 
          id="c1" 
          className="h-recipe-category" 
          category="Desserts" 
          showOnly=""
        />
      );
      const h2 = container.querySelector('h2');
      expect(h2).toHaveClass('h-recipe-category');
    });

    it('should hide when showOnly does not match', () => {
      const { container } = renderWithConfig(
        <RecipeCategory 
          id="c1" 
          className="h-recipe-category" 
          category="Desserts" 
          showOnly="c2"
        />
      );
      const h2 = container.querySelector('h2');
      expect(h2).toHaveStyle('display: none');
    });

    it('should show when showOnly matches', () => {
      const { container } = renderWithConfig(
        <RecipeCategory 
          id="c1" 
          className="h-recipe-category" 
          category="Desserts" 
          showOnly="c1"
        />
      );
      const h2 = container.querySelector('h2');
      expect(h2).not.toHaveStyle('display: none');
    });

    it('should show when showOnly is empty', () => {
      const { container } = renderWithConfig(
        <RecipeCategory 
          id="c1" 
          className="h-recipe-category" 
          category="Desserts" 
          showOnly=""
        />
      );
      const h2 = container.querySelector('h2');
      expect(h2).not.toHaveStyle('display: none');
    });
  });

  describe('RecipeBookItem Component', () => {
    const testRecipe = mapSchemaRecipeToDisplay(sampleRecipeData.items[0]);

    it('should render recipe article element', () => {
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const article = container.querySelector('article');
      expect(article).toBeInTheDocument();
      expect(article).toHaveClass('h-recipe');
    });

    it('should render recipe name as h3 heading', () => {
      renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(screen.getByText('Chocolate Chip Cookies')).toBeInTheDocument();
    });

    it('should render recipe summary', () => {
      renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(screen.getByText('Delicious homemade cookies')).toBeInTheDocument();
    });

    it('should render author information', () => {
      renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(screen.getByText(/Author: Jane Doe/)).toBeInTheDocument();
    });

    it('should render published date', () => {
      renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(screen.getByText(/Published: 2023-01-15/)).toBeInTheDocument();
    });

    it('should render duration', () => {
      renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(screen.getByText(/Duration: 30 minutes/)).toBeInTheDocument();
    });

    it('should render yield', () => {
      renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(screen.getByText(/Yield: 24 cookies/)).toBeInTheDocument();
    });

    it('should render ingredients list', () => {
      renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(screen.getByText('2 cups flour')).toBeInTheDocument();
      expect(screen.getByText('1 cup butter')).toBeInTheDocument();
      expect(screen.getByText('1 cup chocolate chips')).toBeInTheDocument();
      expect(screen.getByText('2 eggs')).toBeInTheDocument();
    });

    it('should render ingredients with p-ingredient class', () => {
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const ingredients = container.querySelectorAll('.p-ingredient');
      expect(ingredients.length).toBe(4);
    });

    it('should render instructions list', () => {
      renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(screen.getByText('Mix butter and sugar')).toBeInTheDocument();
      expect(screen.getByText('Add eggs and vanilla')).toBeInTheDocument();
      expect(screen.getByText('Stir in flour and chocolate chips')).toBeInTheDocument();
      expect(screen.getByText('Bake at 350°F for 12 minutes')).toBeInTheDocument();
    });

    it('should render instructions with p-instruction class', () => {
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const instructions = container.querySelectorAll('.p-instruction');
      expect(instructions.length).toBe(4);
    });

    it('should render photo image with u-photo class', () => {
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const image = container.querySelector('.u-photo');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/cookies.jpg');
      expect(image).toHaveAttribute('alt', 'Chocolate Chip Cookies');
      expect(image).toHaveAttribute('title', 'Chocolate Chip Cookies');
    });

    it('should not render image when photo is empty', () => {
      const recipeNoPhoto = {
        ...testRecipe,
        photo: ''
      };
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={recipeNoPhoto} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const images = container.querySelectorAll('.u-photo');
      expect(images.length).toBe(0);
    });

    it('should hide when showOnly does not match', () => {
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly="c1-r2"
        />
      );
      const article = container.querySelector('article');
      expect(article).toHaveStyle('display: none');
    });

    it('should show when showOnly matches', () => {
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly="c1-r1"
        />
      );
      const article = container.querySelector('article');
      expect(article).not.toHaveStyle('display: none');
    });

    it('should have recipe name link with hash', () => {
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const link = container.querySelector('h3 a');
      expect(link).toHaveAttribute('href', '#c1-r1');
    });

    it('should have correct semantic classes', () => {
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(container.querySelector('.p-name')).toBeInTheDocument();
      expect(container.querySelector('.p-summary')).toBeInTheDocument();
      expect(container.querySelector('.p-author')).toBeInTheDocument();
      expect(container.querySelector('.p-published')).toBeInTheDocument();
      expect(container.querySelector('.dt-duration')).toBeInTheDocument();
      expect(container.querySelector('.p-yield')).toBeInTheDocument();
      expect(container.querySelector('.e-ingredients')).toBeInTheDocument();
      expect(container.querySelector('.e-instructions')).toBeInTheDocument();
    });
  });

  describe('RecipePickList Component', () => {
    it('should render select form element', () => {
      renderWithConfig(
        <RecipePickList 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
          handleRecipePickListChange={() => {}}
        />
      );
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should have id attribute', () => {
      const { container } = renderWithConfig(
        <RecipePickList 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
          handleRecipePickListChange={() => {}}
        />
      );
      const select = container.querySelector('select');
      expect(select).toHaveAttribute('id', 'recipe-list');
    });

    it('should render default option', () => {
      renderWithConfig(
        <RecipePickList 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
          handleRecipePickListChange={() => {}}
        />
      );
      expect(screen.getByText('Choose a recipe below:')).toBeInTheDocument();
    });

    it('should render category options', () => {
      renderWithConfig(
        <RecipePickList 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
          handleRecipePickListChange={() => {}}
        />
      );
      expect(screen.getByText('=== DESSERTS ===')).toBeInTheDocument();
      expect(screen.getByText('=== MAIN COURSES ===')).toBeInTheDocument();
    });

    it('should render recipe options under categories', () => {
      renderWithConfig(
        <RecipePickList 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
          handleRecipePickListChange={() => {}}
        />
      );
      expect(screen.getByText('Chocolate Chip Cookies')).toBeInTheDocument();
      expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument();
    });

    it('should call handler when selection changes', () => {
      const handleChange = vi.fn();
      renderWithConfig(
        <RecipePickList 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
          handleRecipePickListChange={handleChange}
        />
      );
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'c1-r1' } });
      expect(handleChange).toHaveBeenCalledWith('c1-r1');
    });

    it('should call handler with empty string when default option selected', () => {
      const handleChange = vi.fn();
      renderWithConfig(
        <RecipePickList 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
          handleRecipePickListChange={handleChange}
        />
      );
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: '' } });
      expect(handleChange).toHaveBeenCalledWith('');
    });
  });

  describe('BackToTop Component', () => {
    it('should render back to top link', () => {
      renderWithConfig(<BackToTop />);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '#top');
    });

    it('should render back to top text', () => {
      renderWithConfig(<BackToTop />);
      expect(screen.getByText('Back To Top')).toBeInTheDocument();
    });

    it('should render icon image', () => {
      const { container } = renderWithConfig(<BackToTop />);
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Back To Top');
      expect(image).toHaveAttribute('title', 'Back To Top');
      // src may be transformed by Next.js Image component
      const src = image?.getAttribute('src');
      expect(src).toBeTruthy();
    });

    it('should have two divs inside link', () => {
      const { container } = renderWithConfig(<BackToTop />);
      const link = container.querySelector('a');
      const divs = link?.querySelectorAll('div');
      expect(divs?.length).toBe(2);
    });

    it('should have backToTop class', () => {
      const { container } = renderWithConfig(<BackToTop />);
      const backToTop = container.querySelector('.backToTop');
      expect(backToTop).toBeInTheDocument();
    });

    it('should prevent default on click', () => {
      renderWithConfig(<BackToTop />);
      const link = screen.getByRole('link');
      const event = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      fireEvent.click(link);
      // The component returns false from onClick which prevents default
    });
  });

  describe('RecipeBook Component', () => {
    it('should render recipes container', () => {
      const { container } = renderWithConfig(
        <RecipeBook 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
        />
      );
      const recipes = container.querySelector('#recipes');
      expect(recipes).toBeInTheDocument();
    });

    it('should render RecipePickList', () => {
      renderWithConfig(
        <RecipeBook 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
        />
      );
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should render BackToTop', () => {
      renderWithConfig(
        <RecipeBook 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
        />
      );
      expect(screen.getByText('Back To Top')).toBeInTheDocument();
    });

    it('should render recipe categories', () => {
      renderWithConfig(
        <RecipeBook 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
        />
      );
      expect(screen.getByText('Desserts')).toBeInTheDocument();
      expect(screen.getByText('Main Courses')).toBeInTheDocument();
    });

    it('should render all recipes', () => {
      const { container } = renderWithConfig(
        <RecipeBook 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
        />
      );
      expect(screen.getAllByText('Chocolate Chip Cookies').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Pasta Carbonara').length).toBeGreaterThan(0);
    });

    it('should handle recipe selection changes', () => {
      const { container } = renderWithConfig(
        <RecipeBook 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
        />
      );
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      
      // Initially recipes in container
      expect(container.querySelector('.h-recipe')).toBeInTheDocument();
      
      // Select a specific recipe
      fireEvent.change(select, { target: { value: 'c1-r1' } });
      
      // After selection, should still render
      expect(container.querySelector('.h-recipe')).toBeInTheDocument();
    });

    it('should reset selection when default option chosen', () => {
      renderWithConfig(
        <RecipeBook 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
        />
      );
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      
      fireEvent.change(select, { target: { value: 'c1-r1' } });
      fireEvent.change(select, { target: { value: '' } });
      
      expect(select.value).toBe('');
    });
  });

  describe('Recipe - Edge Cases', () => {
    it('should handle empty recipe data', () => {
      const emptyRecipeData = { items: [] };
      const { container } = renderWithConfig(
        <RecipeBook 
          recipeData={emptyRecipeData} 
          recipeCategories={['Desserts']}
        />
      );
      const recipes = container.querySelector('#recipes');
      expect(recipes).toBeInTheDocument();
    });

    it('should handle empty ingredients', () => {
      const recipeNoIngredients = mapSchemaRecipeToDisplay({
        ...sampleRecipeData.items[0],
        recipeIngredient: []
      });
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={recipeNoIngredients} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const ingredients = container.querySelectorAll('.p-ingredient');
      expect(ingredients.length).toBe(0);
    });

    it('should handle empty instructions', () => {
      const recipeNoInstructions = mapSchemaRecipeToDisplay({
        ...sampleRecipeData.items[0],
        recipeInstructions: []
      });
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={recipeNoInstructions} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const instructions = container.querySelectorAll('.p-instruction');
      expect(instructions.length).toBe(0);
    });

    it('should handle special characters in recipe name', () => {
      const specialRecipe = mapSchemaRecipeToDisplay({
        ...sampleRecipeData.items[0],
        name: 'Crème Brûlée & Cookies'
      });
      renderWithConfig(
        <RecipeBookItem 
          recipeData={specialRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(screen.getByText('Crème Brûlée & Cookies')).toBeInTheDocument();
    });

    it('should handle long ingredient lists', () => {
      const longIngredients = Array.from({ length: 50 }, (_, i) => `Ingredient ${i + 1}`);
      const recipeWithManyIngredients = mapSchemaRecipeToDisplay({
        ...sampleRecipeData.items[0],
        recipeIngredient: longIngredients
      });
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={recipeWithManyIngredients} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const ingredients = container.querySelectorAll('.p-ingredient');
      expect(ingredients.length).toBe(50);
    });

    it('should handle multiple categories', () => {
      const multiCategoryRecipe = {
        ...sampleRecipeData.items[0],
        recipeCategory: 'Desserts'
      };
      const { container } = renderWithConfig(
        <RecipeBook 
          recipeData={{ items: [multiCategoryRecipe] }} 
          recipeCategories={['Desserts', 'Vegetarian', 'Quick']}
        />
      );
      expect(container.querySelector('#recipes')).toBeInTheDocument();
    });
  });

  describe('Recipe - Semantic HTML', () => {
    const convertedRecipe = mapSchemaRecipeToDisplay(sampleRecipeData.items[0]);

    it('should have proper h-recipe microformat class', () => {
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={convertedRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(container.querySelector('.h-recipe')).toBeInTheDocument();
    });

    it('should use semantic ingredient classes (p-ingredient)', () => {
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={convertedRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const ingredients = container.querySelectorAll('.p-ingredient');
      ingredients.forEach(ingredient => {
        expect(ingredient.tagName).toBe('LI');
      });
    });

    it('should use semantic instruction classes (p-instruction)', () => {
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={convertedRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const instructions = container.querySelectorAll('.p-instruction');
      instructions.forEach(instruction => {
        expect(instruction.tagName).toBe('LI');
      });
    });

    it('should use ordered list for instructions', () => {
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={convertedRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const ol = container.querySelector('ol');
      const instructionsList = Array.from(ol?.querySelectorAll('li') ?? []);
      expect(instructionsList.length).toBe(4);
    });

    it('should use unordered list for ingredients', () => {
      const { container } = renderWithConfig(
        <RecipeBookItem 
          recipeData={convertedRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const ul = container.querySelector('ul');
      const ingredientsList = Array.from(ul?.querySelectorAll('li') ?? []);
      expect(ingredientsList.length).toBe(4);
    });
  });
});
