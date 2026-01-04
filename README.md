# Pixelated Admin

A Next.js application for managing Pixelated CMS sites with AI-powered content optimization.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation

- [Environment Setup](docs/documentation.md) - OAuth configuration and deployment
- [Coding Conventions](https://github.com/brianwhaley/pixelated-components/blob/main/docs/coding-conventions.md) - Development standards and best practices (shared across Pixelated projects)

## Features

- **AI-Powered SEO**: Google Gemini integration for intelligent content recommendations
- **Site Configuration**: Dynamic form builder for route and page management
- **Authentication**: NextAuth.js with Google and Apple OAuth providers
- **Responsive Design**: Mobile-first UI with custom CSS variables

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: CSS Modules with custom properties
- **Authentication**: NextAuth.js
- **AI Integration**: Google Gemini API
- **Testing**: Vitest

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
├── lib/                 # Utility functions and services
├── styles/              # Global styles and CSS variables
└── types/               # TypeScript type definitions

docs/                    # Project documentation
├── documentation.md     # Environment and deployment setup
└── coding-conventions.md # Development standards
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
