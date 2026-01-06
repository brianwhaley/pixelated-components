# Coding Conventions

This document outlines the coding standards and conventions used in the pixelated-components project.

## General

### Indentation
- Use tabs for indentation with tab size 4
- Do not use spaces for indentation

## TypeScript & React

### PropTypes & Type Inference
- Use PropTypes for runtime validation
- Use `InferProps<typeof Component.propTypes>` for TypeScript types
- Define PropTypes before the component function
- Example:
```typescript
Component.propTypes = {
	propName: PropTypes.string.isRequired,
	optionalProp: PropTypes.number
};
export type ComponentType = InferProps<typeof Component.propTypes>;
export function Component(props: ComponentType) { ... }
```

### Component Structure
- Use functional components with hooks
- Export both the component and its type
- Use named exports over default exports
- Place PropTypes definition immediately before the component

### File Organization
- Group related components in feature directories
- Use kebab-case for file names: `component-name.tsx`
- Place CSS files alongside components: `component-name.css`
- Use index files for clean imports

## APIs & Services

### API Service Structure
- Create thin API services that handle external integrations
- Separate business logic from API calls
- Use TypeScript interfaces for API request/response types
- Handle errors gracefully with proper typing

### Service File Naming
- Use descriptive names: `gemini-api.ts`, `analytics-service.ts`
- Place in appropriate directories (utilities, services, etc.)
- Export functions and types clearly

### Error Handling
- Use try/catch blocks for async operations
- Return typed error responses
- Log errors appropriately
- Provide user-friendly error messages

## CSS

### Naming Convention
- Use kebab-case for class names
- Use BEM methodology when appropriate
- Prefix component-specific classes: `.component-name__element`

### CSS Variables
- Use CSS custom properties for theming
- Define variables at the root level when possible
- Use semantic variable names: `--font-size5`, `--color-primary`

## Testing

### Test File Structure
- Place tests in the `src/tests` directory: `component-name.test.tsx`
- Use descriptive test names
- Test both success and error cases

## Documentation

### Code Comments
- Use JSDoc for function documentation
- Comment complex logic
- Keep comments up to date

### README Files
- Include usage examples
- Document props and types
- Provide setup instructions

## Development Workflow

### Before Implementing New Features
1. **Use Existing Components**: Build on existing components rather than creating new ones from scratch
2. **Small Iterations**: Implement features in small, incremental steps
3. **Regular Quality Checks**: Run linting, testing, and building frequently during development
4. **Storybook Testing**: Test components in Storybook to ensure proper functionality and appearance

### Implementation Process
- Start with existing component patterns
- Make small changes and validate each step
- Use linting tools to maintain code quality
- Test in Storybook for visual and functional verification
- Run build process regularly to catch issues early

## Git & Workflow

### Commit Messages
- Use conventional commit format
- Write clear, descriptive messages
- Reference issues when applicable

### Branch Naming
- Use feature branches: `feature/component-name`
- Use bugfix branches: `bugfix/issue-description`
- Use kebab-case for branch names