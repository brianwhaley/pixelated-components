import fs from 'fs';
import path from 'path';

/**
 * Pixelated ESLint Plugin
 * Enforces workspace standards for SEO, performance, and project structure.
 */


// DUPLICATE FROM components/general/utilities.ts --- KEEP IN SYNC ---
export const CLIENT_ONLY_PATTERNS = [
	/\baddEventListener\b/,
	/\bcreateContext\b/,
	/\bdocument\./,
	/\blocalStorage\b/,
	/\bnavigator\./,
	/\bonBlur\b/,
	/\bonChange\b/,
	/\bonClick\b/,
	/\bonFocus\b/,
	/\bonInput\b/,
	/\bonKey\b/,
	/\bonMouse\b/,
	/\bonSubmit\b/,
	/\bremoveEventListener\b/,
	/\bsessionStorage\b/,
	/\buseCallback\b/,
	/\buseContext\b/,
	/\buseEffect\b/,
	/\buseLayoutEffect\b/,
	/\buseMemo\b/,
	/\buseReducer\b/,
	/\buseRef\b/,
	/\buseState\b/,
	/\bwindow\./,
	/["']use client["']/  // Client directive
];

export function isClientComponent(fileContent) {
	return CLIENT_ONLY_PATTERNS.some(pattern => pattern.test(fileContent));
}


const propTypesInferPropsRule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Enforce PropTypes + InferProps pattern for React components',
			category: 'Best Practices',
			recommended: true,
		},
		fixable: false,
		schema: [],
		messages: {
			missingPropTypes: 'Component "{{componentName}}" is missing propTypes. Add: {{componentName}}.propTypes = { ... }; immediately above the function.',
			missingInferProps: 'Component "{{componentName}}" is missing InferProps type. Add: export type {{componentName}}Type = InferProps<typeof {{componentName}}.propTypes>; immediately above the function.',
			invalidInferProps: 'InferProps type for "{{componentName}}" must be named "{{componentName}}Type" and exported. Rename and add export.',
			missingInferPropsUsage: 'Component "{{componentName}}" function parameters must use the InferProps type. Change: export function {{componentName}}(props: {{componentName}}Type)',
			propTypesPlacement: 'Component "{{componentName}}" propTypes must be defined immediately above the function declaration with no blank lines. Move {{componentName}}.propTypes = { ... }; right above the function.',
			inferPropsPlacement: 'Component "{{componentName}}" InferProps type must be defined immediately above the function declaration with no blank lines. Move export type {{componentName}}Type = ...; right above the function.',
		},
	},
	create(context) {

		const components = new Map(); // Track components and their patterns

		function checkForInferProps(typeAnnotation) {
			if (!typeAnnotation) return false;
      
			if (typeAnnotation.type === 'TSTypeReference' && typeAnnotation.typeName?.name === 'InferProps') {
				return true;
			}
      
			if (typeAnnotation.type === 'TSIntersectionType') {
				return typeAnnotation.types.some(checkForInferProps);
			}
      
			return false;
		}

		function extractComponentNameFromInferProps(node) {
			// For our pattern of ComponentType = InferProps<typeof Component.propTypes>
			// We can simply remove 'Type' from the type name
			return node.id.name.replace('Type', '');
		}

		function reportViolations(component) {
			const { functionNode, hasPropTypes, hasInferProps, usesInferProps, inferPropsName, propTypesNode, inferPropsNode } = component;
			if (!functionNode) return; // Skip if function not found yet
      
			const componentName = functionNode.id.name;

			if (!hasPropTypes) {
				context.report({
					node: functionNode,
					messageId: 'missingPropTypes',
					data: { componentName },
				});
			}

			if (!hasInferProps) {
				context.report({
					node: functionNode,
					messageId: 'missingInferProps',
					data: { componentName },
				});
			}

			if (hasPropTypes && hasInferProps && !usesInferProps && functionNode.params.length > 0) {
				context.report({
					node: functionNode,
					messageId: 'missingInferPropsUsage',
					data: { componentName, inferPropsName },
				});
			}

			// Check placement and ordering: propTypes -> InferProps -> function (consecutive, no empty lines)
			if (hasPropTypes && hasInferProps && propTypesNode && inferPropsNode) {
				const propTypesEndLine = propTypesNode.loc.end.line;
				const inferPropsLine = inferPropsNode.loc.start.line;
				const functionLine = functionNode.loc.start.line;
        
				// InferProps must immediately follow propTypes (no empty lines)
				if (inferPropsLine !== propTypesEndLine + 1) {
					context.report({
						node: inferPropsNode,
						messageId: 'inferPropsPlacement',
						data: { componentName },
					});
				}
        
				// Function must immediately follow InferProps (no empty lines)
				if (functionLine !== inferPropsLine + 1) {
					context.report({
						node: functionNode,
						messageId: 'propTypesPlacement',
						data: { componentName },
					});
				}
			}
		}

		return {
			// Find component function declarations
			FunctionDeclaration(node) {
				if (node.id && node.id.name && node.parent.type === 'ExportNamedDeclaration') {
					const componentName = node.id.name;

					// Check if this is a client component (contains client-only patterns)
					const sourceCode = context.getSourceCode();
					const fileContent = sourceCode.text;
					if (componentName[0] === componentName[0].toUpperCase() && isClientComponent(fileContent)) {
						if (!components.has(componentName)) {
							components.set(componentName, {
								functionNode: node,
								hasPropTypes: false,
								hasInferProps: false,
								inferPropsName: `${componentName}Type`,
								usesInferProps: false,
								propTypesNode: null,
								inferPropsNode: null,
							});
						} else {
							// Component entry already exists (e.g., from propTypes), just update functionNode
							components.get(componentName).functionNode = node;
						}
					}
				}
			},

			// Find PropTypes assignments
			AssignmentExpression(node) {
				if (
					node.left.type === 'MemberExpression' &&
          node.left.object.type === 'Identifier' &&
          node.left.property.name === 'propTypes'
				) {
					const componentName = node.left.object.name;
					if (!components.has(componentName)) {
						// Component might be declared later, create entry now
						components.set(componentName, {
							functionNode: null, // Will be set when function is found
							hasPropTypes: false,
							hasInferProps: false,
							inferPropsName: `${componentName}Type`,
							usesInferProps: false,
							propTypesNode: null,
							inferPropsNode: null,
						});
					}
					const component = components.get(componentName);
					component.hasPropTypes = true;
					component.propTypesNode = node;
				}
			},

			// Find InferProps type declarations
			TSTypeAliasDeclaration(node) {
				if (node.parent.type === 'ExportNamedDeclaration') {
					const componentName = extractComponentNameFromInferProps(node);
					if (componentName && components.has(componentName)) {
						const component = components.get(componentName);
						if (node.id.name === component.inferPropsName) {
							// Check if type annotation contains InferProps
							const hasInferProps = checkForInferProps(node.typeAnnotation);
							if (hasInferProps) {
								component.hasInferProps = true;
								component.inferPropsNode = node;
							}
						}
					}
				}
			},

			// Check function parameters
			'FunctionDeclaration:exit'(node) {
				if (node.id && components.has(node.id.name)) {
					const component = components.get(node.id.name);

					// Check if function uses the InferProps type
					if (node.params.length === 1) {
						const param = node.params[0];
            
						// Handle both direct type annotation and destructured parameters
						let paramTypeName = null;
            
						if (param.type === 'Identifier' && param.typeAnnotation?.typeAnnotation?.type === 'TSTypeReference') {
							// Direct parameter: (props: ComponentType)
							paramTypeName = param.typeAnnotation.typeAnnotation.typeName?.name;
						} else if (param.type === 'ObjectPattern' && param.typeAnnotation?.typeAnnotation?.type === 'TSTypeReference') {
							// Destructured parameter: ({ prop }: ComponentType)
							paramTypeName = param.typeAnnotation.typeAnnotation.typeName?.name;
						}
            
						if (paramTypeName === component.inferPropsName) {
							component.usesInferProps = true;
						}
					}

					// Report violations
					reportViolations(component);
				}
			},
		};
	},
};

const requiredSchemasRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Ensure required SEO schemas are present in layout.tsx',
			category: 'SEO',
			recommended: true,
		},
		messages: {
			missingSchema: 'Required SEO Schema "{{schemaName}}" is missing from layout.tsx.',
		},
	},
	create(context) {
		if (!context.getFilename().endsWith('layout.tsx')) return {};

		const requiredSchemas = ['WebsiteSchema', 'LocalBusinessSchema', 'ServicesSchema'];
		const foundSchemas = new Set();

		return {
			JSXIdentifier(node) {
				if (requiredSchemas.includes(node.name)) {
					foundSchemas.add(node.name);
				}
			},
			'Program:exit'() {
				requiredSchemas.forEach(schema => {
					if (!foundSchemas.has(schema)) {
						context.report({
							loc: { line: 1, column: 0 },
							messageId: 'missingSchema',
							data: { schemaName: schema },
						});
					}
				});
			},
		};
	},
};

const requiredFilesRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Ensure critical project files are present',
			category: 'Project Structure',
			recommended: true,
		},
		messages: {
			missingFile: 'Missing recommended project file: "{{fileName}}".',
		},
	},
	create(context) {
		// Only run this check once per project execution, ideally on layout.tsx
		if (!context.getFilename().endsWith('layout.tsx')) return {};

		const projectRoot = context.cwd;
		const requiredFiles = [
			{ name: 'sitemap', pattern: /sitemap\.(ts|js|xml|tsx)$/ },
			{ name: 'manifest', pattern: /manifest\.(json|ts|tsx)$/ },
			{ name: 'not-found', pattern: /not-found\.tsx$/ },
			{ name: 'robots', pattern: /robots\.(ts|tsx)$/ },
			{ name: 'proxy.ts', pattern: /^proxy\.ts$/ },
			{ name: 'amplify.yml', pattern: /^amplify\.yml$/ },
		];

		return {
			'Program:exit'() {
				try {
					const files = fs.readdirSync(projectRoot);
					
					// Check common subdirectories
					let appFiles = [];
					let srcFiles = [];
					const appPath = path.join(projectRoot, 'src/app');
					const srcPath = path.join(projectRoot, 'src');
					
					if (fs.existsSync(appPath)) {
						appFiles = fs.readdirSync(appPath);
					}
					if (fs.existsSync(srcPath)) {
						srcFiles = fs.readdirSync(srcPath);
					}

					const allFiles = [...files, ...appFiles, ...srcFiles];

					requiredFiles.forEach(req => {
						const found = allFiles.some(f => req.pattern.test(f));
						if (!found) {
							context.report({
								loc: { line: 1, column: 0 },
								messageId: 'missingFile',
								data: { fileName: req.name },
							});
						}
					});
				} catch (e) {
					// Ignore errors
				}
			},
		};
	},
};

const noRawImgRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Prevent usage of raw <img> tags in favor of SmartImage',
			category: 'Performance',
			recommended: true,
		},
		messages: {
			useSmartImage: 'Use <SmartImage /> instead of raw <img> for better performance and CDN support.',
		},
	},
	create(context) {
		return {
			JSXOpeningElement(node) {
				if (node.name.name === 'img') {
					context.report({
						node,
						messageId: 'useSmartImage',
					});
				}
			},
		};
	},
};

/* ===== RULE: require-section-ids ===== */
const requireSectionIdsRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Require `id` attributes on every <section> and <PageSection> for jump links and SEO',
			category: 'Accessibility',
			recommended: false,
		},
		messages: {
			missingId: '`section` and `PageSection` elements must have an `id` attribute for jump-link support and SEO hierarchy.',
		},
		schema: [],
	},
	create(context) {
		/*
			 * Helper: get a string name for a JSX element. Supports
			 * `JSXIdentifier` and `JSXMemberExpression` (e.g. `UI.PageSection`).
			 */
		function getJSXElementName(node) {
			if (!node) return null;
			if (node.type === 'JSXIdentifier') return node.name;
			if (node.type === 'JSXMemberExpression') return node.property?.name || null;
			return null;
		}

		return {
			JSXOpeningElement(node) {
				try {
					const name = getJSXElementName(node.name); if (!name || !['section','PageSection'].includes(name)) return;

					const hasId = (node.attributes || []).some(attr => (
						attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'id' && attr.value != null
					));
					if (!hasId) {
						context.report({ node, messageId: 'missingId' });
					}
				} catch (e) {
					// defensive: don't crash lint
				}
			},
		};
	},
};

const requiredFaqRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Ensure FAQ page and FAQSchema are present',
			category: 'SEO',
			recommended: true,
		},
		messages: {
			missingFaqPage: 'FAQ page is missing. FAQ pages are strongly recommended for every site (src/app/faq/page.tsx).',
			missingFaqSchema: 'FAQSchema is missing from the FAQ page.',
		},
	},
	create(context) {
		// Only check this when linting layout.tsx
		if (!context.getFilename().endsWith('layout.tsx')) return {};

		const projectRoot = context.cwd;
		const faqPath = path.join(projectRoot, 'src/app/faq/page.tsx');

		return {
			'Program:exit'() {
				if (!fs.existsSync(faqPath)) {
					context.report({
						loc: { line: 1, column: 0 },
						messageId: 'missingFaqPage',
					});
				} else {
					try {
						const content = fs.readFileSync(faqPath, 'utf8');
						if (!content.includes('FAQSchema')) {
							context.report({
								loc: { line: 1, column: 0 },
								messageId: 'missingFaqSchema',
							});
						}
					} catch (e) {
						// Ignore read errors
					}
				}
			},
		};
	},
};

export default {
	rules: {
		'prop-types-inferprops': propTypesInferPropsRule,
		'required-schemas': requiredSchemasRule,
		'required-files': requiredFilesRule,
		'no-raw-img': noRawImgRule,
		'require-section-ids': requireSectionIdsRule,
		'required-faq': requiredFaqRule,
	},
	configs: {
		recommended: {
			rules: {
				'pixelated/prop-types-inferprops': 'error',
				'pixelated/required-schemas': 'warn',
				'pixelated/required-files': 'warn',
				'pixelated/no-raw-img': 'warn',
				'pixelated/require-section-ids': 'warn',
				'pixelated/required-faq': 'warn',
			},
		},
	},
};

