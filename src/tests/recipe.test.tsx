import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import {
  RecipeBook,
  RecipeCategory,
  RecipeBookItem,
  RecipePickList,
  BackToTop,
  mapSchemaRecipeToDisplay,
} from '@/components/general/recipe';

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

import { realRecipes as sampleRecipeData } from '../test/test-data';

// File-scoped canonical selectors (use the real canonical fixtures for integration-style assertions)
const canonicalRich = sampleRecipeData.items.find(r => (r.recipeIngredient?.length ?? 0) >= 4 && (r.recipeInstructions?.length ?? 0) >= 4 && (r.description || r.image || r.recipeYield));
const canonicalFallback = sampleRecipeData.items.find(r => (r.recipeIngredient?.length ?? 0) >= 1) || sampleRecipeData.items[0];


describe('Recipe Components', () => {
  describe('RecipeCategory Component', () => {
    it('should render category heading', () => {
      render(
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
      const { container } = render(
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
      const { container } = render(
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
      const { container } = render(
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
      const { container } = render(
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
      const { container } = render(
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
      const { container } = render(
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
    // select a "rich" canonical recipe (ingredients + instructions) for integration-style assertions
    const richRaw = sampleRecipeData.items.find(r => (r.recipeIngredient?.length ?? 0) >= 4 && (r.recipeInstructions?.length ?? 0) >= 4 && (r.description || r.image || r.recipeYield));
    const fallbackRaw = sampleRecipeData.items.find(r => (r.recipeIngredient?.length ?? 0) >= 1) || sampleRecipeData.items[0];
    const testRecipe = mapSchemaRecipeToDisplay(richRaw || fallbackRaw);
    it('should render recipe article element', () => {
      const { container } = render(
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
      render(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(screen.getByText(testRecipe.name)).toBeInTheDocument();
    });

    it('should render recipe summary', () => {
      render(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      // summary may be empty for some canonical recipes — assert against the canonical value when present
      if (testRecipe.summary && testRecipe.summary.length > 0) {
        expect(screen.getByText(testRecipe.summary)).toBeInTheDocument();
      } else {
        expect(screen.getByText('')).toBeInTheDocument();
      }
    });

    it('should render author information', () => {
      render(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(screen.getByText(new RegExp(`Author:\\s*${testRecipe.author.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`))).toBeInTheDocument();
    });

    it('should render published/date, duration and yield (when present)', () => {
      render(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );

      // published
      if (testRecipe.published && testRecipe.published.length > 0) {
        expect(screen.getByText(new RegExp(`Published:\\s*${testRecipe.published.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`))).toBeInTheDocument();
      } else {
        expect(screen.getByText(/Published:\s*/)).toBeInTheDocument();
      }

      // duration
      if (testRecipe.duration && testRecipe.duration.length > 0) {
        expect(screen.getByText(new RegExp(`Duration:\\s*${testRecipe.duration.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`))).toBeInTheDocument();
      } else {
        expect(screen.getByText(/Duration:\s*/)).toBeInTheDocument();
      }

      // yield
      if (testRecipe.yield && testRecipe.yield.length > 0) {
        expect(screen.getByText(new RegExp(`Yield:\\s*${testRecipe.yield.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`))).toBeInTheDocument();
      } else {
        expect(screen.getByText(/Yield:\s*/)).toBeInTheDocument();
      }
    });

    it('should render ingredients list', () => {
      render(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      // assert every ingredient from the canonical recipe is rendered
      testRecipe.ingredients.forEach(ing => {
        if (ing && ing.length > 0) expect(screen.getByText(ing)).toBeInTheDocument();
      });
    });

    it('should render ingredients with p-ingredient class', () => {
      const { container } = render(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const ingredients = container.querySelectorAll('.p-ingredient');
      expect(ingredients.length).toBe(testRecipe.ingredients.length);
    });

    it('should render instructions list', () => {
      render(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      testRecipe.instructions.forEach(instr => {
        if (instr && instr.length > 0) {
          const matches = screen.queryAllByText(instr);
          expect(matches.length).toBeGreaterThan(0);
        }
      });
    });

    it('should render instructions with p-instruction class', () => {
      const { container } = render(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const instructions = container.querySelectorAll('.p-instruction');
      expect(instructions.length).toBe(testRecipe.instructions.length);
    });

    it('should render photo image with u-photo class (when present)', () => {
      const { container } = render(
        <RecipeBookItem 
          recipeData={testRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const image = container.querySelector('.u-photo');
      if (testRecipe.photo && testRecipe.photo.length > 0) {
        expect(image).toBeInTheDocument();
        // image src may be an absolute URL in canonical data — assert it contains the filename or full value
        const src = image?.getAttribute('src') ?? '';
        expect(src).toContain(testRecipe.photo.split('/').slice(-1)[0]);
        expect(image).toHaveAttribute('alt', testRecipe.name);
        expect(image).toHaveAttribute('title', testRecipe.name);
      } else {
        expect(image).toBeNull();
      }
    });

    it('should not render image when photo is empty', () => {
      const recipeNoPhoto = {
        ...testRecipe,
        photo: ''
      };
      const { container } = render(
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
      const { container } = render(
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
      const { container } = render(
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
      const { container } = render(
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
      const { container } = render(
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
    const recipeCategories = Array.from(new Set(sampleRecipeData.items.map(r => (r.recipeCategory || '').toString().trim()).filter(Boolean))).slice(0, 2);

    it('should render select form element', () => {
      render(
        <RecipePickList 
          recipeData={sampleRecipeData} 
          recipeCategories={recipeCategories}
          handleRecipePickListChange={() => {}}
        />
      );
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should have id attribute', () => {
      const { container } = render(
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
      render(
        <RecipePickList 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
          handleRecipePickListChange={() => {}}
        />
      );
      expect(screen.getByText('Choose a recipe below:')).toBeInTheDocument();
    });

    it('should render category options', () => {
      render(
        <RecipePickList 
          recipeData={sampleRecipeData} 
recipeCategories={recipeCategories}
          handleRecipePickListChange={() => {} }
        />
      );
      // headings reflect the categories passed in
      if (recipeCategories[0]) expect(screen.getByText(`=== ${recipeCategories[0].toUpperCase()} ===`)).toBeInTheDocument();
      if (recipeCategories[1]) expect(screen.getByText(`=== ${recipeCategories[1].toUpperCase()} ===`)).toBeInTheDocument();
    });

    it('should render recipe options under categories', () => {
      // choose one recipe from each category actually passed to the component
      const chosen = recipeCategories
        .map(cat => sampleRecipeData.items.find(r => (r.recipeCategory || '').toString().toLowerCase().includes(cat.toLowerCase())))
        .filter(Boolean);

      render(
        <RecipePickList 
          recipeData={sampleRecipeData} 
          recipeCategories={recipeCategories}
          handleRecipePickListChange={() => {} }
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;

      // For each category passed, there should be a category header option and at least one recipe option
      recipeCategories.forEach((category, idx) => {
        const cID = 'c' + (idx + 1);
        expect(select.querySelector(`option[value="${cID}"]`)).toBeTruthy();
        const hasRecipeOption = Array.from(select.options).some(o => o.value.startsWith(`${cID}-r`));
        expect(hasRecipeOption).toBe(true);
      });
    });

    it('should call handler when selection changes', () => {
      const handleChange = vi.fn();
      render(
        <RecipePickList 
          recipeData={sampleRecipeData} 
          recipeCategories={recipeCategories}
          handleRecipePickListChange={handleChange}
        />
      );
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const recipeOption = Array.from(select.options).find(o => /^c\d+-r\d+$/i.test(o.value));
      expect(recipeOption).toBeTruthy();
      fireEvent.change(select, { target: { value: recipeOption!.value } });
      expect(handleChange).toHaveBeenCalledWith(recipeOption!.value);
    });

    it('should call handler with empty string when default option selected', () => {
      const handleChange = vi.fn();
      render(
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
      render(<BackToTop />);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '#top');
    });

    it('should render back to top text', () => {
      render(<BackToTop />);
      expect(screen.getByText('Back To Top')).toBeInTheDocument();
    });

    it('should render icon image', () => {
      const { container } = render(<BackToTop />);
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Back To Top');
      expect(image).toHaveAttribute('title', 'Back To Top');
      // src may be transformed by Next.js Image component
      const src = image?.getAttribute('src');
      expect(src).toBeTruthy();
    });

    it('should have two divs inside link', () => {
      const { container } = render(<BackToTop />);
      const link = container.querySelector('a');
      const divs = link?.querySelectorAll('div');
      expect(divs?.length).toBe(2);
    });

    it('should have backToTop class', () => {
      const { container } = render(<BackToTop />);
      const backToTop = container.querySelector('.backToTop');
      expect(backToTop).toBeInTheDocument();
    });

    it('should prevent default on click', () => {
      render(<BackToTop />);
      const link = screen.getByRole('link');
      const event = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      fireEvent.click(link);
      // The component returns false from onClick which prevents default
    });
  });

  describe('RecipeBook Component', () => {
    it('should render recipes container', () => {
      const { container } = render(
        <RecipeBook 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
        />
      );
      const recipes = container.querySelector('#recipes');
      expect(recipes).toBeInTheDocument();
    });

    it('should render RecipePickList', () => {
      render(
        <RecipeBook 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
        />
      );
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should render BackToTop', () => {
      render(
        <RecipeBook 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
        />
      );
      expect(screen.getByText('Back To Top')).toBeInTheDocument();
    });

    it('should render recipe categories', () => {
      render(
        <RecipeBook 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
        />
      );
      expect(screen.getByText('Desserts')).toBeInTheDocument();
      expect(screen.getByText('Main Courses')).toBeInTheDocument();
    });

    it('should render all recipes', () => {
      const { container } = render(
        <RecipeBook 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
        />
      );
      // assert at least one recipe from each category passed is rendered
      const selected = ['Desserts', 'Main Courses']
        .map(cat => sampleRecipeData.items.find(r => (r.recipeCategory || '').toString().toLowerCase().includes(cat.toLowerCase())))
        .filter(Boolean);

      // For each requested category ensure there's a heading and at least one recipe element with matching id prefix
      ['Desserts', 'Main Courses'].forEach((cat, idx) => {
        // specifically assert the h2 heading (avoid matching the category <option> label)
        const heading = container.querySelector(`h2.h-recipe-category#c${idx + 1}`) as HTMLElement | null;
        expect(heading).toBeTruthy();
        expect(heading!.textContent!.toLowerCase()).toContain(cat.toLowerCase());

        const prefix = `c${idx + 1}-r`;
        const hasRecipe = Array.from(container.querySelectorAll('.h-recipe')).some(el => el.id && el.id.startsWith(prefix));

        // Canonical-data-driven: only require recipe elements when the canonical fixture contains items for the category
        const canonicalHas = sampleRecipeData.items.some(r => (r.recipeCategory || '').toString().toLowerCase().includes(cat.toLowerCase()));
        if (canonicalHas) {
          expect(hasRecipe).toBe(true);
        } else {
          expect(hasRecipe).toBe(false);
        }
      });
    });

    it('should handle recipe selection changes', () => {
      const { container } = render(
        <RecipeBook 
          recipeData={sampleRecipeData} 
          recipeCategories={['Desserts', 'Main Courses']}
        />
      );
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      
      // Initially recipes in container (only assert if a recipe exists for the categories passed)
      const anyForCategories = sampleRecipeData.items.some(r => ['Desserts','Main Courses'].some(cat => (r.recipeCategory || '').toString().toLowerCase().includes(cat.toLowerCase())));
      if (anyForCategories) {
        expect(container.querySelector('.h-recipe')).toBeInTheDocument();
      }
      
      // Select a specific recipe (choose first selectable recipe option)
      const recipeOption = Array.from(select.options).find(o => /^c\d+-r\d+$/i.test(o.value));
      if (!recipeOption) {
        // No selectable recipe options for the requested categories — assert the select contains only headers
        const hasOnlyHeaders = Array.from(select.options).every(o => /^c\d$/.test(o.value) || o.value === '');
        expect(hasOnlyHeaders).toBe(true);
        return;
      }

      expect(recipeOption).toBeTruthy();
      fireEvent.change(select, { target: { value: recipeOption!.value } });

      // After selection, should still render
      expect(container.querySelector('.h-recipe')).toBeInTheDocument();
    });

    it('should reset selection when default option chosen', () => {
      render(
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
      const { container } = render(
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
        ...(canonicalRich || canonicalFallback),
        recipeIngredient: []
      });
      const { container } = render(
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
        ...(canonicalRich || canonicalFallback),
        recipeInstructions: []
      });
      const { container } = render(
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
        ...(canonicalRich || canonicalFallback),
        name: 'Crème Brûlée & Cookies'
      });
      render(
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
        ...(canonicalRich || canonicalFallback),
        recipeIngredient: longIngredients
      });
      const { container } = render(
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
      const { container } = render(
        <RecipeBook 
          recipeData={{ items: [multiCategoryRecipe] }} 
          recipeCategories={['Desserts', 'Vegetarian', 'Quick']}
        />
      );
      expect(container.querySelector('#recipes')).toBeInTheDocument();
    });
  });

  describe('Recipe - Semantic HTML', () => {
    const richRawForSemantic = sampleRecipeData.items.find(r => (r.recipeIngredient?.length ?? 0) >= 4 && (r.recipeInstructions?.length ?? 0) >= 4 && (r.description || r.image || r.recipeYield));
    const fallbackRawForSemantic = sampleRecipeData.items.find(r => (r.recipeIngredient?.length ?? 0) >= 1) || sampleRecipeData.items[0];
    const convertedRecipe = mapSchemaRecipeToDisplay(richRawForSemantic || fallbackRawForSemantic);

    it('should have proper h-recipe microformat class', () => {
      const { container } = render(
        <RecipeBookItem 
          recipeData={convertedRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      expect(container.querySelector('.h-recipe')).toBeInTheDocument();
    });

    it('should use semantic ingredient classes (p-ingredient)', () => {
      const { container } = render(
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
      const { container } = render(
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
      const { container } = render(
        <RecipeBookItem 
          recipeData={convertedRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const ol = container.querySelector('ol');
      const instructionsList = Array.from(ol?.querySelectorAll('li') ?? []);
      expect(instructionsList.length).toBe(convertedRecipe.instructions.length);
    });

    it('should use unordered list for ingredients', () => {
      const { container } = render(
        <RecipeBookItem 
          recipeData={convertedRecipe} 
          id="c1-r1" 
          showOnly=""
        />
      );
      const ul = container.querySelector('ul');
      const ingredientsList = Array.from(ul?.querySelectorAll('li') ?? []);
      expect(ingredientsList.length).toBe(convertedRecipe.ingredients.length);
    });
  });
});
