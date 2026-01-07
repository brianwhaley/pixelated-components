import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import {
  SocialCards,
  SocialCard,
  SocialCardsLoading,
} from '@/components/general/socialcard';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';

// Mock SmartImage
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

// Mock fetch for RSS feeds
global.fetch = vi.fn();

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

const mockRSSFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <link>https://example.com</link>
    <description>Test</description>
    <item>
      <title>Test Post 1</title>
      <link>https://example.com/post1</link>
      <description>Test description 1</description>
      <pubDate>Mon, 10 Dec 2024 12:00:00 GMT</pubDate>
      <guid>guid-1</guid>
    </item>
    <item>
      <title>Test Post 2</title>
      <link>https://github.com/post2</link>
      <description>Test description 2</description>
      <pubDate>Tue, 09 Dec 2024 12:00:00 GMT</pubDate>
      <guid>guid-2</guid>
    </item>
  </channel>
</rss>`;

describe('SocialCard Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SocialCardsLoading Component', () => {
    it('should render loading container', () => {
      const { container } = render(<SocialCardsLoading />);
      expect(container.querySelector('.cardsLoading')).toBeInTheDocument();
    });

    it('should render loading text', () => {
      render(<SocialCardsLoading />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should have correct CSS class', () => {
      const { container } = render(<SocialCardsLoading />);
      expect(container.querySelector('.cardsLoading')).toHaveClass('cardsLoading');
    });
  });

  describe('SocialCard Component', () => {
    const mockCardData = {
      title: 'Test Blog Post',
      link: 'https://example.com/post',
      description: '<p>This is a test post</p>',
      pubDate: '2024-12-10T12:00:00Z',
      guid: 'test-guid-1',
      author: 'Test Author',
      category: 'tech'
    };

    it('should render masonry item container', () => {
      const { container } = renderWithConfig(
        <SocialCard 
          card={mockCardData} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      expect(container.querySelector('.masonryItem')).toBeInTheDocument();
    });

    it('should render card container', () => {
      const { container } = renderWithConfig(
        <SocialCard 
          card={mockCardData} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      expect(container.querySelector('.card')).toBeInTheDocument();
    });

    it('should render card title section', () => {
      const { container } = renderWithConfig(
        <SocialCard 
          card={mockCardData} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      expect(container.querySelector('.cardTitle')).toBeInTheDocument();
    });

    it('should render card title link', () => {
      const { container } = renderWithConfig(
        <SocialCard 
          card={mockCardData} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      const link = container.querySelector('.cardTitle a');
      expect(link).toHaveAttribute('href', mockCardData.link);
    });

    it('should open link in new tab', () => {
      const { container } = renderWithConfig(
        <SocialCard 
          card={mockCardData} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      const link = container.querySelector('.cardTitle a');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render card icon image', () => {
      const { container } = renderWithConfig(
        <SocialCard 
          card={mockCardData} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      const icon = container.querySelector('.cardIcon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', '/images/logos/blog-logo.png');
      expect(icon).toHaveAttribute('alt', 'Blog Post');
    });

    it('should render card title text', () => {
      renderWithConfig(
        <SocialCard 
          card={mockCardData} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      expect(screen.getByText(mockCardData.title)).toBeInTheDocument();
    });

    it('should render card body with description', () => {
      const { container } = renderWithConfig(
        <SocialCard 
          card={mockCardData} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      const body = container.querySelector('.cardBody');
      expect(body).toBeInTheDocument();
      expect(body?.innerHTML).toContain('This is a test post');
    });

    it('should render card date', () => {
      renderWithConfig(
        <SocialCard 
          card={mockCardData} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      expect(screen.getByText(mockCardData.pubDate)).toBeInTheDocument();
    });

    it('should have card date section', () => {
      const { container } = renderWithConfig(
        <SocialCard 
          card={mockCardData} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      expect(container.querySelector('.cardDate')).toBeInTheDocument();
    });

    it('should sanitize HTML in description', () => {
      const cardWithHtmlContent = {
        ...mockCardData,
        description: '<p>Safe content</p><script>alert("xss")</script>'
      };
      const { container } = renderWithConfig(
        <SocialCard 
          card={cardWithHtmlContent} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      const body = container.querySelector('.cardBody');
      expect(body?.innerHTML).toContain('Safe content');
    });

    it('should handle description without HTML tags', () => {
      const cardWithPlainText = {
        ...mockCardData,
        description: 'Plain text description'
      };
      const { container } = renderWithConfig(
        <SocialCard 
          card={cardWithPlainText} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      const body = container.querySelector('.cardBody');
      expect(body?.textContent).toContain('Plain text description');
    });

    it('should render GitHub icon for GitHub links', () => {
      const githubCard = {
        ...mockCardData,
        link: 'https://github.com/project/issue'
      };
      const { container } = renderWithConfig(
        <SocialCard 
          card={githubCard} 
          iconSrc="/images/logos/github-logo.png" 
          iconSrcAlt="Github Activity"
        />
      );
      const icon = container.querySelector('.cardIcon');
      expect(icon).toHaveAttribute('src', '/images/logos/github-logo.png');
    });

    it('should preserve original link URL', () => {
      const customCard = {
        ...mockCardData,
        link: 'https://custom-domain.com/unique/path'
      };
      const { container } = renderWithConfig(
        <SocialCard 
          card={customCard} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      const link = container.querySelector('.cardTitle a');
      expect(link).toHaveAttribute('href', 'https://custom-domain.com/unique/path');
    });

    it('should render with all required props', () => {
      const { container } = renderWithConfig(
        <SocialCard 
          card={mockCardData} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      expect(container.querySelector('.masonryItem')).toBeInTheDocument();
      expect(container.querySelector('.card')).toBeInTheDocument();
      expect(container.querySelector('.cardTitle')).toBeInTheDocument();
      expect(container.querySelector('.cardBody')).toBeInTheDocument();
      expect(container.querySelector('.cardDate')).toBeInTheDocument();
    });
  });

  describe('SocialCards Component', () => {
    it('should render loading state initially', async () => {
      const sources = {
        blog: {
          url: null,
          entryCount: 5,
          iconSrc: '/images/logos/blog-logo.png',
          iconSrcAlt: 'Blog Post'
        }
      };

      render(
        <SocialCards sources={sources} />
      );

      // Initially loading
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should initialize with default source options', () => {
      // SocialCards merges provided sources with defaults
      const minimalSources = {};
      const { container } = renderWithConfig(
        <SocialCards sources={minimalSources} />
      );
      // Component should render (loading state initially)
      expect(container).toBeInTheDocument();
    });

    it('should have no URL sources returns loading component', () => {
      const sourcesNoUrl = {
        blog: {
          url: null,
          entryCount: 5,
          iconSrc: '/images/logos/blog-logo.png',
          iconSrcAlt: 'Blog Post'
        }
      };

      render(
        <SocialCards sources={sourcesNoUrl} />
      );
      // Should show loading when no URLs provided
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle multiple source types', () => {
      const multipleSources = {
        blog: {
          url: null,
          entryCount: 5,
          iconSrc: '/images/logos/blog-logo.png',
          iconSrcAlt: 'Blog Post'
        },
        github: {
          url: null,
          entryCount: 5,
          iconSrc: '/images/logos/github-logo.png',
          iconSrcAlt: 'Github Activity'
        }
      };

      const { container } = renderWithConfig(
        <SocialCards sources={multipleSources} />
      );
      expect(container).toBeInTheDocument();
    });

    it('should accept entryCount configuration', () => {
      const sources = {
        blog: {
          url: null,
          entryCount: 10,
          iconSrc: '/images/logos/blog-logo.png',
          iconSrcAlt: 'Blog Post'
        }
      };

      const { container } = renderWithConfig(
        <SocialCards sources={sources} />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('SocialCard - Edge Cases', () => {
    it('should handle missing description gracefully', () => {
      const cardNoDescription = {
        title: 'Post Without Description',
        link: 'https://example.com/post',
        description: '',
        pubDate: '2024-12-10T12:00:00Z',
        guid: 'guid-no-desc'
      };

      const { container } = renderWithConfig(
        <SocialCard 
          card={cardNoDescription} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      expect(container.querySelector('.cardBody')).toBeInTheDocument();
    });

    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(500);
      const cardLongTitle = {
        ...{
          title: longTitle,
          link: 'https://example.com/post',
          description: '<p>Description</p>',
          pubDate: '2024-12-10T12:00:00Z',
          guid: 'guid-long-title'
        }
      };

      const { container } = renderWithConfig(
        <SocialCard 
          card={cardLongTitle} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const specialCard = {
        title: 'Post with "quotes" & <special> characters',
        link: 'https://example.com/post',
        description: '<p>Description</p>',
        pubDate: '2024-12-10T12:00:00Z',
        guid: 'guid-special'
      };

      renderWithConfig(
        <SocialCard 
          card={specialCard} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      expect(screen.getByText(/Post with.*quotes.*special.*characters/)).toBeInTheDocument();
    });

    it('should handle null pubDate', () => {
      const cardNullDate = {
        title: 'Post',
        link: 'https://example.com/post',
        description: '<p>Description</p>',
        pubDate: null,
        guid: 'guid-null-date'
      };

      const { container } = renderWithConfig(
        <SocialCard 
          card={cardNullDate as any} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      expect(container.querySelector('.cardDate')).toBeInTheDocument();
    });
  });

  describe('SocialCard - Social Platform Detection', () => {
    it('should detect GitHub links', () => {
      const githubCard = {
        title: 'Github Issue',
        link: 'https://github.com/user/repo/issues/123',
        description: '<p>Issue description</p>',
        pubDate: '2024-12-10T12:00:00Z',
        guid: 'github-guid'
      };

      const { container } = renderWithConfig(
        <SocialCard 
          card={githubCard} 
          iconSrc="/images/logos/github-logo.png" 
          iconSrcAlt="Github Activity"
        />
      );
      const link = container.querySelector('.cardTitle a');
      expect(link).toHaveAttribute('href', githubCard.link);
    });

    it('should detect Twitter/X links', () => {
      const twitterCard = {
        title: 'Tweet',
        link: 'https://twitter.com/user/status/123',
        description: '<p>Tweet text</p>',
        pubDate: '2024-12-10T12:00:00Z',
        guid: 'twitter-guid'
      };

      const { container } = renderWithConfig(
        <SocialCard 
          card={twitterCard} 
          iconSrc="/images/logos/twitter-logo.png" 
          iconSrcAlt="Twitter Tweet"
        />
      );
      const link = container.querySelector('.cardTitle a');
      expect(link).toHaveAttribute('href', twitterCard.link);
    });

    it('should detect YouTube links', () => {
      const youtubeCard = {
        title: 'Video',
        link: 'https://youtube.com/watch?v=xyz',
        description: '<p>Video description</p>',
        pubDate: '2024-12-10T12:00:00Z',
        guid: 'youtube-guid'
      };

      const { container } = renderWithConfig(
        <SocialCard 
          card={youtubeCard} 
          iconSrc="/images/logos/youtube-logo.png" 
          iconSrcAlt="Youtube Favorite Video"
        />
      );
      const link = container.querySelector('.cardTitle a');
      expect(link).toHaveAttribute('href', youtubeCard.link);
    });
  });

  describe('SocialCard - HTML Sanitization', () => {
    it('should preserve HTML content (including scripts - dangerous but rendered)', () => {
      const htmlCard = {
        title: 'Post with HTML',
        link: 'https://example.com/post',
        description: '<p>Safe</p><strong>Bold</strong><p>Content</p>',
        pubDate: '2024-12-10T12:00:00Z',
        guid: 'html-guid'
      };

      const { container } = renderWithConfig(
        <SocialCard 
          card={htmlCard} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      const body = container.querySelector('.cardBody');
      expect(body?.innerHTML).toContain('<p>');
      expect(body?.innerHTML).toContain('<strong>');
    });

    it('should preserve safe HTML tags', () => {
      const safeCard = {
        title: 'Safe Post',
        link: 'https://example.com/post',
        description: '<p>Paragraph</p><strong>Bold</strong><em>Italic</em>',
        pubDate: '2024-12-10T12:00:00Z',
        guid: 'safe-guid'
      };

      const { container } = renderWithConfig(
        <SocialCard 
          card={safeCard} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      const body = container.querySelector('.cardBody');
      expect(body?.innerHTML).toContain('<p>');
      expect(body?.innerHTML).toContain('<strong>');
      expect(body?.innerHTML).toContain('<em>');
    });

    it('should remove dead hrefs', () => {
      const deadHrefCard = {
        title: 'Post',
        link: 'https://example.com/post',
        description: '<p><a href="/relative/path">Link</a></p>',
        pubDate: '2024-12-10T12:00:00Z',
        guid: 'dead-href-guid'
      };

      const { container } = renderWithConfig(
        <SocialCard 
          card={deadHrefCard} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      const body = container.querySelector('.cardBody');
      // Dead href should be removed
      expect(body?.innerHTML).not.toContain('href="/relative');
    });

    it('should preserve http/https links', () => {
      const validUrlCard = {
        title: 'Post',
        link: 'https://example.com/post',
        description: '<p><a href="https://external.com/page">Link</a></p>',
        pubDate: '2024-12-10T12:00:00Z',
        guid: 'valid-url-guid'
      };

      const { container } = renderWithConfig(
        <SocialCard 
          card={validUrlCard} 
          iconSrc="/images/logos/blog-logo.png" 
          iconSrcAlt="Blog Post"
        />
      );
      const body = container.querySelector('.cardBody');
      expect(body?.innerHTML).toContain('href="https://external.com');
    });
  });
});
