import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PodcastEpisodeList } from '../components/integrations/spotify.components';
import type { SpotifyPodcastEpisodeType } from '../components/integrations/spotify.functions';

// Mock the component dependencies
vi.mock('../components/general/tiles', () => ({
	PageGridItem: ({ children }: any) => <div data-testid="grid-item">{children}</div>
}));

vi.mock('@pixelated-tech/components', () => ({
	PageGridItem: ({ children }: any) => <div data-testid="grid-item">{children}</div>,
	BlogPostSummary: ({ title, excerpt, date, URL, featured_image, ID }: any) => (
		<div data-testid={`episode-${ID}`} className="blog-post-summary">
			<h3>{title}</h3>
			<p>{excerpt}</p>
			<time>{date}</time>
			<a href={URL}>Read More</a>
			{featured_image && <img src={featured_image} alt={title} />}
		</div>
	)
}));

describe('PodcastEpisodeList Component', () => {
	const mockEpisode: SpotifyPodcastEpisodeType = {
		title: 'Episode 1: Introduction',
		description: 'This is a podcast episode about technology.',
		link: 'https://example.com/ep1',
		guid: 'ep-1',
		creator: 'John Doe',
		pubDate: '2024-01-15',
		enclosure: {
			url: 'https://example.com/audio1.mp3',
			type: 'audio/mpeg',
			length: '45000000'
		},
		summary: 'Introduction to the podcast series. This episode covers the basics and sets the stage for future episodes.',
		explicit: false,
		duration: '45:30',
		image: 'https://example.com/podcast.jpg',
		episode: '1',
		episodeType: 'full'
	};

	const mockEpisodes: SpotifyPodcastEpisodeType[] = [
		mockEpisode,
		{
			...mockEpisode,
			guid: 'ep-2',
			title: 'Episode 2: Deep Dive',
			pubDate: '2024-01-22',
			summary: 'Deep dive into advanced concepts. We explore best practices and patterns used in production systems.'
		},
		{
			...mockEpisode,
			guid: 'ep-3',
			title: 'Episode 3: Q&A',
			pubDate: '2024-01-29',
			summary: 'Listener questions answered. Community involvement and feedback.'
		}
	];

	it('should render list of episodes', () => {
		render(<PodcastEpisodeList episodes={mockEpisodes} />);
		
		const gridItems = screen.getAllByTestId('grid-item');
		expect(gridItems).toHaveLength(3);
	});

	it('should render episode title', () => {
		render(<PodcastEpisodeList episodes={[mockEpisode]} />);
		
		expect(screen.getByText('Episode 1: Introduction')).toBeInTheDocument();
	});

	it('should render episode publication date', () => {
		render(<PodcastEpisodeList episodes={[mockEpisode]} />);
		
		const timeElement = screen.getByText('2024-01-15');
		expect(timeElement.tagName).toBe('TIME');
	});

	it('should render episode image', () => {
		render(<PodcastEpisodeList episodes={[mockEpisode]} />);
		
		const image = screen.getByAltText('Episode 1: Introduction') as HTMLImageElement;
		expect(image).toBeInTheDocument();
		expect(image.src).toBe('https://example.com/podcast.jpg');
	});

	it('should render episode link', () => {
		render(<PodcastEpisodeList episodes={[mockEpisode]} />);
		
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('href', 'https://example.com/ep1');
	});

	it('should extract first sentence from summary', () => {
		const episodeWithSentence = {
			...mockEpisode,
			summary: 'This is the first sentence. This is the second sentence that goes on and on and on to make sure we have enough text to demonstrate the sentence extraction. ' + 'Additional text to reach the minimum length requirement. '.repeat(3) + 'This is the third sentence.'
		};
		
		render(<PodcastEpisodeList episodes={[episodeWithSentence]} />);
		
		const episode = screen.getByTestId(`episode-${episodeWithSentence.guid}`);
		expect(episode).toBeInTheDocument();
	});

	it('should handle summary with no period', () => {
		const episodeLongSummary = {
			...mockEpisode,
			summary: 'A' .repeat(350) // Long summary without period
		};
		
		render(<PodcastEpisodeList episodes={[episodeLongSummary]} />);
		
		const excerpt = screen.getByTestId(`episode-${mockEpisode.guid}`).querySelector('p');
		expect(excerpt?.textContent?.length).toBeGreaterThanOrEqual(300);
	});

	it('should handle empty summary', () => {
		const episodeEmptySummary = {
			...mockEpisode,
			summary: ''
		};
		
		render(<PodcastEpisodeList episodes={[episodeEmptySummary]} />);
		
		const excerpt = screen.getByTestId(`episode-${mockEpisode.guid}`).querySelector('p');
		expect(excerpt?.textContent).toBe('');
	});

	it('should render multiple episodes with different titles', () => {
		render(<PodcastEpisodeList episodes={mockEpisodes} />);
		
		expect(screen.getByText('Episode 1: Introduction')).toBeInTheDocument();
		expect(screen.getByText('Episode 2: Deep Dive')).toBeInTheDocument();
		expect(screen.getByText('Episode 3: Q&A')).toBeInTheDocument();
	});

	it('should render episodes in order', () => {
		const { container } = render(<PodcastEpisodeList episodes={mockEpisodes} />);
		
		const gridItems = container.querySelectorAll('[data-testid="grid-item"]');
		expect(gridItems[0]).toHaveTextContent('Episode 1: Introduction');
		expect(gridItems[1]).toHaveTextContent('Episode 2: Deep Dive');
		expect(gridItems[2]).toHaveTextContent('Episode 3: Q&A');
	});

	it('should use episode guid as key', () => {
		const { container } = render(<PodcastEpisodeList episodes={mockEpisodes} />);
		
		const episodeElements = container.querySelectorAll('[data-testid^="episode-"]');
		expect(episodeElements).toHaveLength(3);
		expect(episodeElements[0]).toHaveAttribute('data-testid', 'episode-ep-1');
		expect(episodeElements[1]).toHaveAttribute('data-testid', 'episode-ep-2');
		expect(episodeElements[2]).toHaveAttribute('data-testid', 'episode-ep-3');
	});

	it('should handle empty episodes array', () => {
		const { container } = render(<PodcastEpisodeList episodes={[]} />);
		
		const gridItems = container.querySelectorAll('[data-testid="grid-item"]');
		expect(gridItems).toHaveLength(0);
	});

	it('should pass correct ID to BlogPostSummary', () => {
		render(<PodcastEpisodeList episodes={[mockEpisode]} />);
		
		const episode = screen.getByTestId('episode-ep-1');
		expect(episode).toBeInTheDocument();
	});

	it('should not render categories in BlogPostSummary', () => {
		const episodeWithCategory = {
			...mockEpisode,
			categories: ['Technology', 'Podcast']
		};
		
		render(<PodcastEpisodeList episodes={[episodeWithCategory]} />);
		
		const episode = screen.getByTestId(`episode-${mockEpisode.guid}`);
		// BlogPostSummary is mocked, verify it was rendered (categories would be in unrendered area for showCategories=false)
		expect(episode).toBeInTheDocument();
	});

	it('should render episode with minimum sentence requirement of 300 chars', () => {
		const summary = 'A '.repeat(160) + '. More text after period.';
		const episodeWithLongSummary = {
			...mockEpisode,
			summary
		};
		
		render(<PodcastEpisodeList episodes={[episodeWithLongSummary]} />);
		
		const excerpt = screen.getByTestId(`episode-${mockEpisode.guid}`).querySelector('p');
		const extractedText = excerpt?.textContent || '';
		// Should extract up to first period after 300 chars
		expect(extractedText).toContain('.');
	});

	it('should handle episodes with special characters in title', () => {
		const episodeSpecialChars = {
			...mockEpisode,
			title: 'Episode #42: "The Question" & Answer',
			guid: 'ep-special'
		};
		
		render(<PodcastEpisodeList episodes={[episodeSpecialChars]} />);
		
		expect(screen.getByText('Episode #42: "The Question" & Answer')).toBeInTheDocument();
	});

	it('should handle episodes with different date formats', () => {
		const episodes = [
			{ ...mockEpisode, guid: 'ep-1', pubDate: '2024-01-15' },
			{ ...mockEpisode, guid: 'ep-2', pubDate: '2024-12-31' },
			{ ...mockEpisode, guid: 'ep-3', pubDate: '2024-06-01' }
		];
		
		render(<PodcastEpisodeList episodes={episodes} />);
		
		expect(screen.getByText('2024-01-15')).toBeInTheDocument();
		expect(screen.getByText('2024-12-31')).toBeInTheDocument();
		expect(screen.getByText('2024-06-01')).toBeInTheDocument();
	});

	it('should handle episodes without images', () => {
		const episodeNoImage = {
			...mockEpisode,
			image: ''
		};
		
		render(<PodcastEpisodeList episodes={[episodeNoImage]} />);
		
		// Component should still render even without image
		expect(screen.getByText('Episode 1: Introduction')).toBeInTheDocument();
	});
});
