
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![Coverage][coverage-shield]][coverage-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/brianwhaley/pixelated-components">
    <img src="https://www.pixelated.tech/images/pix/pix-bg-512.jpg" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Pixelated Components</h3>

  <p align="center">
    A comprehensive React component library for modern web development, featuring CMS integrations, UI components, SEO optimization tools, and accessibility-first design.
    <br />
    <a href="https://github.com/brianwhaley/pixelated-components"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/brianwhaley/pixelated-components">View Demo</a>
    &middot;
    <a href="https://github.com/brianwhaley/pixelated-components/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/brianwhaley/pixelated-components/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<!-- ABOUT THE PROJECT -->
## About The Project

This is a library of components I have found useful to build web sites quickly.  



### Built With

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![Storybook][Storybook.js]][Storybook-url]
* [![Calendly][Calendly.com]][Calendly-url]
* [![Contentful][Contentful.com]][Contentful-url]
* [![Cloudinary][Cloudinary.com]][Cloudinary-url]
* [![Flickr][Flickr.com]][Flickr-url]
* [![Gravatar][Gravatar.com]][Gravatar-url]
* [![Hubspot][Hubspot.com]][Hubspot-url]
* [![Instagram][Instagram.com]][Instagram-url]
* [![PayPal][PayPal.com]][PayPal-url]
* [![Wordpress][Wordpress.com]][Wordpress-url]
* [![Github][Github.com]][Github-url]
* [![npm][npm.org]][npm-url]




## ♿ Accessibility

Pixelated Components is committed to creating inclusive web experiences. All components are built with accessibility in mind and include:

- **WCAG 2.1 AA compliance** - Components meet web accessibility guidelines
- **Keyboard navigation** - Full keyboard support for all interactive elements
- **Screen reader support** - Proper ARIA labels, roles, and semantic HTML
- **Focus management** - Clear focus indicators and logical tab order
- **Color contrast** - High contrast ratios for text and interactive elements
- **Semantic HTML** - Proper use of headings, landmarks, and structural elements

### Accessibility Features
- Automatic ARIA label generation
- Focus trap management for modals and overlays
- Skip links for keyboard users
- Reduced motion support for users with vestibular disorders
- High contrast mode compatibility




## 📦 Installation & Setup

### Requirements
- **React**: 18.0 or higher
- **Next.js**: 13.0 or higher (recommended)
- **Node.js**: 18.0 or higher
- **TypeScript**: 4.9 or higher (optional, but recommended)

### Basic Installation

```bash
# npm
npm install @pixelated-tech/components

# yarn
yarn add @pixelated-tech/components

# pnpm
pnpm add @pixelated-tech/components
```

### Peer Dependencies

This library requires the following peer dependencies (install if not already present):

```bash
npm install react react-dom prop-types
```

### TypeScript Support

This library is written in TypeScript and provides full type definitions. No additional setup required.

### Reference Implementation

For a complete working example of Pixelated Components in action, check out the [pixelated-admin](https://github.com/brianwhaley/pixelated-admin) project. This admin interface demonstrates:

- **Component Integration**: Real-world usage of all major components
- **Configuration Management**: Dynamic site configuration with ConfigBuilder
- **Page Building**: Visual page construction with PageBuilderUI
- **Authentication**: NextAuth.js integration for secure admin access
- **Deployment Ready**: Production-ready setup with HTTPS and optimized builds

```bash
# Clone the reference implementation
git clone https://github.com/brianwhaley/pixelated-admin.git
cd pixelated-admin
npm install
npm run dev
```

Visit `http://localhost:3006` to explore the admin interface and see components in action.

### General Components
Reusable UI components for common patterns:
- **Accordion** - Expandable content sections using native `<details>` elements
- **Callout** - Flexible content highlight blocks with image support
- **CSS** - Dynamic CSS utilities and styling helpers
- **Image** - Advanced image component with lazy loading and optimization
- **Loading** - Progress indicators and loading states
- **MicroInteractions** - Subtle animations and interaction effects
- **Modal** - Dialog overlays and popups
- **Semantic** - Semantic HTML structure components
- **SidePanel** - Slide-out panel component for additional content
- **Table** - Data display and table components

### CMS Integration
Headless CMS and content management components:
- **WordPress** - Blog post integration and display with automatic Photon CDN URL processing
- **Contentful** - Headless CMS components and utilities with delivery and management APIs
- **PageBuilder** - Dynamic page construction from JSON
- **PageEngine** - Advanced page rendering with Contentful integration

### UI Components
User interface and interaction components:
- **Carousel** - Image and content sliders (Hero, Reviews, Portfolio)
- **Forms** - Form builder, validation, and emailer components
- **FormBuilder** - Advanced form construction and configuration
- **FormComponents** - Individual form field components and utilities
- **FormEngine** - Form rendering and processing engine
- **Menu** - Navigation components (Simple, Accordion, Expando)
- **Tab** - Tabbed interface component for organizing content
- **Tiles** - Image grid and tile layouts
- **FontSelector** - Font selection and Google Fonts integration
- **CompoundFontSelector** - Advanced font selection with multiple font families

### Development Tools
Components for development, configuration, and site building:
- **ComponentPropertiesForm** - Form for editing component properties
- **ComponentSelector** - Component selection interface
- **ComponentTree** - Visual component hierarchy display
- **ConfigBuilder** - Interactive configuration builder for site settings, metadata, routes, and visual design tokens
- **ConfigEngine** - Configuration processing and validation engine
- **PageBuilderUI** - User interface for page building
- **SaveLoadSection** - Save and load functionality for configurations

### SEO & Schema
Search engine optimization and structured data:
- **404** - Custom 404 error page component
- **FAQAccordion** - Interactive FAQ component with schema.org markup and search
- **GoogleAnalytics** - Google Analytics integration
- **GoogleMap** - Interactive Google Maps component
- **GoogleSearch** - Google Custom Search integration
- **JSON-LD** - Structured data schemas (LocalBusiness, Recipe, BlogPosting, etc.)
- **Manifest** - Web app manifest generation
- **MetaTags** - Dynamic meta tag injection
- **SchemaBlogPosting** - Blog post structured data
- **SchemaLocalBusiness** - Local business structured data
- **SchemaRecipe** - Recipe structured data
- **SchemaServices** - Services structured data
- **SchemaWebsite** - Website structured data
- **Sitemap** - XML sitemap generation
- **Social Cards** - Open Graph and Twitter card generation
- **BuzzwordBingo** - Interactive buzzword bingo game
- **Markdown** - Markdown rendering component
- **Recipe** - Recipe display component
- **Resume** - Resume/CV display component
- **Timeline** - Timeline visualization component

### Third-Party Integrations
External service integrations:
- **Calendly** - Scheduling and appointment booking
- **Cloudinary** - Image optimization and delivery
- **GoogleReviews** - Google business reviews integration
- **Gravatar** - User avatar integration
- **HubSpot** - CRM and marketing automation
- **Instagram** - Social media image integration
- **Flickr** - Photo sharing integration
- **PayPal** - Payment processing
- **ShoppingCart** - E-commerce shopping cart functionality
- **eBay** - Store listings and shopping cart
- **NerdJokes** - Entertainment content integration
- **Yelp** - Business reviews and ratings


### Site Health & Monitoring
Comprehensive site health monitoring and analytics:
- **SiteHealthOverview** - Dashboard overview of site health metrics
- **SiteHealthPerformance** - Performance monitoring and optimization insights
- **SiteHealthAccessibility** - Accessibility compliance testing with axe-core
- **SiteHealthSecurity** - Security vulnerability scanning and recommendations
- **SiteHealthSEO** - On-page SEO analysis and scoring
- **SiteHealthOnSiteSEO** - Advanced on-page SEO metrics (browser caching, gzip compression, mobile-first indexing, etc.)
- **SiteHealthGoogleAnalytics** - Google Analytics data integration
- **SiteHealthGoogleSearchConsole** - Google Search Console integration
- **SiteHealthCloudwatch** - AWS CloudWatch uptime monitoring
- **SiteHealthGit** - Git repository health and status
- **SiteHealthUptime** - Uptime monitoring and alerts
- **SiteHealthAxeCore** - Automated accessibility testing
- **SiteHealthDependencyVulnerabilities** - Dependency security scanning


## 🎨 Visual Design Configuration

The ConfigBuilder now includes a **Visual Design** tab that allows users to configure visual design tokens such as colors, fonts, spacing, and other design system variables. These tokens are stored in the `routes.json` file under the `visualdesign` object and can be used throughout your application for consistent theming.

### Features:
- **Color Management**: Primary, secondary, accent colors with color picker inputs
- **Typography**: Font family and base font size settings
- **Spacing & Layout**: Border radius, box shadows, transitions
- **Form-Based Editing**: User-friendly form interface powered by FormEngine
- **JSON Storage**: Design tokens stored as flattened key-value pairs in routes.json

### Usage:
```tsx
import { ConfigBuilder } from '@pixelated-tech/components';

function MyConfigPage() {
  return <ConfigBuilder />;
}
```

The visual design tokens can be accessed in your components via the config context or directly from the routes.json file.


## � Quick Start

Get up and running in minutes:

```bash
# Install the package
npm install @pixelated-tech/components

# Import and use components
import { Accordion, Callout } from '@pixelated-tech/components';
```

For detailed usage examples and API documentation, see the [Component Reference Guide](docs/components.md).

### Storybook Interactive Demos

Explore all components with live, interactive examples:

```bash
# Start Storybook development server
npm run storybook
```

**Access locally at:** `http://localhost:6006`


See the [open issues](https://github.com/brianwhaley/pixelated-components/issues) for a full list of proposed features (and known issues).





<!-- ROADMAP -->
## 🚀 Roadmap

See our detailed [Roadmap](docs/roadmap.md) for planned improvements and refactoring initiatives.


<!-- TESTING -->
## 🧪 Testing

See our comprehensive [Testing Documentation](docs/testing.md) for test coverage, setup, and strategies.


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request






### Top contributors:

<a href="https://github.com/brianwhaley/pixelated-components/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=brianwhaley/pixelated-components" alt="contrib.rocks image" />
</a>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.




<!-- CONTACT -->
## Contact

Brian Whaley - [@brianwhaley](https://twitter.com/@brianwhaley) - brian.whaley@gmail.com

Project Link: [https://github.com/brianwhaley/pixelated-components](https://github.com/brianwhaley/pixelated-components)






<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/brianwhaley/pixelated-components.svg?style=for-the-badge
[contributors-url]: https://github.com/brianwhaley/pixelated-components/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/brianwhaley/pixelated-components.svg?style=for-the-badge
[forks-url]: https://github.com/brianwhaley/pixelated-components/network/members

[stars-shield]: https://img.shields.io/github/stars/brianwhaley/pixelated-components.svg?style=for-the-badge
[stars-url]: https://github.com/brianwhaley/pixelated-components/stargazers

[issues-shield]: https://img.shields.io/github/issues/brianwhaley/pixelated-components.svg?style=for-the-badge
[issues-url]: https://github.com/brianwhaley/pixelated-components/issues

[license-shield]: https://img.shields.io/github/license/brianwhaley/pixelated-components.svg?style=for-the-badge
[license-url]: https://github.com/brianwhaley/pixelated-components/blob/master/LICENSE.txt

[coverage-shield]: https://img.shields.io/badge/coverage-77%25-brightgreen?style=for-the-badge
[coverage-url]: https://github.com/brianwhaley/pixelated-components

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/brianwhaley

[product-screenshot]: images/screenshot.png

[Calendly.com]: https://img.shields.io/badge/Calendly-006bff
[Calendly-url]: https://cloudinary.com

[Cloudinary.com]: https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white
[Cloudinary-url]: https://cloudinary.com

[Contentful.com]: https://img.shields.io/badge/Contentful-2478CC?logo=contentful&logoColor=fff
[Contentful-url]: https://contentful.com

[Flickr.com]: https://img.shields.io/static/v1?style=for-the-badge&message=Flickr&color=0063DC&logo=Flickr&logoColor=FFFFFF
[Flickr-url]: https://flickr.com

[GitHub.com]: https://img.shields.io/badge/GitHub-%23121011.svg?logo=github&logoColor=white
[Github-url]: https://www.github.com

[Gravatar.com]: https://img.shields.io/badge/Gravatar-1d4fc4
[Gravatar-url]: https://www.github.com

[Hubspot.com]: https://img.shields.io/badge/HubSpot-YES-brightgreen?style=plastic&logo=hubspot
[Hubspot-url]: https://www.github.com

[Instagram.com]: https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white
[Instagram-url]: https://www.github.com

[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/

[npm.org]: https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=fff
[npm-url]: https://www.npmjs.org

[PayPal.js]: https://img.shields.io/badge/PayPal-Support_Us-003087?logo=paypal&logoColor=fff
[PayPal-url]: https://reactjs.org/

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/

[Storybook.js]: https://img.shields.io/badge/Storybook-FF4785?logo=storybook&logoColor=white
[Storybook-url]: https://storybook.js.org

[WordPress.com]: https://img.shields.io/badge/WordPress-%2321759B.svg?logo=wordpress&logoColor=white
[Wordpress-url]: http://www.wordpress.com
