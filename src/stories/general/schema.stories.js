import React from 'react';
import { LocalBusinessSchema } from '@/components/general/schema-localbusiness';
import { WebsiteSchema } from '@/components/general/schema-website';
import { ReviewSchema } from '@/components/general/schema-review';
import { RecipeSchema } from '@/components/general/schema-recipe';
import { SchemaFAQ } from '@/components/general/schema-faq';
import { SchemaBlogPosting } from '@/components/general/schema-blogposting';
import { ServicesSchema } from '@/components/general/schema-services';
import { ProductSchema } from '@/components/general/schema-product';
import { BreadcrumbListSchema } from '@/components/general/schema-breadcrumb';

export default {
	title: 'General',
	component: LocalBusinessSchema,
};

export const Schema_LocalBusiness_From_Config = {
	render: () => (
		<div>
			<h3>LocalBusiness Schema (using routes.json data)</h3>
			<p>This component automatically pulls business data from the siteInfo section of routes.json</p>
			<LocalBusinessSchema />
		</div>
	),
};

export const Schema_LocalBusiness_Custom_Props = {
	render: () => (
		<div>
			<h3>LocalBusiness Schema (with custom props)</h3>
			<p>Custom props override the default config data</p>
			<LocalBusinessSchema
				name="Custom Business Name"
				description="A custom description for this business"
			/>
		</div>
	),
};

export const Schema_Website_From_Config = {
	render: () => (
		<div>
			<h3>Website Schema (using routes.json data)</h3>
			<p>This component automatically pulls website data from the siteInfo section of routes.json</p>
			<WebsiteSchema />
		</div>
	),
};

export const Schema_Website_With_Search = {
	render: () => (
		<div>
			<h3>Website Schema (with search functionality)</h3>
			<p>Includes search action for enhanced SEO</p>
			<WebsiteSchema
				potentialAction={{
					'@type': 'SearchAction',
					target: {
						'@type': 'EntryPoint',
						urlTemplate: 'https://pixelated.tech/search?q={search_term_string}'
					},
					'query-input': 'required name=search_term_string'
				}}
			/>
		</div>
	),
};

export const Schema_Review_Sample = {
	render: () => (
		<div>
			<h3>Review Schema (Product Review)</h3>
			<p>Sample product review with rating</p>
			<ReviewSchema
				review={{
					'@context': 'https://schema.org/',
					'@type': 'Review',
					name: 'Excellent Product!',
					reviewBody: 'This product has completely transformed my workflow. It\'s fast, reliable, and easy to use. Highly recommended!',
					datePublished: '2026-02-28',
					author: {
						'@type': 'Person',
						name: 'Jane Doe'
					},
					itemReviewed: {
						'@type': 'Product',
						name: 'SuperWidget Pro'
					},
					reviewRating: {
						'@type': 'Rating',
						ratingValue: '5',
						bestRating: '5',
						worstRating: '1'
					},
					publisher: {
						'@type': 'Organization',
						name: 'TechReviews Inc.'
					}
				}}
			/>
		</div>
	),
};

export const Schema_Recipe_Sample = {
	render: () => (
		<div>
			<h3>Recipe Schema (Example Recipe)</h3>
			<p>Sample recipe with instructions and ingredients</p>
			<RecipeSchema
				recipe={{
					'@context': 'https://schema.org/',
					'@type': 'Recipe',
					name: 'Chocolate Chip Cookies',
					description: 'Classic homemade chocolate chip cookies',
					author: {
						'@type': 'Person',
						name: 'Chef Maria'
					},
					datePublished: '2026-02-28',
					image: 'https://example.com/cookie.jpg',
					recipeYield: '24 cookies',
					prepTime: 'PT15M',
					cookTime: 'PT12M',
					totalTime: 'PT27M',
					recipeCategory: 'Dessert',
					recipeCuisine: 'American',
					recipeIngredient: [
						'2 cups all-purpose flour',
						'1 tsp baking soda',
						'1 tsp salt',
						'1 cup butter',
						'3/4 cup granulated sugar',
						'3/4 cup packed brown sugar',
						'2 large eggs',
						'2 tsp vanilla extract',
						'2 cups chocolate chips'
					],
					recipeInstructions: [
						{
							'@type': 'HowToStep',
							text: 'Preheat oven to 375°F'
						},
						{
							'@type': 'HowToStep',
							text: 'Mix flour, baking soda and salt in small bowl'
						},
						{
							'@type': 'HowToStep',
							text: 'Beat butter and sugars until creamy'
						},
						{
							'@type': 'HowToStep',
							text: 'Add eggs and vanilla extract, mix well'
						},
						{
							'@type': 'HowToStep',
							text: 'Gradually blend in flour mixture'
						},
						{
							'@type': 'HowToStep',
							text: 'Stir in chocolate chips'
						},
						{
							'@type': 'HowToStep',
							text: 'Drop rounded tablespoons onto ungreased cookie sheets'
						},
						{
							'@type': 'HowToStep',
							text: 'Bake 9-12 minutes or until golden brown'
						}
					]
				}}
			/>
		</div>
	),
};

export const Schema_FAQ_Sample = {
	render: () => (
		<div>
			<h3>FAQ Schema (Example FAQ Page)</h3>
			<p>Sample FAQ page structure</p>
			<SchemaFAQ
				faqsData={{
					'@context': 'https://schema.org/',
					'@type': 'FAQPage',
					mainEntity: [
						{
							'@type': 'Question',
							name: 'What is the return policy?',
							acceptedAnswer: {
								'@type': 'Answer',
								text: 'We offer a 30-day money-back guarantee on all products. Simply return the item in original condition for a full refund.'
							}
						},
						{
							'@type': 'Question',
							name: 'Do you offer international shipping?',
							acceptedAnswer: {
								'@type': 'Answer',
								text: 'Yes, we ship to most countries worldwide. Shipping costs and times vary by location.'
							}
						},
						{
							'@type': 'Question',
							name: 'How long does delivery typically take?',
							acceptedAnswer: {
								'@type': 'Answer',
								text: 'Standard delivery takes 5-7 business days. Express shipping options are available for faster delivery.'
							}
						}
					]
				}}
			/>
		</div>
	),
};

export const Schema_BlogPosting_Sample = {
	render: () => (
		<div>
			<h3>BlogPosting Schema (Example Blog Post)</h3>
			<p>Sample blog post structure with article metadata</p>
			<SchemaBlogPosting
				post={{
					'@context': 'https://schema.org/',
					'@type': 'BlogPosting',
					headline: 'Getting Started with Web Components',
					description: 'A comprehensive guide to building web components',
					image: 'https://example.com/blog-image.jpg',
					datePublished: '2026-02-28',
					dateModified: '2026-02-28',
					author: {
						'@type': 'Person',
						name: 'John Smith'
					},
					articleBody: 'Web components are a set of web platform APIs that allow you to create new custom, reusable, encapsulated HTML tags to use in web pages and web apps...',
					publisher: {
						'@type': 'Organization',
						name: 'Tech Blog',
						logo: {
							'@type': 'ImageObject',
							url: 'https://example.com/logo.png'
						}
					}
				}}
			/>
		</div>
	),
};

export const Schema_Services_Sample = {
	render: () => (
		<div>
			<h3>Services Schema (Business Services)</h3>
			<p>Sample service listings for a business</p>
			<ServicesSchema
				services={[
					{
						name: 'Web Design',
						description: 'Custom website design and development',
						url: 'https://example.com/services/web-design',
						image: 'https://example.com/web-design.jpg',
						areaServed: ['US', 'Canada', 'UK']
					},
					{
						name: 'SEO Optimization',
						description: 'Search engine optimization services',
						url: 'https://example.com/services/seo',
						image: 'https://example.com/seo.jpg',
						areaServed: 'Worldwide'
					},
					{
						name: 'Content Writing',
						description: 'Professional content creation and copywriting',
						url: 'https://example.com/services/content',
						image: 'https://example.com/content.jpg',
						areaServed: 'Worldwide'
					}
				]}
				provider={{
					name: 'Digital Marketing Agency',
					url: 'https://example.com',
					logo: 'https://example.com/logo.png',
					telephone: '+1-555-123-4567',
					email: 'info@example.com'
				}}
			/>
		</div>
	),
};

export const Schema_Product_Sample = {
	render: () => (
		<div>
			<h3>Product Schema (E-commerce Product)</h3>
			<p>Sample product with single offer</p>
			<ProductSchema
				product={{
					'@context': 'https://schema.org/',
					'@type': 'Product',
					name: 'Custom Sunglasses',
					description: 'A pair of artisan-crafted custom sunglasses with hand-painted design.',
					image: 'https://example.com/custom-sunglasses.jpg',
					brand: {
						'@type': 'Brand',
						name: 'Pixelated Customs'
					},
					offers: {
						'@type': 'Offer',
						url: 'https://example.com/custom-sunglasses',
						priceCurrency: 'USD',
						price: '250.00',
						availability: 'https://schema.org/InStock'
					},
					aggregateRating: {
						'@type': 'AggregateRating',
						ratingValue: '4.8',
						reviewCount: '125'
					}
				}}
			/>
		</div>
	),
};

export const Schema_Product_Multiple_Offers = {
	render: () => (
		<div>
			<h3>Product Schema (Multiple Offers)</h3>
			<p>Product available on multiple marketplaces with different offers</p>
			<ProductSchema
				product={{
					'@context': 'https://schema.org/',
					'@type': 'Product',
					name: 'Designer Sunglasses',
					description: 'Premium designer sunglasses with UV protection.',
					image: [
						'https://example.com/designer-sunglasses-1.jpg',
						'https://example.com/designer-sunglasses-2.jpg',
						'https://example.com/designer-sunglasses-3.jpg'
					],
					brand: {
						'@type': 'Brand',
						name: 'LuxeEyewear'
					},
					offers: [
						{
							'@type': 'Offer',
							url: 'https://example.com/designer-sunglasses',
							priceCurrency: 'USD',
							price: '349.99',
							availability: 'https://schema.org/InStock'
						},
						{
							'@type': 'Offer',
							url: 'https://ebay.com/designer-sunglasses',
							priceCurrency: 'USD',
							price: '329.99',
							availability: 'https://schema.org/InStock'
						}
					]
				}}
			/>
		</div>
	),
};

export const Schema_BreadcrumbList_Store_Hierarchy = {
	render: () => {
		const pixelvidRoutes = [
			{ name: 'Home', path: '/' },
			{ name: 'About Us', path: '/about' },
			{ name: 'Store', path: '/store' },
			{ name: 'Sunglasses', path: '/customsunglasses' },
			{ name: 'Gallery', path: '/customsgallery' },
			{ name: 'Photography', path: '/photography' },
		];

		return (
			<div>
				<h3>BreadcrumbList Schema - E-Commerce Store</h3>
				<p>Auto-generates breadcrumb trail for a product page using routes data and current path</p>
				<BreadcrumbListSchema
					routes={pixelvidRoutes}
					currentPath="/store/vintage-oakley-frogskins"
					siteUrl="https://www.pixelvivid.com"
				/>
				<p style={{ fontSize: '0.85em', color: '#666', marginTop: '1em' }}>
					Breadcrumb: Home → Store → Vintage Oakley Frogskins
				</p>
			</div>
		);
	},
};

export const Schema_BreadcrumbList_Projects_Hierarchy = {
	render: () => {
		const palmettoRoutes = [
			{ name: 'Home', path: '/' },
			{ name: 'About', path: '/about' },
			{ name: 'Services', path: '/services' },
			{ name: 'Projects', path: '/projects' },
			{ name: 'Contact', path: '/contact' },
		];

		return (
			<div>
				<h3>BreadcrumbList Schema - Project Portfolio</h3>
				<p>Auto-generates breadcrumb trail for a project detail page</p>
				<BreadcrumbListSchema
					routes={palmettoRoutes}
					currentPath="/projects/residential-kitchen-epoxy"
					siteUrl="https://www.palmetto-epoxy.com"
				/>
				<p style={{ fontSize: '0.85em', color: '#666', marginTop: '1em' }}>
					Breadcrumb: Home → Projects → Residential Kitchen Epoxy
				</p>
			</div>
		);
	},
};

export const Schema_BreadcrumbList_Simple = {
	render: () => {
		const routes = [
			{ name: 'Home', path: '/' },
			{ name: 'Gallery', path: '/gallery' },
			{ name: 'About', path: '/about' },
		];

		return (
			<div>
				<h3>BreadcrumbList Schema - Simple</h3>
				<p>Shows a basic two-level breadcrumb trail using routes array and currentPath</p>
				<BreadcrumbListSchema routes={routes} currentPath="/gallery" />
				<p style={{ fontSize: '0.85em', color: '#666', marginTop: '1em' }}>
					Breadcrumb: Home → Gallery
				</p>
			</div>
		);
	},
};