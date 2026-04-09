// Shared test fixtures (centralized source-of-truth for tests)
// Location mandated by repo conventions: src/app/test

import routes from '@/data/routes.json';
import recipes from '@/data/recipes.json';
import resume from '@/data/resume.json';

// Expose "real" integration-style fixtures
export const realRoutes = routes;
export const realRecipes = recipes;
export const realResume = resume;

// Re-export commonly-used slices (keeps tests small & explicit)
export const siteInfo = routes.siteInfo;
export const siteInfoFull = routes.siteInfo;
export const visualdesign = routes.visualdesign || {};

export const minimalRecipe = (recipes.items && recipes.items[0]) ? recipes.items[0] : { '@type': 'Recipe', name: 'Minimal' };
export const minimalResume = (resume.items && resume.items[0]) ? { items: [resume.items[0]] } : { items: [] };




// Backwards-compat shape used by many existing tests (keeps migration minimal)
export default {
	visualdesign: visualdesign,
	siteInfo: siteInfo,
	siteInfoFull: siteInfoFull,

	emptySiteInfo: { name: '', author: '', description: '', url: '', email: '' },
	routes: routes.routes || [],
	emptyRoutes: [],
	malformedRoutes: [{ invalidField: 'value' }],
};
