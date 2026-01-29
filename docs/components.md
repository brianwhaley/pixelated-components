# Component Reference Guide

This guide provides detailed API documentation and usage examples for all Pixelated Components.

## � Reference Implementation

For a complete working example of Pixelated Components in action, check out the [pixelated-admin](https://github.com/brianwhaley/pixelated-admin) project. This admin interface demonstrates real-world usage of all components with:

- **Component Integration**: Live examples of component combinations
- **Configuration Management**: Dynamic site configuration with ConfigBuilder
- **Page Building**: Visual page construction workflows
- **Authentication**: Secure admin access patterns
- **Production Setup**: HTTPS, optimization, and deployment configurations

## �📋 Table of Contents

### General Components
- [Accordion](#accordion)
- [Callout](#callout)
- [CSS](#css)
- [Loading](#loading)
- [SplitScroll](#splitscroll)
- [MicroInteractions](#microinteractions)
- [Modal](#modal)
- [Semantic](#semantic)
- [SidePanel](#sidepanel)
- [SmartImage](#smartimage)
- [Tab](#tab)
- [Table](#table)
- [CacheManager](#cachemanager)
- [Intersection Observer Utility](#intersection-observer-utility)

### CMS Integration
- [Calendly](#calendly)
- [CloudinaryImage](#cloudinaryimage)
- [ContentfulItems](#contentfulitems)
- [GoogleReviews](#googlereviews)
- [Gravatar](#gravatar)
- [HubSpot](#hubspot)
- [Instagram](#instagram)
- [Lipsum](#lipsum)
- [WordPress](#wordpress)

### UI Components
- [Carousel](#carousel)
- [Forms](#forms)
- [Menu](#menu)
- [Tables](#tables)
- [Tiles](#tiles)

### PageBuilder Components
- [ComponentPropertiesForm](#componentpropertiesform)
- [ComponentSelector](#componentselector)
- [ComponentTree](#componenttree)
- [ConfigBuilder](#configbuilder)
- [PageBuilderUI](#pagebuilderui)
- [PageEngine](#pageengine)
- [SaveLoadSection](#saveloadsection)

### SEO & Schema
- [FAQAccordion](#faqaccordion)
- [404 Page](#404-page)
- [GoogleAnalytics](#googleanalytics)
- [GoogleMap](#googlemap)
- [GoogleSearch](#googlesearch)
- [JSON-LD Schemas](#json-ld-schemas)
- [Manifest](#manifest)
- [MetadataComponents](#metadatacomponents)

### Shopping Cart
- [eBay Components](#ebay-components)
- [PayPal](#paypal)
- [ShoppingCart](#shoppingcart)

### Structured Content
- [BuzzwordBingo](#buzzwordbingo)
- [Markdown](#markdown)
- [Recipe](#recipe)
- [Resume](#resume)
- [SocialCard](#socialcard)
- [Timeline](#timeline)

### Entertainment
- [NerdJoke](#nerdjoke)

---

## 📖 Usage Examples

### Basic Component Usage

```tsx
import { Accordion, Callout, SmartImage } from '@pixelated-tech/components';

function MyApp() {
  return (
    <div>
      <Accordion items={[
        { title: 'How it works', content: 'This component uses native HTML details elements...' },
        { title: 'Why use it', content: 'Accessible, lightweight, and SEO-friendly...' }
      ]} />

      <Callout
        title="Welcome!"
        content="This is a highlighted callout message"
        variant="boxed"
      />

      <SmartImage
        src="/path/to/image.jpg"
        alt="Description"
        aboveFold={true}
      />
    </div>
  );
}
```

### Storybook Interactive Demos

For interactive component exploration:

```bash
# Start Storybook development server
npm run storybook
```

**Storybook provides:**
- ✅ **Live component playground** - Try different props and see results instantly
- ✅ **Multiple variants** - See components in different states and configurations
- ✅ **Responsive testing** - Check how components behave on different screen sizes
- ✅ **Accessibility testing** - Built-in a11y checks and guidelines
- ✅ **Component documentation** - Auto-generated from TypeScript interfaces

**Access locally at:** `http://localhost:6006`

---

## General Components

### Accordion

Expandable content component using native `<details>` elements for accessibility and SEO.

```tsx
import { Accordion } from '@pixelated-tech/components';

const items = [
  {
    title: 'What is React?',
    content: 'React is a JavaScript library for building user interfaces.'
  },
  {
    title: 'How does it work?',
    content: 'React uses a component-based architecture and virtual DOM.'
  }
];

<Accordion items={items} />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array<{title: string, content: string \| ReactNode}>` | - | Array of accordion items |
| `className` | `string` | - | Additional CSS classes |

#### Features
- ✅ **Accessible** - Uses semantic HTML with proper ARIA attributes
- ✅ **SEO-friendly** - Content is crawlable when expanded
- ✅ **Lightweight** - No JavaScript required for basic functionality
- ✅ **Customizable** - Full CSS customization support

---

### Callout

Flexible content highlight component with image and button support.

```tsx
import { Callout } from '@pixelated-tech/components';

<Callout
  title="Important Notice"
  content="This is a highlighted message"
  variant="boxed"
  img="/path/to/image.jpg"
  url="/learn-more"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Callout title |
| `content` | `string \| ReactNode` | - | Callout content |
| `variant` | `'default' \| 'boxed' \| 'full' \| 'grid' \| 'overlay' \| 'split'` | `'default'` | Visual style variant |
| `boxShape` | `'square' \| 'bevel' \| 'squircle' \| 'round'` | `'squircle'` | Border radius style |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | Content layout |
| `direction` | `'left' \| 'right'` | `'left'` | Image position (when layout is horizontal) |
| `gridColumns` | `{left: number, right: number}` | `{left: 1, right: 2}` | Grid column distribution |
| `img` | `string` | - | Image URL |
| `imgAlt` | `string` | - | Image alt text |
| `imgShape` | `'square' \| 'bevel' \| 'squircle' \| 'round'` | `'square'` | Image border radius |
| `imgClick` | `(event: MouseEvent, url?: string) => void` | - | Image click handler |
| `url` | `string` | - | Link URL for the entire callout |
| `buttonText` | `string` | - | Custom button text |
| `subtitle` | `string` | - | Subtitle text |
| `aboveFold` | `boolean` | - | Image optimization hint |
| `children` | `ReactNode` | - | Custom child content rendered below main content |

#### Variants
- **`default`**: Simple layout with optional border
- **`boxed`**: Border around entire callout
- **`full`**: Full-width layout with minimal margins
- **`grid`**: CSS Grid layout with configurable columns
- **`overlay`**: Image overlay with text positioning
- **`split`**: Full-width split layout

---

### Loading

Progress indicator component with multiple animation styles.

```tsx
import { Loading } from '@pixelated-tech/components';

// Default spinner
<Loading />

// Custom message
<Loading message="Loading data..." />

// Different variants
<Loading variant="dots" />
<Loading variant="pulse" />
<Loading variant="bars" />
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'spinner' \| 'dots' \| 'pulse' \| 'bars'` | `'spinner'` | Animation style |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Component size |
| `message` | `string` | - | Loading message text |
| `color` | `string` | - | Custom color (CSS color value) |

---

### Skeleton

A low-level, accessible skeleton primitive for text, rectangular, and avatar placeholders. Use `Skeleton` anywhere a localized placeholder is needed (cards, lists, table rows, form fields).

```tsx
import { Skeleton } from '@pixelated-tech/components';

// Text skeleton (3 lines)
<Skeleton lines={3} />

// Avatar skeleton
<Skeleton variant="avatar" />

// Rect skeleton (explicit height)
<Skeleton variant="rect" height={160} />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'rect' \| 'avatar'` | `'text'` | Visual primitive to render |
| `lines` | `number` | `1` | Number of text lines (text variant) |
| `width` | `string \| number` | `100% \| 60%` | Width (string or percent for text lines) |
| `height` | `string \| number` | `160` (rect) | Height for rect/avatar variants |
| `animated` | `boolean` | `true` | Show pulsing animation (respects prefers-reduced-motion) |

#### CSS classes
- `skeleton` — base primitive
- `skeleton--animated` — animated variant
- `skeleton--avatar` — avatar shape
- `skeleton--rect` — rectangular block
- `skeleton-text`, `skeleton-line` — text layout helpers

#### Accessibility
- Rendered elements are `aria-hidden="true"` by default (decorative).
- Use an offscreen/live region on the page to announce loading state where appropriate.
- Animation respects `prefers-reduced-motion`.

#### Storybook & tests
- Story: `General/Skeleton` (includes deterministic plays)
- Unit tests: `src/tests/skeleton.test.tsx`

---

### SkeletonLoading

Canonical page-level loading UI composed from `Skeleton` primitives (hero + card grid). Use `SkeletonLoading` at the app level to keep loading UX consistent across projects.

```tsx
import { SkeletonLoading } from '@pixelated-tech/components';

// Default
<SkeletonLoading />

// Smaller hero + fewer cards
<SkeletonLoading heroHeight={120} cardCount={3} />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `heroHeight` | `number` | `220` | Height of the hero rectangle (px) |
| `cardCount` | `number` | `6` | Number of card skeletons to render |
| `className` | `string` | - | Additional CSS classes for layout tweaks |

#### Why prefer `SkeletonLoading`?
- Single source of truth for page loading UI and CSS
- Deterministic Storybook `play()` for suspended routes (see `InfiniteHang` story)
- Eliminates duplicated app-level markup and CSS across consumers

#### Migration (app-level)
Replace local `src/app/loading.tsx` implementation with the shared component:

```diff
- import './loading.css';
- export default function Loading() { /* in-file Skeleton */ }
+ import { SkeletonLoading } from '@pixelated-tech/components';
+ export default function Loading() { return <SkeletonLoading />; }
```

#### Storybook & tests
- Story: `General/SkeletonLoading` (`InfiniteHang` play)
- Unit tests: `src/tests/skeleton-loading.test.tsx`

---

### SplitScroll

Split-page scrolling layout component with sticky layered images, perfect for product showcases, portfolios, or storytelling layouts inspired by luxury brand websites.

```tsx
import { SplitScroll } from '@pixelated-tech/components';

<SplitScroll>
  <SplitScroll.Section
    img="/images/product-1.jpg"
    imgAlt="Premium Feature"
    title="Exceptional Quality"
    subtitle="Crafted with Precision"
  >
    <p>Our flagship product combines innovative design with sustainable materials...</p>
  </SplitScroll.Section>
  
  <SplitScroll.Section
    img="/images/product-2.jpg"
    imgAlt="Advanced Technology"
    title="Cutting-Edge Innovation"
    subtitle="Engineering Excellence"
  >
    <h3>Technical Specifications</h3>
    <ul>
      <li>High-performance components</li>
      <li>Energy-efficient design</li>
      <li>Industry-leading warranty</li>
    </ul>
  </SplitScroll.Section>
  
  <SplitScroll.Section
    img="/images/product-3.jpg"
    imgAlt="Customer Experience"
    title="Designed for You"
  >
    <blockquote>
      "This product transformed our workflow completely."
      <footer>— Satisfied Customer</footer>
    </blockquote>
  </SplitScroll.Section>
</SplitScroll>
```

#### Props

**SplitScroll Container:**
No props - acts as a wrapper for SplitScroll.Section components.

**SplitScroll.Section:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `img` | `string` | - | Image URL for section background |
| `imgAlt` | `string` | - | Image alt text for accessibility |
| `imgShape` | `'square' \| 'bevel' \| 'squircle' \| 'round'` | - | Image border radius style |
| `title` | `string` | - | Section title |
| `subtitle` | `string` | - | Section subtitle |
| `children` | `ReactNode` | - | Rich content for section body |
| `url` | `string` | - | Optional link URL |
| `buttonText` | `string` | - | Custom button text |

#### Features
- **Sticky Layered Images**: Left-side images stick during scroll with increasing z-index for layered parallax effect
- **Rich Content**: Accepts any React children - text, headings, lists, images, custom components
- **Active Section Tracking**: Uses IntersectionObserver to highlight active sections
- **Responsive**: Stacks vertically on mobile devices
- **Accessible**: Proper ARIA attributes and semantic HTML
- **Performance**: Optimized with lazy loading and efficient re-renders

#### Use Cases
- Product showcases with detailed features
- Portfolio presentations with project descriptions
- Brand storytelling with visual narratives
- Service offerings with benefits breakdown
- Case studies with client testimonials

#### Styling
The component includes built-in CSS for sticky positioning and layering. Customize appearance through:
- **CSS Custom Properties**: Override default styles
- **Component Props**: Control image shapes and layout
- **Theme Integration**: Works with Pixelated theme system

#### Accessibility
- Semantic HTML structure
- ARIA attributes for screen readers
- Keyboard navigation support
- Reduced motion respect for animations

---

### Intersection Observer Utility

A shared utility for viewport detection and scroll-based interactions.

#### Usage

##### `useIntersectionObserver` Hook
```tsx
import { useIntersectionObserver } from '@pixelated-tech/components';

const MyComponent = () => {
  const ref = useIntersectionObserver((entry) => {
    if (entry.isIntersecting) {
      console.log('Element is in view!');
    }
  }, { threshold: 0.5 });

  return <div ref={ref}>Observe me!</div>;
};
```

##### `observeIntersection` Helper
```tsx
import { observeIntersection } from '@pixelated-tech/components';

useEffect(() => {
  const cleanup = observeIntersection('.fade-in', (entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  }, { threshold: 0.1 });
  
  return cleanup;
}, []);
```

#### API

| Method/Hook | Description |
|-------------|-------------|
| `useIntersectionObserver(callback, options?)` | Hook for observing a single React element. |
| `observeIntersection(selector, callback, options?)` | Utility for observing multiple DOM elements by selector. |
| `isElementInViewport(element)` | Helper for one-time check if element is fully in view. |
| `isElementPartiallyInViewport(element)` | Helper for one-time check if element is partially in view. |

---

### CacheManager

The `CacheManager` utility provides a standardized way to handle caching across the library with support for multiple storage engines and TTL.

#### Usage Example
```typescript
import { CacheManager } from "@pixelated-tech/components";

// Initialize a session-based cache with 1 hour TTL
const myCache = new CacheManager({
    mode: 'session',
    prefix: 'myapp_',
    ttl: 60 * 60 * 1000
});

// Set data
myCache.set('myKey', { some: 'data' });

// Get data
const data = myCache.get('myKey');
```

#### Features:
- ✅ **Multiple Engines** - Supports `memory`, `session`, and `local` storage.
- ✅ **TTL Support** - Built-in expiration logic for cached items.
- ✅ **SSR Safe** - Automatically falls back to memory storage when running on the server (Node.js).
- ✅ **Prefixing** - Enforces key prefixing to avoid collisions in shared storage.

---

### Modal

Dialog overlay component with accessibility features.

```tsx
import { Modal } from '@pixelated-tech/components';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to proceed?</p>
  <button onClick={() => setIsOpen(false)}>Cancel</button>
  <button onClick={handleConfirm}>Confirm</button>
</Modal>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Modal visibility |
| `onClose` | `() => void` | - | Close handler |
| `title` | `string` | - | Modal title |
| `children` | `ReactNode` | - | Modal content |
| `size` | `'small' \| 'medium' \| 'large' \| 'fullscreen'` | `'medium'` | Modal size |
| `closeOnOverlay` | `boolean` | `true` | Close when clicking overlay |

### SidePanel

Slide-out panel component for additional content.

```tsx
import { SidePanel } from '@pixelated-tech/components';

<SidePanel
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  position="right"
  title="Settings"
>
  <div>Panel content goes here</div>
</SidePanel>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Panel visibility |
| `onClose` | `() => void` | - | Close handler |
| `position` | `'left' \| 'right'` | `'right'` | Slide direction |
| `title` | `string` | - | Panel title |
| `children` | `ReactNode` | - | Panel content |
| `width` | `string` | `'300px'` | Panel width |

### SmartImage

Optimized image component with lazy loading and responsive features.

```tsx
import { SmartImage } from '@pixelated-tech/components';

// Default Cloudinary variant (with optimizations)
<SmartImage
  src="/path/to/image.jpg"
  alt="Description"
  aboveFold={false}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Next.js Image variant (without Cloudinary)
<SmartImage
  src="/path/to/image.jpg"
  alt="Description"
  variant="nextjs"
/>

// Plain img tag variant (config-independent, for error pages)
<SmartImage
  src="/path/to/image.jpg"
  alt="Description"
  variant="img"
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | Image source URL |
| `alt` | `string` | - | Alt text |
| `variant` | `'cloudinary' \| 'nextjs' \| 'img'` | `'cloudinary'` | Rendering variant |
| `aboveFold` | `boolean` | `false` | Above-the-fold hint for loading |
| `sizes` | `string` | - | Responsive sizes attribute |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | Loading strategy |
| `width` | `number` | - | Image width |
| `height` | `number` | - | Image height |
| `quality` | `number` | `75` | Image quality (1-100) |

### CSS

Utility functions for CSS optimization and loading.

```tsx
import { deferAllCSS, preloadAllCSS } from '@pixelated-tech/components';

// Defer CSS loading for better performance
deferAllCSS();

// Preload all CSS files
preloadAllCSS();
```

#### Functions
- **`deferAllCSS()`**: Defers loading of all CSS stylesheets for improved page load performance
- **`preloadAllCSS()`**: Preloads all CSS files with high priority

### MicroInteractions

Component for adding subtle CSS animations and interactions to page elements.

```tsx
import { MicroInteractions } from '@pixelated-tech/components';

<MicroInteractions
  buttonring={true}
  cartpulse={true}
  formglow={true}
  imgscale={true}
  scrollfadeElements=".fade-on-scroll"
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `buttonring` | `boolean` | - | Add ring animation to buttons |
| `cartpulse` | `boolean` | - | Pulse animation for cart elements |
| `formglow` | `boolean` | - | Glow effect for form inputs |
| `grayscalehover` | `boolean` | - | Grayscale to color transition on hover |
| `imgscale` | `boolean` | - | Scale animation for images |
| `imgtwist` | `boolean` | - | Twist animation for images |
| `imghue` | `boolean` | - | Hue rotation for images |
| `simplemenubutton` | `boolean` | - | Animation for simple menu buttons |
| `scrollfadeElements` | `string` | - | CSS selector for elements to fade on scroll |

### Semantic

Semantic HTML layout components for structured content.

```tsx
import { PageSection, PageTitleHeader, GridContainer } from '@pixelated-tech/components';

<PageSection layoutType="grid" autoFlow="row">
  <PageTitleHeader title="Welcome" />
  <GridContainer columns={3} gap="1rem">
    <div>Content 1</div>
    <div>Content 2</div>
    <div>Content 3</div>
  </GridContainer>
</PageSection>
```

#### Components
- **`PageSection`**: Semantic section with configurable layout
- **`PageTitleHeader`**: H1 title with optional link
- **`GridContainer`**: CSS Grid container with responsive columns
- **`FlexContainer`**: Flexbox container with alignment options

---

## CMS Integration

### WordPress Components

WordPress integration components with automatic Photon CDN URL processing for optimized image delivery.

#### BlogPostList

Displays a list of WordPress blog posts with pagination support. Automatically converts WordPress Photon CDN URLs to direct image URLs for better Next.js optimization.

```tsx
import { BlogPostList } from '@pixelated-tech/components';

<BlogPostList
  site="blog.pixelated.tech"
  count={10}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `site` | `string` | - | WordPress site identifier (e.g., 'blog.pixelated.tech' or 'your-blog.wordpress.com') |
| `count` | `number` | - | Number of posts to fetch (undefined = all) |
| `posts` | `BlogPostType[]` | - | Pre-fetched posts array |
| `showCategories` | `boolean` | `true` | Whether to display post categories |

#### BlogPostSummary

Individual blog post display component.

```tsx
import { BlogPostSummary } from '@pixelated-tech/components';

<BlogPostSummary
  ID="123"
  title="Blog Post Title"
  date="2024-01-01"
  excerpt="Post excerpt..."
  URL="https://blog.example.com/post"
  categories={['tech', 'react']}
/>
```

### Lipsum

Client-side helper for fetching placeholder text from `https://www.lipsum.com` and returning an array of paragraph strings. It is intended for Storybook playgrounds and client-side usage where `DOMParser` is available.

**Default proxy**: `https://proxy.pixelated.tech/prod/proxy?url=` — requests are proxied by default to avoid CORS issues.

#### Parameters

- `LipsumTypeId` — `'Paragraph' | 'Word' | 'Char'` (required)
- `Amount` — `number` (required)
- `StartWithLoremIpsum` — `boolean` (optional)

#### Usage

```ts
import { getLipsum } from '@pixelated-tech/components';

const paragraphs = await getLipsum({ LipsumTypeId: 'Paragraph', Amount: 3, StartWithLoremIpsum: true });
// -> array of paragraph strings
```

#### Notes

- This helper runs in browser contexts (uses `DOMParser`) and is not intended for server-side rendering.
- Story: `Integrations/Lipsum` (`src/stories/integrations/lipsum.stories.tsx`) — Playground uses a live fetch via the proxy; use controls to change the `LipsumTypeId`, `Amount`, and `StartWithLoremIpsum` values.
- Unit tests: `src/tests/lipsum.test.ts` cover HTML parsing and error handling.

### Calendly

Scheduling integration component for Calendly bookings.

```tsx
import { Calendly } from '@pixelated-tech/components';

<Calendly
  url="https://calendly.com/username/meeting"
  styles={{ height: '600px' }}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | - | Calendly booking URL |
| `styles` | `object` | - | Inline styles for iframe |

### CloudinaryImage

Optimized image delivery with Cloudinary transformations.

```tsx
import { SmartImage } from '@pixelated-tech/components';

<SmartImage
  src="https://res.cloudinary.com/demo/image/upload/sample.jpg"
  alt="Cloudinary image"
  transformations="w_400,h_300,c_fill,f_auto"
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | Cloudinary image URL |
| `alt` | `string` | - | Alt text |
| `transformations` | `string` | - | Cloudinary transformation string |
| `aboveFold` | `boolean` | `false` | Loading priority |

### ContentfulItems

Contentful headless CMS integration for displaying content.

```tsx
import { ContentfulItems } from '@pixelated-tech/components';

<ContentfulItems
  spaceId="your-space-id"
  accessToken="your-access-token"
  contentType="blogPost"
  limit={10}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `spaceId` | `string` | - | Contentful space ID |
| `accessToken` | `string` | - | Contentful access token |
| `contentType` | `string` | - | Content type to fetch |
| `limit` | `number` | `10` | Number of items to fetch |

### GoogleReviews

Google Business Profile reviews integration.

```tsx
import { GoogleReviews } from '@pixelated-tech/components';

<GoogleReviews
  placeId="ChIJ1234567890abcdef"
  apiKey="your-google-api-key"
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeId` | `string` | - | Google Place ID |
| `apiKey` | `string` | - | Google API key |
| `maxReviews` | `number` | `5` | Maximum reviews to display |

### Gravatar

User avatar integration with Gravatar service.

```tsx
import { Gravatar } from '@pixelated-tech/components';

<Gravatar
  email="user@example.com"
  size={100}
  defaultImage="identicon"
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `email` | `string` | - | User email for Gravatar lookup |
| `size` | `number` | `80` | Avatar size in pixels |
| `defaultImage` | `string` | `'identicon'` | Default image type |

### HubSpot

CRM integration for HubSpot forms and tracking.

```tsx
import { HubSpot } from '@pixelated-tech/components';

<HubSpot
  portalId="1234567"
  formId="abcd-1234-5678-efgh"
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `portalId` | `string` | - | HubSpot portal ID |
| `formId` | `string` | - | HubSpot form ID |
| `onFormSubmit` | `function` | - | Form submission callback |

### Instagram

Instagram feed integration for displaying posts.

```tsx
import { Instagram } from '@pixelated-tech/components';

<Instagram
  username="instagram"
  accessToken="your-access-token"
  limit={6}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `username` | `string` | - | Instagram username |
| `accessToken` | `string` | - | Instagram API access token |
| `limit` | `number` | `6` | Number of posts to display |

---



## UI Components

### Carousel

Image and content slider with multiple variants.

#### CarouselHero

Full-width hero carousel for landing pages.

```tsx
import { CarouselHero } from '@pixelated-tech/components';

const slides = [
  {
    image: '/hero1.jpg',
    title: 'Welcome',
    subtitle: 'To our platform',
    buttonText: 'Get Started',
    buttonUrl: '/signup'
  }
];

<CarouselHero slides={slides} />
```

#### CarouselReviews

Customer testimonial carousel.

```tsx
import { CarouselReviews } from '@pixelated-tech/components';

const reviews = [
  {
    name: 'John Doe',
    company: 'Tech Corp',
    review: 'Great product!',
    avatar: '/john.jpg'
  }
];

<CarouselReviews reviews={reviews} />
```

### Forms

Dynamic form builder that generates forms from JSON configuration with comprehensive validation and event handling.

#### FormEngine

Complete form rendering engine with validation and submission handling.

```tsx
import { FormEngine } from '@pixelated-tech/components';

const formConfig = {
  fields: [
    {
      component: 'FormInput',
      props: {
        type: 'text',
        id: 'email',
        name: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: 'required',
        validate: 'email'
      }
    },
    {
      component: 'FormTextarea',
      props: {
        id: 'message',
        name: 'message',
        label: 'Message',
        placeholder: 'Enter your message',
        rows: '4',
        required: 'required'
      }
    },
    {
      component: 'FormSelect',
      props: {
        id: 'category',
        name: 'category',
        label: 'Category',
        options: [
          { text: 'General', value: 'general' },
          { text: 'Support', value: 'support' },
          { text: 'Sales', value: 'sales' }
        ]
      }
    }
  ]
};

<FormEngine
  formData={formConfig}
  onSubmitHandler={(data) => console.log('Form submitted:', data)}
  method="POST"
/>
```

#### Form Components

Individual form field components with unified event handling and validation.

##### FormInput
Text input field with validation and accessibility features.

```tsx
import { FormInput } from '@pixelated-tech/components';

<FormInput
  type="email"
  id="email"
  name="email"
  label="Email Address"
  placeholder="Enter your email"
  required="required"
  validate="email"
  display="vertical"
/>
```

**Props:**
- `type`: Input type (text, email, password, etc.)
- `id`: Unique identifier
- `name`: Form field name
- `label`: Display label
- `placeholder`: Input placeholder text
- `required`: Makes field required
- `validate`: Validation rule name
- `display`: Layout mode (vertical/horizontal)

##### FormTextarea
Multi-line text input with validation.

```tsx
import { FormTextarea } from '@pixelated-tech/components';

<FormTextarea
  id="description"
  name="description"
  label="Description"
  placeholder="Enter description"
  rows="4"
  required="required"
  display="vertical"
/>
```

##### FormSelect
Dropdown selection with option validation.

```tsx
import { FormSelect } from '@pixelated-tech/components';

<FormSelect
  id="category"
  name="category"
  label="Category"
  options={[
    { text: 'Option 1', value: 'opt1' },
    { text: 'Option 2', value: 'opt2' }
  ]}
  required="required"
/>
```

##### FormRadio
Radio button group with validation.

```tsx
import { FormRadio } from '@pixelated-tech/components';

<FormRadio
  id="choice"
  name="choice"
  label="Choose an option"
  options={[
    { text: 'Option A', value: 'a' },
    { text: 'Option B', value: 'b' }
  ]}
  required="required"
/>
```

##### FormCheckbox
Checkbox group with validation.

```tsx
import { FormCheckbox } from '@pixelated-tech/components';

<FormCheckbox
  id="preferences"
  name="preferences"
  label="Preferences"
  options={[
    { text: 'Email updates', value: 'email' },
    { text: 'SMS updates', value: 'sms' }
  ]}
/>
```

##### FormButton
Action button for form submission.

```tsx
import { FormButton } from '@pixelated-tech/components';

<FormButton
  type="submit"
  id="submit-btn"
  text="Submit Form"
  onClick={handleSubmit}
/>
```

##### FormHoneypot
Invisible honeypot field used to detect/bounce automated form submissions. This is an MVP defensive primitive — it is intentionally minimal and relies on server-side silent-drop for production safety.

Usage (recommended):

```tsx
import { FormHoneypot } from '@pixelated-tech/components';

// canonical usage (library mailer recognizes id="winnie")
<FormHoneypot id="winnie" name="website" />
```

Key details:
- **Defaults & contract**: `id` defaults to `"winnie"` (canonical) — the library **detects the honeypot by element `id` only**; `name` is required for the component but can be any value. The `id` **must** be `"winnie"` (yes — named after Winnie the Pooh) so consumers and automation have a single canonical signal to rely on.
- **Tests & consumer guidance**: unit/integration tests should assert the presence of `id="winnie"` (tests may include `name` for clarity, but detection is id-based). Do **not** rely on client-side short-circuits — server-side silent-drop remains authoritative.
- **Accessibility & UX**: rendered off-screen (inline top:-9999px), `aria-hidden`, `tabIndex={-1}`, and `autocomplete="off"` so it is invisible to humans and assistive tech.
- **Behavior**: client-side is inert (do NOT short-circuit submission on the client); the authoritative rejection is performed server-side by the mailer (`emailFormData`) which will silently drop (HTTP 200) any submission where the honeypot contains a value.
- **Diagnostics**: debug-only instrumentation exists (setter override / MutationObserver) — these are for local debugging and must not be shipped as permanent client-side features.

Testing & stories:
- **Tests**: put unit/integration tests that exercise honeypot behaviour in `src/tests` (see naming: `*.honeypot.test.ts{,x}`).
- **Test harness / helpers**: reusable harnesses or fixtures belong in `src/test` (shared utilities across tests).
- **Stories**: Storybook demos and interaction tests belong in `src/stories` (see `sitebuilder/form.honeypot.stories.tsx`).

Developer notes:
- Prefer server-side silent-drop as the canonical defense (defense-in-depth). If you must change the client contract, add accompanying tests and a migration note.

##### FormTooltip
Unified tooltip and validation message component with mouseover behavior and conditional styling.

```tsx
import { FormTooltip } from '@pixelated-tech/components';

// Tooltip mode - displays information with black ⓘ icon
<FormTooltip
  mode="tooltip"
  text={['This field is required', 'Please enter a valid email address']}
/>

// Validation mode - displays errors with red ❌ icon
<FormTooltip
  mode="validate"
  text={['Email format is invalid', 'Please check your input']}
/>
```

**Props:**
- `mode`: Display mode ('tooltip' for info, 'validate' for errors)
- `text`: Array of strings to display (always use array format)

**Features:**
- **Conditional Icons**: ⓘ (black) for tooltips, ❌ (red) for validation errors
- **Mouseover Behavior**: Shows/hides content on hover for both modes
- **Unified Styling**: Consistent appearance with mode-based color variations
- **Array-Based Text**: Always accepts text as string array for consistency

#### Form Validation

Built-in validation rules available via the `validate` prop:

- `email`: Email format validation
- `url`: URL format validation
- `phone`: Phone number format
- `zipcode`: US zip code validation
- `required`: Required field validation
- Custom validation functions can be added to `formvalidations.tsx`

#### Recent Improvements

**Version 3.2.14+** includes major refactoring for better performance and maintainability:

- **FormTooltip Unification**: Merged FormTooltip and FormValidate into single component with mode-based rendering
- **Unified Event Handling**: All form components now use consistent `onChange` and `onInput` handlers for better test compatibility
- **Performance Optimization**: Replaced inefficient `JSON.parse/stringify` with direct object destructuring
- **Code Deduplication**: Custom `useFormComponent` hook eliminates repetitive validation logic
- **Circular Reference Prevention**: Fixed memory leaks in option generation for radio/checkbox components
- **Enhanced Test Coverage**: 2,244 tests passing across 67 test files with comprehensive form component coverage

### Menu

Navigation components with multiple interaction patterns.

#### MenuSimple

Basic horizontal navigation menu with automatic active state detection.

```tsx
import { MenuSimple } from '@pixelated-tech/components';

const menuItems = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Contact', path: '/contact' }
];

<MenuSimple menuItems={menuItems} />
```

#### MenuAccordion

Expandable navigation menu with nested items and groups.

```tsx
import { MenuAccordion } from '@pixelated-tech/components';

const menuData = {
  home: { name: 'Home', path: '/' },
  services: {
    name: 'Services',
    routes: {
      webdev: { name: 'Web Development', path: '/services/web-dev' },
      design: { name: 'Design', path: '/services/design' },
      consulting: { name: 'Consulting', path: '/services/consulting' }
    }
  },
  about: { name: 'About', path: '/about' }
};

<MenuAccordion menuItems={menuData} />
```

#### MenuExpando

Expandable menu with smooth animations and toggle states.

```tsx
import { MenuExpando } from '@pixelated-tech/components';

const menuItems = [
  {
    name: 'Products',
    path: '/products',
    routes: [
      { name: 'Software', path: '/products/software' },
      { name: 'Hardware', path: '/products/hardware' }
    ]
  },
  { name: 'Support', path: '/support' }
];

<MenuExpando menuItems={menuItems} />
```

### Tab

Configurable tab component with multiple orientations and content areas.

```tsx
import { Tab } from '@pixelated-tech/components';

const tabs = [
  { id: 'tab1', label: 'Tab 1', content: <div>Content for Tab 1</div> },
  { id: 'tab2', label: 'Tab 2', content: <div>Content for Tab 2</div> },
  { id: 'tab3', label: 'Tab 3', content: <div>Content for Tab 3</div> },
];

<Tab tabs={tabs} orientation="top" defaultActiveTab="tab1" />
```

#### Props

- `tabs`: Array of tab objects with `id`, `label`, and `content`
- `orientation`: 'top' | 'bottom' | 'left' | 'right' (default: 'top')
- `defaultActiveTab`: ID of the initially active tab
- `onTabChange`: Callback function called when tab changes

### Tables

Data display component with sorting and image support.

```tsx
import { Table } from '@pixelated-tech/components';

const userData = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar1.jpg',
    role: 'Admin'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://example.com/avatar2.jpg',
    role: 'User'
  }
];

<Table
  data={userData}
  id="users-table"
  sortable={true}
/>
```

### Tiles

Image grid layout component for displaying card-based content.

```tsx
import { Tiles } from '@pixelated-tech/components';

const cards = [
  {
    image: '/project1.jpg',
    imageAlt: 'Project 1',
    bodyText: 'Portfolio project description',
    link: '/projects/1'
  },
  {
    image: '/project2.jpg',
    imageAlt: 'Project 2',
    bodyText: 'Another portfolio project',
    link: '/projects/2'
  }
];

<Tiles
  cards={cards}
  rowCount={3}
/>
```

---

## PageBuilder Components

### ComponentPropertiesForm

Form for editing component properties in the page builder.

```tsx
import { ComponentPropertiesForm } from '@pixelated-tech/components';

<ComponentPropertiesForm
  component={selectedComponent}
  onChange={handlePropertyChange}
  onSave={handleSave}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `component` | `ComponentType` | - | Component being edited |
| `onChange` | `function` | - | Property change handler |
| `onSave` | `function` | - | Save handler |

### ComponentSelector

Component picker for adding new components to pages.

```tsx
import { ComponentSelector } from '@pixelated-tech/components';

<ComponentSelector
  onSelect={handleComponentSelect}
  category="general"
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSelect` | `function` | - | Component selection handler |
| `category` | `string` | - | Component category filter |

### ComponentTree

Visual tree representation of page components.

```tsx
import { ComponentTree } from '@pixelated-tech/components';

<ComponentTree
  components={pageComponents}
  onSelect={handleComponentSelect}
  selectedId={selectedComponentId}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `components` | `ComponentType[]` | - | Page components array |
| `onSelect` | `function` | - | Component selection handler |
| `selectedId` | `string` | - | Currently selected component ID |

### PageBuilderUI

Main page builder interface component.

```tsx
import { PageBuilderUI } from '@pixelated-tech/components';

<PageBuilderUI
  initialPage={pageData}
  onSave={handleSave}
  availableComponents={componentLibrary}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialPage` | `PageType` | - | Initial page data |
| `onSave` | `function` | - | Save handler |
| `availableComponents` | `ComponentType[]` | - | Available components |

### PageEngine

Runtime page rendering engine.

```tsx
import { PageEngine } from '@pixelated-tech/components';

<PageEngine
  pageData={pageData}
  context={pageContext}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageData` | `PageType` | - | Page structure data |
| `context` | `object` | - | Runtime context |

### SaveLoadSection

Save and load functionality for page builder.

```tsx
import { SaveLoadSection } from '@pixelated-tech/components';

<SaveLoadSection
  onSave={handleSave}
  onLoad={handleLoad}
  onNew={handleNew}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSave` | `function` | - | Save handler |
| `onLoad` | `function` | - | Load handler |
| `onNew` | `function` | - | New page handler |

### ConfigBuilder

Tabbed interface for managing site metadata and routes configuration.

```tsx
import { ConfigBuilder } from '@pixelated-tech/components';

<ConfigBuilder
  initialConfig={{
    siteInfo: { name: 'My Site', description: 'Site description' },
    routes: [
      { path: '/home', component: 'Home', title: 'Home Page' }
    ]
  }}
  onSave={(config) => console.log('Config saved:', config)}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialConfig` | `SiteConfig` | - | Initial site configuration |
| `onSave` | `function` | - | Configuration save handler |

#### SiteConfig Type
```tsx
interface SiteConfig {
  siteInfo: {
    name: string;
    author: string;
    description: string;
    url: string;
    email: string;
    favicon: string;
    favicon_sizes: string;
    favicon_type: string;
    theme_color: string;
    background_color: string;
    default_locale: string;
    display: string;
    image?: string;
    image_height?: string;
    image_width?: string;
    telephone?: string;
    address?: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    priceRange?: string;
    sameAs?: string[];
    keywords?: string;
  };
  routes: Array<{
    path: string;
    component: string;
    title?: string;
    description?: string;
  }>;
  visualdesign?: {
    'primary-color': string;
    'secondary-color': string;
    'accent1-color': string;
    'accent2-color': string;
    'bg-color': string;
    'text-color': string;
    'header-font-primary': string;
    'header-font-fallback': string;
    'header-font-generic': string;
    'body-font-primary': string;
    'body-font-fallback': string;
    'body-font-generic': string;
    'font-size1-min': string;
    'font-size1-max': string;
    'font-size2-min': string;
    'font-size2-max': string;
    'font-size3-min': string;
    'font-size3-max': string;
    'font-size4-min': string;
    'font-size4-max': string;
    'font-size5-min': string;
    'font-size5-max': string;
    'font-size6-min': string;
    'font-size6-max': string;
    'font-min-screen': string;
    'font-max-screen': string;
  };
}
```

#### Features
- **Tabbed Interface**: Organized into "Site Info", "Routes", and "Visual Design" tabs
- **Comprehensive Site Info Management**: Edit all standard site metadata fields including PWA settings, contact info, and address
- **Route Management**: Add, edit, and remove page routes with component mapping
- **Visual Design Configuration**: Manage design tokens like colors, fonts, and spacing through a form-based interface
- **Real-time Preview**: JSON preview of current configuration
- **Save Functionality**: Callback-based configuration persistence with form validation enforcement
- **Form Validation**: Required field validation for essential site information with visual feedback

#### Validation Behavior

The "Save Config" button enforces form validation before allowing configuration saves:

- **Required Fields**: Site name, author, description, URL, and email are mandatory
- **Visual Feedback**: Invalid fields show validation errors with ❌ indicators
- **Save Prevention**: Save action is blocked until all required validations pass
- **Real-time Validation**: Form validates as you type with immediate feedback

#### Visual Design Tab

The Visual Design tab provides a form-based interface for configuring visual design tokens. These tokens are stored in the `visualdesign` object of the site configuration and can be used to maintain consistent theming across your application.

**Supported Design Tokens:**
- **Colors**: Primary, secondary, accent, text, and background colors
- **Typography**: Header and body fonts with primary Google Fonts, web-safe fallbacks, and generic family fallbacks
- **Layout**: Border radius, box shadows, transition durations

**Usage in Components:**
```tsx
// Access visual design tokens from config
const config = useConfig();
const primaryColor = config.visualdesign?.['primary-color'] || '#369';
```

### FontSelector

Autocomplete input component for selecting fonts with support for Google Fonts, web-safe fonts, and generic font families.

```tsx
import { FontSelector } from '@pixelated-tech/components';

<FontSelector
  id="header-font-primary"
  name="header-font-primary"
  label="Header Font (Google Fonts)"
  fontType="google"
  value="Montserrat"
  onChange={(font) => console.log('Selected font:', font)}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | Unique identifier for the input |
| `name` | `string` | - | Name attribute for form submission |
| `label` | `string` | - | Display label for the input |
| `fontType` | `'google' \| 'websafe' \| 'generic'` | - | Type of fonts to show in autocomplete |
| `value` | `string` | `''` | Current selected font value |
| `onChange` | `function` | - | Callback when font selection changes |
| `required` | `boolean` | `false` | Whether the field is required |
| `placeholder` | `string` | - | Placeholder text (auto-generated based on fontType) |

#### Font Types

- **`google`**: Shows Google Fonts with live preview links
- **`websafe`**: Shows common web-safe fonts (Arial, Helvetica, etc.)
- **`generic`**: Shows CSS generic font families (serif, sans-serif, etc.)

#### Features

- **Autocomplete**: Intelligent font suggestions as you type
- **Google Fonts Integration**: Direct links to Google Fonts preview pages
- **Web-safe Fallbacks**: Ensures font availability across devices
- **Generic Families**: CSS generic font family support
- **Accessibility**: Proper labeling and keyboard navigation

### ConfigEngine

Components for rendering visual design styles and Google Fonts imports from configuration data.

#### VisualDesignStyles

Renders CSS custom properties from visual design configuration tokens.

```tsx
import { VisualDesignStyles } from '@pixelated-tech/components';

<VisualDesignStyles visualdesign={{
  'primary-color': '#007bff',
  'header-font-primary': 'Montserrat',
  'header-font-fallback': 'Arial',
  'header-font-generic': 'sans-serif',
  'font-size1-min': '14px',
  'font-size1-max': '18px'
}} />
```

**Generated CSS:**
```css
:root {
  --primary-color: #007bff;
  --header-font-family: "Montserrat", "Arial", "sans-serif";
  --font-size1: clamp(var(--font-size1-min), calc(var(--font-size1-min) + ((var(--font-size1-max) - var(--font-size1-min)) * ((100vw - var(--font-min-screen)) / (var(--font-max-screen) - var(--font-min-screen))))), var(--font-size1-max));
}
h1 { font-size: var(--font-size1); }
```

#### GoogleFontsImports

Automatically generates Google Fonts link tags for fonts specified in visual design configuration.

```tsx
import { GoogleFontsImports } from '@pixelated-tech/components';

<GoogleFontsImports visualdesign={{
  'header-font-primary': 'Montserrat',
  'body-font-primary': 'Open Sans'
}} />
```

**Generated HTML:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat|Open+Sans&display=swap" rel="stylesheet">
```

#### Features

- **Font Stack Generation**: Automatically builds CSS font-family stacks from 3-field font configuration
- **Responsive Typography**: Generates fluid font sizes using CSS clamp() for responsive design
- **Google Fonts Integration**: Automatically imports only the Google Fonts used in the design
- **Web-safe Font Filtering**: Excludes web-safe fonts from Google Fonts imports to reduce loading
- **Server-safe**: Both components are safe to use in server components and API routes

---

## Admin Components

Admin components provide tools for managing and monitoring websites, including site health monitoring, deployment, and component usage analysis.

---

## SEO & Schema

### FAQAccordion

Interactive FAQ accordion component with search functionality, category icons, and schema.org FAQPage structured data support. Features accessibility-first design with keyboard navigation, screen reader support, and ARIA attributes.

```tsx
import { FAQAccordion } from '@pixelated-tech/components';

const faqsData = {
  mainEntity: [
    {
      name: "What is React?",
      category: "Technical Details",
      acceptedAnswer: {
        text: "React is a JavaScript library for building user interfaces using components and a virtual DOM."
      }
    },
    {
      name: "How do I get started?",
      category: "Getting Started", 
      acceptedAnswer: {
        text: [
          "First, install React using npm or yarn.",
          "Then create a new project and start building components.",
          "Don't forget to set up your development environment with proper tooling."
        ]
      }
    }
  ]
};

<FAQAccordion faqsData={faqsData} />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `faqsData` | `Object` | - | FAQ data object following schema.org FAQPage structure |

#### Features
- ✅ **Search Functionality** - Real-time search through questions and answers
- ✅ **Category Icons** - Visual categorization with emoji icons
- ✅ **Multi-paragraph Answers** - Support for string or array of strings for rich content
- ✅ **Accessibility** - Full keyboard navigation, ARIA labels, screen reader support
- ✅ **Schema.org Compliant** - Structured data for SEO with FAQPage markup
- ✅ **Expand/Collapse Controls** - Buttons to expand or collapse all FAQs
- ✅ **Responsive Design** - Mobile-friendly layout with proper touch targets

#### Supported Categories
- 🚀 Getting Started
- ⏱️ Process & Timeline  
- ⚙️ Technical Details
- 📝 Content & Management
- 🛠️ Support & Maintenance
- 📋 Ownership & Legal
- 💼 Services

#### Data Structure
The `faqsData` prop should follow the schema.org FAQPage structure:

```typescript
{
  mainEntity: Array<{
    name: string;           // Question text
    category: string;       // Category for icon display
    acceptedAnswer: {
      text: string | string[];  // Answer (string or array of paragraphs)
    };
  }>;
}
```

---

### JSON-LD Schemas

Structured data components for SEO.

**Configuration**: The LocalBusiness and Website schema components can use `siteInfo` data from the routes JSON file as fallback values when props are not explicitly provided. This allows for centralized site-wide configuration of business/website information.

#### LocalBusiness

Generates LocalBusiness JSON-LD structured data. When props are not provided, falls back to `siteInfo` configuration from routes JSON.

```tsx
import { LocalBusinessSchema } from '@pixelated-tech/components';

// With explicit props
<LocalBusinessSchema
  name="My Business"
  address={{
    streetAddress: '123 Main St',
    addressLocality: 'City',
    addressRegion: 'State',
    postalCode: '12345'
  }}
  telephone="(555) 123-4567"
/>

// Or with siteinfo object (recommended)
<LocalBusinessSchema
  siteInfo={siteInfoData}
  streetAddress="123 Main St"
  addressLocality="City"
  addressRegion="State"
  postalCode="12345"
/>

// Or with minimal props (uses siteInfo fallbacks)
<LocalBusinessSchema />
```
```

#### Recipe

```tsx
import { RecipeSchema } from '@pixelated-tech/components';

<RecipeSchema
  name="Chocolate Chip Cookies"
  author="Chef Name"
  prepTime="PT15M"
  cookTime="PT10M"
  ingredients={[
    '2 cups flour',
    '1 cup butter',
    '1 cup sugar'
  ]}
  instructions={[
    {
      text: 'Mix dry ingredients',
      position: 1
    }
  ]}
/>
```

#### Services

```tsx
import { ServicesSchema } from '@pixelated-tech/components';

<ServicesSchema
  name="Web Development Services"
  description="Professional web development and design services"
  provider={{
    name: "My Company",
    url: "https://example.com"
  }}
  serviceType="Web Development"
  areaServed="Global"
/>
```

#### Website

Generates Website JSON-LD structured data. When props are not provided, falls back to `siteInfo` configuration from routes JSON.

```tsx
import { WebsiteSchema } from '@pixelated-tech/components';

// With explicit props
<WebsiteSchema
  name="My Website"
  url="https://example.com"
  description="Website description"
  publisher={{
    name: "My Company",
    logo: "https://example.com/logo.png"
  }}
/>

// Or with siteinfo object (recommended)
<WebsiteSchema
  siteInfo={siteInfoData}
  potentialAction={{
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://example.com/search?q={search_term}'
    }
  }}
/>

// Or with minimal props (uses siteInfo fallbacks)
<WebsiteSchema />
```
```

#### BlogPosting

```tsx
import { BlogPostingSchema } from '@pixelated-tech/components';

<BlogPostingSchema
  headline="Blog Post Title"
  author={{
    name: "Author Name",
    url: "https://example.com/author"
  }}
  datePublished="2024-01-01"
  dateModified="2024-01-15"
  articleBody="Full blog post content..."
  image="https://example.com/blog-image.jpg"
/>
```

### 404 Page

Custom 404 error page component.

```tsx
import { NotFound } from '@pixelated-tech/components';

<NotFound
  title="Page Not Found"
  message="The page you're looking for doesn't exist."
  homeUrl="/"
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'404 - Page Not Found'` | Page title |
| `message` | `string` | - | Error message |
| `homeUrl` | `string` | `'/'` | Home page URL |

### GoogleAnalytics

Google Analytics tracking component.

```tsx
import { GoogleAnalytics } from '@pixelated-tech/components';

<GoogleAnalytics
  trackingId="GA_MEASUREMENT_ID"
  debug={false}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trackingId` | `string` | - | Google Analytics tracking ID |
| `debug` | `boolean` | `false` | Enable debug mode |

### GoogleMap

Embedded Google Maps component.

```tsx
import { GoogleMap } from '@pixelated-tech/components';

<GoogleMap
  apiKey="your-google-api-key"
  center={{ lat: 40.7128, lng: -74.0060 }}
  zoom={12}
  markers={[{ position: { lat: 40.7128, lng: -74.0060 }, title: 'New York' }]}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiKey` | `string` | - | Google Maps API key |
| `center` | `LatLng` | - | Map center coordinates |
| `zoom` | `number` | `10` | Map zoom level |
| `markers` | `Marker[]` | - | Map markers array |

### GoogleSearch

Google Custom Search integration.

```tsx
import { GoogleSearch } from '@pixelated-tech/components';

<GoogleSearch
  searchEngineId="your-search-engine-id"
  apiKey="your-api-key"
  placeholder="Search our site..."
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchEngineId` | `string` | - | Google Custom Search Engine ID |
| `apiKey` | `string` | - | Google API key |
| `placeholder` | `string` | `'Search...'` | Search input placeholder |

### Manifest

Generates a complete PWA manifest from siteinfo configuration. This component centralizes PWA manifest generation and ensures consistency across sites.

```tsx
import { Manifest } from '@pixelated-tech/components';

// Basic usage with siteinfo
export default function manifest() {
  return Manifest({ siteInfo: myRoutes.siteInfo });
}

// With custom properties for site-specific overrides
export default function manifest() {
  return Manifest({ 
    siteInfo: myRoutes.siteInfo,
    customProperties: {
      orientation: 'portrait',
      categories: ['business', 'productivity'],
      lang: 'en-US'
    }
  });
}
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `siteInfo` | `SiteInfo` | - | Site configuration object from routes.json |
| `customProperties` | `Partial<MetadataRoute.Manifest>` | `{}` | Optional custom manifest properties to override defaults |

#### Generated Properties

The component automatically generates these manifest properties from `siteInfo`:

- `name` & `short_name`: From `siteInfo.name`
- `description`: From `siteInfo.description`
- `theme_color`: From `siteInfo.theme_color`
- `background_color`: From `siteInfo.background_color`
- `display`: From `siteInfo.display`
- `homepage_url`: From `siteInfo.url`
- `developer`: Object with `name` and `url` from siteInfo
- `icons`: Array with favicon configuration
- `author`: From `siteInfo.author` (non-standard property)
- `default_locale`: From `siteInfo.default_locale`

### MetadataComponents

Dynamic meta tag injection for SEO.

```tsx
import { MetadataComponents } from '@pixelated-tech/components';

<MetadataComponents
  title="Page Title"
  description="Page description for SEO"
  keywords="keyword1, keyword2"
  ogImage="/social-image.jpg"
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Page title |
| `description` | `string` | - | Meta description |
| `keywords` | `string` | - | Meta keywords |
| `ogImage` | `string` | - | Open Graph image URL |

---

### Well-Known Resources (.well-known / humans.txt / security.txt) 🔧

Shared server helpers for serving canonical site metadata endpoints like `humans.txt` and `.well-known/security.txt` are provided from the server export.

- **Canonical API**: Use `createWellKnownResponse(type, req, opts)` from the server entrypoint:

```ts
import { createWellKnownResponse } from '@pixelated-tech/components/server';

// Example: app route for humans.txt
export async function GET(req: NextRequest) {
  return createWellKnownResponse('humans', req);
}

// Example: .well-known/security.txt
export async function GET(req: NextRequest) {
  return createWellKnownResponse('security', req);
}
```

- **Behavior & migration notes**:
  - The unified function supports both `"humans"` and `"security"` types and replaces the older `createHumansTxtResponse` and `createSecurityTxtResponse` helpers.
  - Responses include sensible headers (Content-Type, Cache-Control) and an `ETag` to support conditional requests (304 Not Modified when `If-None-Match` matches).
  - Pass `opts` (for example `routesJson`, `pkg`, or a `routes` arg) to customize generated content for your site.

- **When to change**: After updating the components package, switch route imports from the old helpers to `createWellKnownResponse('humans'|'security', req, opts)` — no shim required.

---

## Shopping Cart

### eBay Components

eBay store integration and product listings.

```tsx
import { eBay } from '@pixelated-tech/components';

<eBay
  storeId="your-store-id"
  keywords="electronics"
  limit={12}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `storeId` | `string` | - | eBay store ID |
| `keywords` | `string` | - | Search keywords |
| `limit` | `number` | `10` | Number of items to display |

### PayPal

PayPal payment integration component.

```tsx
import { PayPal } from '@pixelated-tech/components';

<PayPal
  amount={29.99}
  currency="USD"
  itemName="Premium Plan"
  onSuccess={handlePaymentSuccess}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `amount` | `number` | - | Payment amount |
| `currency` | `string` | `'USD'` | Currency code |
| `itemName` | `string` | - | Item description |
| `onSuccess` | `function` | - | Success callback |

### ShoppingCart

Shopping cart functionality with item management.

```tsx
import { ShoppingCart } from '@pixelated-tech/components';

<ShoppingCart
  items={cartItems}
  onUpdateQuantity={handleQuantityChange}
  onRemoveItem={handleRemoveItem}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `CartItem[]` | - | Cart items array |
| `onUpdateQuantity` | `function` | - | Quantity change handler |
| `onRemoveItem` | `function` | - | Item removal handler |

---

## Structured Content

### BuzzwordBingo

Interactive buzzword bingo game component.

```tsx
import { BuzzwordBingo } from '@pixelated-tech/components';

<BuzzwordBingo
  words={['synergy', 'paradigm', 'leverage', 'optimize']}
  size={5}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `words` | `string[]` | - | Array of buzzwords |
| `size` | `number` | `5` | Grid size (NxN) |

### Markdown

Markdown rendering component with syntax highlighting.

```tsx
import { Markdown } from '@pixelated-tech/components';

<Markdown
  content="# Hello World\n\nThis is **markdown** content."
  allowHtml={false}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | - | Markdown content |
| `allowHtml` | `boolean` | `false` | Allow HTML in markdown |

### Recipe

Recipe display component with structured data.

```tsx
import { Recipe } from '@pixelated-tech/components';

<Recipe
  title="Chocolate Chip Cookies"
  ingredients={['2 cups flour', '1 cup sugar', '1 cup chocolate chips']}
  instructions={['Mix dry ingredients', 'Add wet ingredients', 'Bake at 350°F']}
  prepTime="15 min"
  cookTime="12 min"
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Recipe title |
| `ingredients` | `string[]` | - | Ingredient list |
| `instructions` | `string[]` | - | Cooking instructions |
| `prepTime` | `string` | - | Preparation time |
| `cookTime` | `string` | - | Cooking time |

### Resume

Professional resume/CV display component.

```tsx
import { Resume } from '@pixelated-tech/components';

<Resume
  personalInfo={{ name: 'John Doe', email: 'john@example.com' }}
  experience={workExperience}
  education={educationHistory}
  skills={['React', 'TypeScript', 'Node.js']}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `personalInfo` | `object` | - | Personal information |
| `experience` | `Experience[]` | - | Work experience |
| `education` | `Education[]` | - | Education history |
| `skills` | `string[]` | - | Skills list |

### SocialCard

Social media card component for sharing.

```tsx
import { SocialCard } from '@pixelated-tech/components';

<SocialCard
  title="Check out this article"
  description="An interesting article about React components"
  image="/article-image.jpg"
  url="https://example.com/article"
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Card title |
| `description` | `string` | - | Card description |
| `image` | `string` | - | Card image URL |
| `url` | `string` | - | Link URL |

### Timeline

Timeline component for displaying chronological events.

```tsx
import { Timeline } from '@pixelated-tech/components';

<Timeline
  events={[
    { date: '2020-01-01', title: 'Started Company', description: 'Founded XYZ Corp' },
    { date: '2021-06-15', title: 'First Product', description: 'Launched flagship product' }
  ]}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `TimelineEvent[]` | - | Array of timeline events |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Timeline orientation |

---

## Admin Components

### Site Health

Comprehensive site monitoring and health check components for performance, security, and SEO analysis.

#### SiteHealthOverview

Displays Core Web Vitals and Lighthouse performance metrics.

```tsx
import { SiteHealthOverview } from '@pixelated-tech/components';

<SiteHealthOverview siteName="my-site" />
```

#### SiteHealthAxeCore

Accessibility auditing using axe-core.

```tsx
import { SiteHealthAxeCore } from '@pixelated-tech/components';

<SiteHealthAxeCore siteName="my-site" />
```

#### SiteHealthPerformance

Performance monitoring and metrics.

```tsx
import { SiteHealthPerformance } from '@pixelated-tech/components';

<SiteHealthPerformance siteName="my-site" />
```

#### SiteHealthSecurity

Security scanning and vulnerability assessment.

```tsx
import { SiteHealthSecurity } from '@pixelated-tech/components';

<SiteHealthSecurity siteName="my-site" />
```

#### SiteHealthSEO

SEO analysis and recommendations.

```tsx
import { SiteHealthSEO } from '@pixelated-tech/components';

<SiteHealthSEO siteName="my-site" />
```

#### SiteHealthOnSiteSEO

Advanced on-page SEO analysis with Puppeteer rendering.

```tsx
import { SiteHealthOnSiteSEO } from '@pixelated-tech/components';

<SiteHealthOnSiteSEO siteName="my-site" />
```

#### SiteHealthCloudwatch

AWS CloudWatch uptime monitoring and availability tracking.

```tsx
import { SiteHealthCloudwatch } from '@pixelated-tech/components';

<SiteHealthCloudwatch 
  siteName="my-site" 
  startDate="2024-01-01" 
  endDate="2024-01-31" 
/>
```

#### SiteHealthGoogleAnalytics

Google Analytics integration and reporting.

```tsx
import { SiteHealthGoogleAnalytics } from '@pixelated-tech/components';

<SiteHealthGoogleAnalytics siteName="my-site" />
```

#### SiteHealthGoogleSearchConsole

Google Search Console data and insights.

```tsx
import { SiteHealthGoogleSearchConsole } from '@pixelated-tech/components';

<SiteHealthGoogleSearchConsole siteName="my-site" />
```

#### SiteHealthDependencyVulnerabilities

NPM package vulnerability scanning.

```tsx
import { SiteHealthDependencyVulnerabilities } from '@pixelated-tech/components';

<SiteHealthDependencyVulnerabilities siteName="my-site" />
```

#### SiteHealthGit

Git repository health and commit analysis.

```tsx
import { SiteHealthGit } from '@pixelated-tech/components';

<SiteHealthGit siteName="my-site" />
```

#### SiteHealthUptime

Website uptime monitoring.

```tsx
import { SiteHealthUptime } from '@pixelated-tech/components';

<SiteHealthUptime siteName="my-site" />
```

### Sites

Site management and configuration components.

#### Sites Integration

```tsx
import { loadSitesConfig, saveSitesConfig } from '@pixelated-tech/components';

// Load site configuration
const sites = loadSitesConfig();

// Save site configuration
saveSitesConfig(sites);
```

---

## Entertainment

### NerdJoke

Random nerd joke generator component.

```tsx
import { NerdJoke } from '@pixelated-tech/components';

<NerdJoke
  category="programming"
  refreshInterval={30000}
/>
```

#### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `category` | `string` | `'random'` | Joke category |
| `refreshInterval` | `number` | - | Auto-refresh interval (ms) |

---

## Configuration Examples

### PixelatedClientConfigProvider Setup

The PixelatedClientConfigProvider enables components to access centralized configuration data. Configuration can be loaded from environment variables or a `routes.json` file in your project.

**Config Consumers:**
- **LocalBusinessSchema & WebsiteSchema**: Use `siteInfo` for fallback business/website data
- **CloudinaryImage & SmartImage**: Use `cloudinary` for image optimization settings
- **WordPress**: Use `wordpress` for API connections
- **ContentfulItems**: Use `contentful` for CMS integration
- **eBay**: Use `ebay` for store integration
- **Flickr**: Use `flickr` for photo gallery integration
- **GoogleAnalytics**: Use `googleAnalytics` for tracking
- **HubSpot**: Use `hubspot` for CRM integration
- **PayPal**: Use `paypal` for payment processing
- **Proxy**: Use `proxy` for API proxy settings

```tsx
// app/layout.tsx (Next.js 13+ App Router)
import { PixelatedClientConfigProvider } from '@pixelated-tech/components';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PixelatedClientConfigProvider config={{
          // Site-wide business/website information (used by schema components)
          siteInfo: {
            name: 'Your Business Name',
            description: 'Your business description',
            url: 'https://yourwebsite.com',
            email: 'contact@yourwebsite.com',
            telephone: '(555) 123-4567',
            address: {
              streetAddress: '123 Main St',
              addressLocality: 'City',
              addressRegion: 'State',
              postalCode: '12345',
              addressCountry: 'United States'
            },
            openingHours: 'Mo-Fr 09:00-18:00'
          },
          // Image optimization
          cloudinary: {
            product_env: 'production',
            baseUrl: 'https://res.cloudinary.com/your-account',
            transforms: 'f_auto,q_auto,w_auto'
          },
          // CMS integrations
          wordpress: {
            site: 'your-blog.wordpress.com'
          },
          contentful: {
            spaceId: 'your-space-id',
            accessToken: 'your-access-token',
            environment: 'master'
          },
          // E-commerce
          ebay: {
            appId: 'your-app-id',
            globalId: 'EBAY-US'
          },
          paypal: {
            sandboxPayPalApiKey: 'your-sandbox-key',
            payPalApiKey: 'your-production-key'
          },
          // Analytics & CRM
          googleAnalytics: {
            id: 'GA-XXXXXXXXX'
          },
          hubspot: {
            portalId: 'your-portal-id',
            formId: 'your-form-id'
          },
          // Media services
          flickr: {
            api_key: 'your-flickr-api-key',
            user_id: 'your-user-id'
          },
          // API proxy
          proxy: {
            proxyURL: 'https://proxy.pixelated.tech/prod/proxy?url='
          }
        }}>
          {children}
        </PixelatedClientConfigProvider>
      </body>
    </html>
  );
}
```

---

## TypeScript Support

All components include full TypeScript definitions:

```tsx
import type {
  CalloutType,
  BlogPostType,
  CarouselSlide,
  PixelatedConfig
} from '@pixelated-tech/components';
```

## CDN Usage (Not Recommended)

```html
<script src="https://unpkg.com/@pixelated-tech/components@latest/dist/index.js"></script>
```

**Note**: CDN usage is not recommended for production as it doesn't support tree-shaking and may include unnecessary code.

## Contributing

When adding new components, please:
1. Add TypeScript interfaces to `src/index.d.ts`
2. Create Storybook stories in `src/stories/`
3. Add comprehensive documentation here
4. Include usage examples and prop tables

---

*For more examples and advanced usage, check the [Storybook interactive demos](https://your-storybook-url).*


---

*This documentation is automatically updated when components are modified. Last updated: December 17, 2025*