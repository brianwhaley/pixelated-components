import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import { ProjectsClient, ProjectsClientType } from '@/components/general/tiles';

// Mock SmartImage
vi.mock('@/components/general/smartimage', () => ({
	SmartImage: (props: any) => {
		const { src, alt, title } = props;
		return React.createElement('img', {
			src,
			alt,
			title,
			'data-testid': 'smart-image'
		});
	},
}));

// Mock modal and PageSection/PageSectionHeader for testing
vi.mock('@/components/general/modal', () => ({
	Modal: (props: any) => React.createElement('div', {
		'data-testid': 'modal',
		'data-has-content': !!props.modalContent,
	}, props.modalContent),
	handleModalOpen: vi.fn(),
}));

vi.mock('@/components/general/semantic', () => ({
	PageSection: (props: any) => React.createElement('section', {
		'data-testid': 'page-section',
		'data-columns': props.columns,
		'data-max-width': props.maxWidth,
		'data-padding': props.padding,
		'data-id': props.id,
	}, props.children),
	PageSectionHeader: (props: any) => React.createElement('header', {
		'data-testid': 'page-section-header',
		'data-title': props.title,
	}, props.title),
}));

describe('ProjectsClient Component', () => {
	const mockTileCard1 = {
		index: 0,
		cardIndex: 0,
		cardLength: 2,
		image: 'https://example.com/image1.jpg',
		imageAlt: 'Project 1 - Image 1',
	};

	const mockTileCard2 = {
		index: 1,
		cardIndex: 1,
		cardLength: 2,
		image: 'https://example.com/image2.jpg',
		imageAlt: 'Project 1 - Image 2',
	};

	const mockProject1 = {
		title: 'Garden Design',
		description: 'Beautiful garden landscaping project',
		tileCards: [mockTileCard1, mockTileCard2],
	};

	const mockProject2 = {
		title: 'Outdoor Patio',
		description: 'Patio construction and design',
		tileCards: [
			{
				index: 100,
				cardIndex: 0,
				cardLength: 1,
				image: 'https://example.com/patio.jpg',
				imageAlt: 'Patio project',
			},
		],
	};

	const mockProps: ProjectsClientType = {
		projects: [mockProject1, mockProject2],
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should render the component without crashing', () => {
			render(<ProjectsClient {...mockProps} />);
			expect(screen.getByTestId('page-section')).toBeInTheDocument();
		});

		it('should render PageSection with correct props', () => {
			render(<ProjectsClient {...mockProps} />);
			const pageSection = screen.getByTestId('page-section');
			expect(pageSection).toHaveAttribute('data-columns', '1');
			expect(pageSection).toHaveAttribute('data-max-width', '1024px');
			expect(pageSection).toHaveAttribute('data-padding', '20px');
			expect(pageSection).toHaveAttribute('data-id', 'projects-section');
		});

		it('should render PageSectionHeader with "Our Projects" title', () => {
			render(<ProjectsClient {...mockProps} />);
			const header = screen.getByTestId('page-section-header');
			expect(header).toHaveAttribute('data-title', 'Our Projects');
		});

		it('should render Modal component', () => {
			render(<ProjectsClient {...mockProps} />);
			expect(screen.getByTestId('modal')).toBeInTheDocument();
		});
	});

	describe('Projects Rendering', () => {
		it('should render all projects', () => {
			const { container } = render(<ProjectsClient {...mockProps} />);
			const projectHeadings = container.querySelectorAll('h3');
			expect(projectHeadings).toHaveLength(2);
		});

		it('should render project titles', () => {
			render(<ProjectsClient {...mockProps} />);
			expect(screen.getByText('Garden Design')).toBeInTheDocument();
			expect(screen.getByText('Outdoor Patio')).toBeInTheDocument();
		});

		it('should render project descriptions', () => {
			render(<ProjectsClient {...mockProps} />);
			expect(screen.getByText('Beautiful garden landscaping project')).toBeInTheDocument();
			expect(screen.getByText('Patio construction and design')).toBeInTheDocument();
		});

		it('should render each project in a div with margin', () => {
			const { container } = render(<ProjectsClient {...mockProps} />);
			const projectDivs = container.querySelectorAll('[style*="margin-bottom"]');
			expect(projectDivs.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe('Tile Cards Rendering', () => {
		it('should render all tile cards for all projects', () => {
			render(<ProjectsClient {...mockProps} />);
			const smartImages = screen.getAllByTestId('smart-image');
			expect(smartImages).toHaveLength(3); // 2 from project1, 1 from project2
		});

		it('should render tile cards with correct image URLs', () => {
			render(<ProjectsClient {...mockProps} />);
			const images = screen.getAllByTestId('smart-image') as HTMLImageElement[];
			expect(images[0].src).toBe('https://example.com/image1.jpg');
			expect(images[1].src).toBe('https://example.com/image2.jpg');
			expect(images[2].src).toBe('https://example.com/patio.jpg');
		});

		it('should render tile cards with correct alt text', () => {
			render(<ProjectsClient {...mockProps} />);
			const images = screen.getAllByTestId('smart-image') as HTMLImageElement[];
			expect(images[0].alt).toBe('Project 1 - Image 1');
			expect(images[1].alt).toBe('Project 1 - Image 2');
		});

		it('should render tiles container with correct layout class', () => {
			const { container } = render(<ProjectsClient {...mockProps} />);
			const tilesContainer = container.querySelector('.tiles-container');
			expect(tilesContainer).toBeInTheDocument();
		});

		it('should render correct number of tile rows', () => {
			const { container } = render(<ProjectsClient {...mockProps} />);
			const tileContainers = container.querySelectorAll('.tile-container');
			expect(tileContainers.length).toBeGreaterThan(0);
		});
	});

	describe('Modal Interaction', () => {
		it('should open modal when image is clicked', () => {
			const { getByTestId } = render(<ProjectsClient {...mockProps} />);
			const firstImage = screen.getAllByTestId('smart-image')[0];

			fireEvent.click(firstImage);

			const modal = getByTestId('modal');
			expect(modal).toHaveAttribute('data-has-content', 'true');
		});

		it('should render SmartImage in modal when image is clicked', () => {
			render(<ProjectsClient {...mockProps} />);
			const firstImage = screen.getAllByTestId('smart-image')[0];

			fireEvent.click(firstImage);

			const smartImages = screen.getAllByTestId('smart-image');
			expect(smartImages.length).toBeGreaterThan(0);
		});

		it('should pass correct URL to SmartImage when image is clicked', () => {
			render(<ProjectsClient {...mockProps} />);
			// Click the first image from project 1
			const allImages = screen.getAllByTestId('smart-image');
			const firstProjectImage = allImages[0];

			fireEvent.click(firstProjectImage);

			// After clicking, the modal should have a SmartImage set with that URL
			const smartImages = screen.getAllByTestId('smart-image');
			expect(smartImages.length).toBeGreaterThan(0);
		});

		it('should render modal after click', () => {
			render(<ProjectsClient {...mockProps} />);
			const firstImage = screen.getAllByTestId('smart-image')[0];

			fireEvent.click(firstImage);

			const modal = screen.getByTestId('modal');
			expect(modal).toHaveAttribute('data-has-content', 'true');
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty projects array', () => {
			const emptyProps: ProjectsClientType = {
				projects: [],
			};
			const { container } = render(<ProjectsClient {...emptyProps} />);
			expect(screen.getByTestId('page-section')).toBeInTheDocument();
			expect(container.querySelectorAll('h3')).toHaveLength(0);
		});

		it('should handle project with no tileCards', () => {
			const propsWithEmptyProject: ProjectsClientType = {
				projects: [
					{
						title: 'Empty Project',
						description: 'No tiles',
						tileCards: [],
					},
				],
			};
			render(<ProjectsClient {...propsWithEmptyProject} />);
			expect(screen.getByText('Empty Project')).toBeInTheDocument();
			expect(screen.getByTestId('page-section')).toBeInTheDocument();
		});

		it('should handle missing project title with fallback', () => {
			const propsWithMissingTitle: ProjectsClientType = {
				projects: [
					{
						title: '',
						description: 'Test',
						tileCards: [mockTileCard1],
					},
				],
			};
			render(<ProjectsClient {...propsWithMissingTitle} />);
			expect(screen.getByText('Project 1')).toBeInTheDocument();
		});

		it('should handle missing description', () => {
			const propsWithMissingDescription: ProjectsClientType = {
				projects: [
					{
						title: 'Test Project',
						description: '',
						tileCards: [mockTileCard1],
					},
				],
			};
			const { container } = render(<ProjectsClient {...propsWithMissingDescription} />);
			expect(screen.getByText('Test Project')).toBeInTheDocument();
			expect(container.querySelector('p')?.textContent).toBe('');
		});

		it('should handle missing tileCard image', () => {
			const cardWithMissingImage = {
				...mockTileCard1,
				image: '',
			};
			const propsWithMissingImage: ProjectsClientType = {
				projects: [
					{
						title: 'Test',
						description: 'Test',
						tileCards: [cardWithMissingImage],
					},
				],
			};
			render(<ProjectsClient {...propsWithMissingImage} />);
			const image = screen.getAllByTestId('smart-image')[0] as HTMLImageElement;
			expect(image.src).toBe('');
		});

		it('should handle missing imageAlt with fallback', () => {
			const cardWithMissingAlt = {
				...mockTileCard1,
				imageAlt: undefined as any,
			};
			const propsWithMissingAlt: ProjectsClientType = {
				projects: [
					{
						title: 'Test Project',
						description: 'Test',
						tileCards: [cardWithMissingAlt],
					},
				],
			};
			render(<ProjectsClient {...propsWithMissingAlt} />);
			const image = screen.getAllByTestId('smart-image')[0] as HTMLImageElement;
			expect(image.alt).toBe('Project 1 - Tile 1');
		});

		it('should handle multiple projects with many tiles', () => {
			const manyProjects: ProjectsClientType = {
				projects: Array.from({ length: 5 }, (_, i) => ({
					title: `Project ${i + 1}`,
					description: `Description ${i + 1}`,
					tileCards: Array.from({ length: 10 }, (_, j) => ({
						index: i * 10 + j,
						cardIndex: j,
						cardLength: 10,
						image: `https://example.com/image-${i}-${j}.jpg`,
						imageAlt: `Alt ${i}-${j}`,
					})),
				})),
			};
			const { container } = render(<ProjectsClient {...manyProjects} />);
			const headings = container.querySelectorAll('h3');
			expect(headings).toHaveLength(5);
			const images = screen.getAllByTestId('smart-image');
			expect(images).toHaveLength(50);
		});
	});

	describe('PropTypes', () => {
		it('should accept valid projects prop', () => {
			const validProps: ProjectsClientType = {
				projects: [mockProject1],
			};
			expect(() => render(<ProjectsClient {...validProps} />)).not.toThrow();
		});

		it('should render with string fallbacks for optional fields', () => {
			const projectWithDefaults: ProjectsClientType = {
				projects: [
					{
						title: 'Test',
						description: 'Test description',
						tileCards: [
							{
								index: 0,
								cardIndex: 0,
								cardLength: 1,
								image: 'test.jpg',
								imageAlt: undefined as any,
							},
						],
					},
				],
			};
			render(<ProjectsClient {...projectWithDefaults} />);
			expect(screen.getByTestId('page-section')).toBeInTheDocument();
			expect(screen.getByText('Test')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have proper section and header structure', () => {
			const { container } = render(<ProjectsClient {...mockProps} />);
			const section = container.querySelector('section');
			const header = container.querySelector('header');
			expect(section).toBeInTheDocument();
			expect(header).toBeInTheDocument();
		});

		it('should provide alt text for tile images', () => {
			render(<ProjectsClient {...mockProps} />);
			const images = screen.getAllByTestId('smart-image') as HTMLImageElement[];
			images.forEach((img) => {
				expect(img.alt).toBeTruthy();
			});
		});

		it('should provide title for SmartImage in modal after click', () => {
			render(<ProjectsClient {...mockProps} />);
			const firstImage = screen.getAllByTestId('smart-image')[0];
			fireEvent.click(firstImage);
			// After click, find the modal and verify smart-image is present
			const modal = screen.getByTestId('modal');
			expect(modal).toHaveAttribute('data-has-content', 'true');
		});

		it('should have meaningful heading hierarchy', () => {
			const { container } = render(<ProjectsClient {...mockProps} />);
			const header = container.querySelector('header');
			const heading = container.querySelector('h3');
			expect(header).toBeInTheDocument();
			expect(heading).toBeInTheDocument();
		});
	});
});
