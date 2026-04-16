// Shared API response fixtures for tests.
// These mirror the real shapes returned by external services or internal endpoints.

export const mockEbayItem = {
	legacyItemId: 'item-123',
	title: 'Vintage Camera',
	price: { value: '49.99', currency: 'USD' },
	image: { imageUrl: 'https://example.com/camera.jpg' },
	thumbnailImages: [{ imageUrl: 'https://example.com/camera-thumb.jpg' }],
	condition: 'Good',
	categories: [{
		categoryId: '12345',
		categoryName: 'Electronics',
	}],
	seller: {
		username: 'seller123',
		sellerUserName: 'seller123',
		sellerAccountStatus: 'Active',
		feedbackScore: 500,
		feedbackPercentage: 99.5,
	},
	buyingOptions: ['FIXED_PRICE'],
	itemLocation: {
		postalCode: '95131',
		country: 'US',
	},
	itemCreationDate: new Date().toISOString(),
	shippingOptions: [{
		shippingCostType: 'CALCULATED',
		shippingCost: { value: '10.00' },
	}],
};

export const mockEbayApiResponse = {
	itemSummaries: [mockEbayItem],
	refinement: {
		aspectDistributions: [],
	},
};

export const mockEbayListing = {
	legacyItemId: '123456789',
	title: 'Vintage Apple Computer',
	price: '199.99',
	currency: 'USD',
	condition: 'Used',
	conditionId: '3000',
	categoryId: '11450',
	image: 'https://i.ebayimg.com/images/g/example.jpg',
	seller: {
		username: 'example_seller',
		feedbackScore: 1500,
		positivePercent: 98.5,
		topRatedSeller: true,
	},
	shipping: {
		method: 'Multi-category',
		cost: 10.0,
		expedited: true,
		free: false,
	},
	itemLocation: {
		country: 'United States',
		zipcode: '12345',
	},
	viewCount: 45,
	watchCount: 12,
	soldCount: 5,
};

export const mockEbayListings = [
	{ ...mockEbayListing, legacyItemId: '111' },
	{ ...mockEbayListing, legacyItemId: '222', price: '249.99' },
	{ ...mockEbayListing, legacyItemId: '333', price: '149.99' },
];

export const faqAccordionData = {
	'@context': 'https://schema.org',
	'@type': 'FAQPage',
	name: 'Test FAQs',
	description: 'Frequently asked questions for testing',
	mainEntity: [
		{
			'@type': 'Question',
			name: 'What is this component?',
			category: 'Getting Started',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'This is a FAQ accordion component that displays frequently asked questions in an expandable format.',
			},
		},
		{
			'@type': 'Question',
			name: 'How does search work?',
			category: 'Technical Details',
			acceptedAnswer: {
				'@type': 'Answer',
				text: [
					'The search functionality allows users to filter FAQs by typing keywords.',
					'It searches both question titles and answer content.',
					'Results update in real-time as you type.',
				],
			},
		},
		{
			'@type': 'Question',
			name: 'Can I customize the appearance?',
			category: 'Technical Details',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Yes, the component uses CSS classes that can be customized.',
			},
		},
	],
};

export const pageEngineData = {
	components: [
		{
			component: 'Callout',
			props: {
				title: 'Test Callout',
				content: 'Test content',
			},
			children: [],
		},
		{
			component: 'Page Section',
			props: {
				items: [],
			},
			children: [
				{
					component: 'Callout',
					props: {
						title: 'Child Callout',
						content: 'Child content',
					},
					children: [],
				},
			],
		},
	],
};

export const mockPayPalConfig = {
	clientId: 'AZXjxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
	scriptSrc: 'https://www.paypal.com/sdk/js',
	sdkParams: {
		'client-id': 'AZXjxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
		intent: 'capture',
		currency: 'USD',
		'disable-funding': 'credit,card',
		'disable-card': 'amex',
	},
};

export const mockCheckoutData = {
	subtotal: 89.99,
	shippingCost: 0.0,
	handlingFee: 0.0,
	salesTax: 10.0,
	subtotal_discount: 0,
	total: 99.99,
	items: [
		{
			itemID: 'LAPTOP-001',
			itemQuantity: 1,
			itemCost: 89.99,
			itemTitle: 'Laptop Computer',
			itemURL: 'https://example.com/laptop',
		},
	],
	shippingTo: {
		name: 'John Doe',
	},
};

export const mockPayPalOrder = {
	id: 'ORDER-12345',
	status: 'CREATED',
	purchase_units: [
		{
			amount: {
				currency_code: 'USD',
				value: '99.99',
				breakdown: {
					item_total: { currency_code: 'USD', value: '89.99' },
					tax_total: { currency_code: 'USD', value: '10.00' },
					shipping: { currency_code: 'USD', value: '0.00' },
				},
			},
			items: [
				{
					name: 'Laptop Computer',
					unit_amount: { currency_code: 'USD', value: '89.99' },
					quantity: '1',
					sku: 'LAPTOP-001',
					category: 'PHYSICAL_GOODS',
				},
			],
			shipping: {
				name: { full_name: 'John Doe' },
				address: {
					address_line_1: '2211 N First St',
					admin_area_2: 'San Jose',
					admin_area_1: 'CA',
					postal_code: '95131',
					country_code: 'US',
				},
			},
		},
	],
	payer: {
		name: { given_name: 'John', surname: 'Doe' },
		email_address: 'john@example.com',
		payer_id: 'PAYERID12345',
	},
	create_time: new Date().toISOString(),
};

export const mockPayPalCapture = {
	id: 'ORDER-12345',
	status: 'COMPLETED',
	purchase_units: [
		{
			payments: {
				captures: [
					{
						id: 'CAPTURE-12345',
						status: 'COMPLETED',
						amount: { currency_code: 'USD', value: '99.99' },
						create_time: new Date().toISOString(),
					},
				],
			},
		},
	],
};

export const mockSiteHealthDependencyVulnerabilitiesData = {
	success: true,
	status: 'Low Risk',
	timestamp: new Date().toISOString(),
	url: 'https://test-site.com',
	vulnerabilities: [
		{
			name: 'lodash',
			severity: 'high',
			range: '4.17.20',
			fixAvailable: true,
			title: 'Prototype pollution vulnerability',
		},
		{
			name: 'react',
			severity: 'low',
			range: '16.0.0',
			fixAvailable: true,
			title: 'Minor security update',
		},
	],
	summary: {
		info: 0,
		low: 1,
		moderate: 0,
		high: 1,
		critical: 0,
		total: 2,
	},
	dependencies: 150,
	totalDependencies: 150,
};



export const contentfulAssetsResponseA = {
	items: [
		{
			fields: { file: { contentType: 'image/jpeg', url: '/uploads/image1.jpg' } },
			sys: { createdAt: '2024-01-01T10:00:00Z' },
		},
		{
			fields: { file: { contentType: 'image/png', url: '//example.com/image2.png' } },
			sys: { createdAt: '2024-01-02T10:00:00Z' },
		},
		{
			fields: { file: { contentType: 'image/webp', url: 'https://cdn.example.com/image3.webp' } },
			sys: { createdAt: '2024-01-03T10:00:00Z' },
		},
	],
};

export const contentfulAssetsResponseB = {
	items: [
		{
			fields: { file: { contentType: 'image/jpeg', url: '/valid.jpg' } },
			sys: { createdAt: '2024-01-01T10:00:00Z' },
		},
		{
			fields: { file: { contentType: 'image/png', url: '' } },
			sys: { createdAt: '2024-01-02T10:00:00Z' },
		},
		{
			fields: { file: { contentType: 'image/webp', url: 'another-valid.jpg' } },
			sys: { createdAt: '2024-01-03T10:00:00Z' },
		},
	],
};

export const wordpressPostsMock = [
	{
		ID: 1,
		title: 'Test Post 1',
		featured_image: 'https://i0.wp.com/example.com/image1.jpg',
		content: 'Test content 1',
		excerpt: 'Excerpt 1',
		date: '2024-01-01T00:00:00+00:00',
		URL: 'https://example.com/post-1',
		categories: [],
		author: null,
	},
	{
		ID: 2,
		title: 'Test Post 2',
		featured_image: 'https://example.com/image2.jpg',
		content: 'Test content 2',
		excerpt: 'Excerpt 2',
		date: '2024-01-02T00:00:00+00:00',
		URL: 'https://example.com/post-2',
		categories: [],
		author: null,
	},
	{
		ID: 3,
		title: 'Test Post 3',
		featured_image: null,
		content: 'Test content 3',
		excerpt: 'Excerpt 3',
		date: '2024-01-03T00:00:00+00:00',
		URL: 'https://example.com/post-3',
		categories: [],
		author: null,
	},
];

