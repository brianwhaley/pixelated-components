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

// Centralized, canonical allowlist for environment variables that are
// explicitly permitted in source (very narrow scope). Keep this list
// small and documented; reference it everywhere in this module.
export const ALLOWED_ENV_VARS = [
	'NEXTAUTH_URL',
	'NODE_ENV',
	'PIXELATED_CONFIG_KEY', 
	'PUPPETEER_EXECUTABLE_PATH'
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

/* ===== RULE: prop-types-jsdoc ===== */
const propTypesJsdocRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Require JSDoc for components using PropTypes (either a JSDoc block above propTypes or inline comments for props)',
			category: 'Documentation',
			recommended: true,
		},
		messages: {
			missingJsDoc: 'Component "{{componentName}}" propTypes should have a JSDoc comment above propTypes or inline per-prop comments.',
		},
		schema: [],
	},
	create(context) {
		return {
			AssignmentExpression(node) {
				if (
					node.left &&
					node.left.type === 'MemberExpression' &&
					node.left.property &&
					node.left.property.name === 'propTypes'
				) {
					const componentName = node.left.object.name;
					const sourceCode = context.getSourceCode();
					const fileContent = sourceCode.text;
					// Only enforce for client components (match prop-types-inferprops behavior)
					if (!isClientComponent(fileContent)) return;

					// Check for JSDoc block immediately above propTypes
					const comments = sourceCode.getCommentsBefore(node);
					const hasJSDoc = comments.some(c => c.type === 'Block' && c.value.startsWith('*') && c.value.includes('@param'));

					// Check for inline per-prop comments
					let hasInline = false;
					if (node.right && node.right.properties) {
						for (const prop of node.right.properties) {
							const pc = sourceCode.getCommentsBefore(prop);
							if (pc && pc.length > 0) {
								hasInline = true;
								break;
							}
						}
					}

					if (!hasJSDoc && !hasInline) {
						context.report({ node, messageId: 'missingJsDoc', data: { componentName } });
					}
				}
			},
		};
	},
};

// ===== RULE: class-name-kebab-case =====
const classNameKebabCaseRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Enforce kebab-case for JSX className values',
			category: 'Stylistic',
			recommended: true,
		},
		messages: {
			invalidClass: 'Class name "{{className}}" should be kebab-case (e.g. "callout-title-text").',
		},
		schema: [],
	},
	create(context) {
		const kebabRe = /^[a-z0-9]+(-[a-z0-9]+)*$/;
		return {
			JSXAttribute(node) {
				if (!node.name) return;
				const name = node.name.name;
				if (name !== 'className' && name !== 'class') return;

				const value = node.value;
				if (!value) return;

				let text = null;
				if (value.type === 'Literal') text = value.value;
				else if (value.type === 'JSXExpressionContainer') {
					if (value.expression && value.expression.type === 'Literal') text = value.expression.value;
					else if (value.expression && value.expression.type === 'TemplateLiteral') {
						text = value.expression.quasis.map(q => q.value.cooked).join(' ');
					}
				}
				if (typeof text !== 'string') return; // skip dynamic expressions

				const parts = text.split(/\s+/).filter(Boolean);
				for (const part of parts) {
					if (!kebabRe.test(part)) {
						context.report({ node, messageId: 'invalidClass', data: { className: part } });
					}
				}
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

/* ===== RULE: validate-test-locations ===== */
const validateTestLocationsRule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Enforce canonical test file locations (only `src/tests` or `src/stories`)',
			category: 'Project Structure',
			recommended: true,
		},
		messages: {
			badLocation: 'Test spec files must live under `src/tests/` or `src/stories/` — move or add a migration note.',
		},
		schema: [],
	},
	create(context) {
		const filename = context.getFilename();
		if (!filename || filename === '<input>' || filename === '<text>') return {};

		// identify test-like filenames
		const isTestish = /\.(test|spec)\.(t|j)sx?$|\.honeypot\.test\.|\.stories?\./i.test(filename);
		if (!isTestish) return {};

		const normalized = filename.replaceAll('\\', '/');
		const allowedRoots = ['/src/tests/', '/src/stories/'];
		const ok = allowedRoots.some(r => normalized.includes(r));
		if (ok) return {};

		return {
			Program(node) {
				context.report({ node, messageId: 'badLocation' });
			},
		};
	},
};

/* ===== RULE: no-process-env ===== */
const noProcessEnvRule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow runtime environment-variable reads in source; use `pixelated.config.json` instead. Exception: PIXELATED_CONFIG_KEY',
			category: 'Security',
			recommended: true,
		},
		messages: {
			forbiddenEnv: 'Direct access to environment variables is forbidden; use the config provider. Allowed exceptions: PIXELATED_CONFIG_KEY, PUPPETEER_EXECUTABLE_PATH.',
		},
		schema: [
			{
				type: 'object',
				properties: { allowed: { type: 'array', items: { type: 'string' } } },
				additionalProperties: false,
			},
		],
	},
	create(context) {
		const options = context.options[0] || {};
		const allowed = new Set((options.allowed || ALLOWED_ENV_VARS).map(String));

		function rootIsProcessEnv(node) {
			let cur = node;
			while (cur && cur.type === 'MemberExpression') {
				if (cur.object && cur.object.type === 'Identifier' && cur.object.name === 'process') {
					if (cur.property && ((cur.property.name === 'env') || (cur.property.value === 'env'))) return true;
				}
				cur = cur.object;
			}
			return false;
		}

		function reportIfForbidden(nameNode, node) {
			const keyName = nameNode && (nameNode.name || nameNode.value);
			if (!keyName) { context.report({ node, messageId: 'forbiddenEnv' }); return; }
			if (!allowed.has(keyName)) context.report({ node, messageId: 'forbiddenEnv' });
		}

		return {
			MemberExpression(node) {
				// process.env.FOO or process['env'].FOO
				if (node.object && node.object.type === 'MemberExpression') {
					const obj = node.object;
					if (obj.object && obj.object.type === 'Identifier' && obj.object.name === 'process' && (obj.property.name === 'env' || obj.property.value === 'env')) {
						if (node.property.type === 'Identifier') reportIfForbidden(node.property, node);
						else if (node.property.type === 'Literal') reportIfForbidden(node.property, node);
						else context.report({ node, messageId: 'forbiddenEnv' });
					}
				}

				// import.meta.env.X
				if (node.object && node.object.type === 'MemberExpression' && node.object.object && node.object.object.type === 'MetaProperty') {
					if (node.object.property && (node.object.property.name === 'env' || node.object.property.value === 'env')) {
						if (node.property.type === 'Identifier') reportIfForbidden(node.property, node);
						else context.report({ node, messageId: 'forbiddenEnv' });
					}
				}
			},

			VariableDeclarator(node) {
				// const { X } = process.env
				if (node.init && node.init.type === 'MemberExpression' && rootIsProcessEnv(node.init) && node.id.type === 'ObjectPattern') {
					node.id.properties.forEach(p => { if (p.key) reportIfForbidden(p.key, p); else context.report({ node: p, messageId: 'forbiddenEnv' }); });
				}
			},

			'Program:exit'() {
				const source = context.getSourceCode().text;
				if (/\bprocess\s*\.\s*env\b/.test(source) && !(new RegExp('(?:' + ALLOWED_ENV_VARS.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')').test(source)) ) {
					context.report({ loc: { line: 1, column: 0 }, messageId: 'forbiddenEnv' });
				}
			},
		};
	},
};

/* ===== RULE: no-debug-true ===== */
const noDebugTrueRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Warn when `debug` is set to `true` in source files — ensure debug is disabled before shipping.',
			category: 'Best Practices',
			recommended: true,
		},
		messages: {
			debugOn: 'Found `debug = true` in source. Ensure debug is disabled or gated behind a dev-only flag before shipping.',
		},
		schema: [],
	},
	create(context) {
		const filename = context.getFilename() || '';
		// Allow debug=true in test/story files
		if (filename.includes('/src/tests/') || filename.includes('/src/test/') || filename.includes('/src/stories/')) {
			return {};
		}

		function isDebugName(n) {
			return typeof n === 'string' && /^debug$/i.test(n);
		}

		return {
			VariableDeclarator(node) {
				// const debug = true
				if (node.id && node.id.type === 'Identifier' && isDebugName(node.id.name) && node.init && node.init.type === 'Literal' && node.init.value === true) {
					context.report({ node: node.id, messageId: 'debugOn' });
				}

				// const cfg = { debug: true }
				if (node.init && node.init.type === 'ObjectExpression') {
					node.init.properties.forEach(p => {
						const key = p.key && (p.key.name || p.key.value);
						if (isDebugName(key) && p.value && p.value.type === 'Literal' && p.value.value === true) {
							context.report({ node: p, messageId: 'debugOn' });
						}
					});
				}
			},

			AssignmentExpression(node) {
				// debug = true  OR  obj.debug = true
				if (node.left.type === 'Identifier' && isDebugName(node.left.name) && node.right.type === 'Literal' && node.right.value === true) {
					context.report({ node: node.left, messageId: 'debugOn' });
				}
				if (node.left.type === 'MemberExpression') {
					const prop = node.left.property;
					const propName = prop && (prop.name || prop.value);
					if (isDebugName(propName) && node.right.type === 'Literal' && node.right.value === true) {
						context.report({ node: node.left, messageId: 'debugOn' });
					}
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
			missingFaqPage: 'FAQ page is missing. FAQ pages are strongly recommended (examples: src/app/faqs/page.tsx, src/app/(pages)/faqs/page.tsx, src/pages/faqs/index.tsx).',
			missingFaqSchema: 'FAQSchema (SchemaFAQ / JSON-LD @type:FAQPage) is missing from the FAQ page.',
		},
	},
	create(context) {
		// Only check this when linting layout.tsx
		if (!context.getFilename().endsWith('layout.tsx')) return {};

		const projectRoot = context.cwd;

		function findFaqPath(root) {
			// Walk `src/` and match any path segment or filename named `faq` or `faqs`.
			// Return the first matching `page.*` / `index.*` or a direct faq(s).(ts|tsx|js|jsx) file.
			// Returns `null` when no candidate is found.
			const srcRoot = path.join(root, 'src');
			if (!fs.existsSync(srcRoot)) return null;

			const stack = [srcRoot];
			const filePattern = /(^|\/)faqs?\.(t|j)sx?$/i; // matches .../faq.tsx, .../faqs.js, etc.
			while (stack.length) {
				const cur = stack.pop();
				try {
					const entries = fs.readdirSync(cur, { withFileTypes: true });
					for (const e of entries) {
						const full = path.join(cur, e.name);
						const rel = path.relative(root, full).replace(/\\/g, '/');

						if (e.isDirectory()) {
							// directory named faq/faqs -> prefer page/index inside it
							if (/^faqs?$/i.test(e.name)) {
								const candidates = [
									path.join(full, 'page.tsx'),
									path.join(full, 'page.ts'),
									path.join(full, 'index.tsx'),
									path.join(full, 'index.ts'),
								];
								for (const c of candidates) if (fs.existsSync(c)) return c;
							}
							// continue walking
							stack.push(full);
							continue;
						}

						// direct file matches like src/pages/faqs.tsx
						if (filePattern.test(rel)) return full;
					}
				} catch (err) {
					/* ignore unreadable dirs */
				}
			}

			return null;
		}

		const faqPath = findFaqPath(projectRoot);

		return {
			'Program:exit'() {
				// If finder returned nothing or the candidate does not exist -> missing page
				if (!faqPath || !fs.existsSync(faqPath)) {
					context.report({
						loc: { line: 1, column: 0 },
						messageId: 'missingFaqPage',
					});
					return;
				}

				// Accept component-based SchemaFAQ, `FAQSchema` identifier, or JSON-LD @type:FAQPage
				try {
					const content = fs.readFileSync(faqPath, 'utf8');
					const hasSchema = /FAQSchema|SchemaFAQ|"@type"\s*:\s*"FAQPage"/i.test(content);
					if (!hasSchema) {
						context.report({
							loc: { line: 1, column: 0 },
							messageId: 'missingFaqSchema',
						});
					}
				} catch (e) {
					// Ignore read errors
				}
			},
		};
	},
};

/* ===== RULE: file-name-kebab-case ===== */
const fileNameKebabCaseRule = (function fileNameKebabCaseRule(){
	const KEBAB_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	const rule = {
		meta: {
			type: 'suggestion',
			docs: { description: 'enforce kebab-case file names (lowercase-with-hyphens)', category: 'Stylistic Issues', recommended: true },
			fixable: null,
			schema: [ { type: 'object', properties: { allow: { type: 'array', items: { type: 'string' } } }, additionalProperties: false } ],
			messages: { notKebab: 'File name "{{name}}" is not kebab-case. Rename to "{{expected}}" (exceptions: index, tests/stories, .d.ts, docs).' },
		},
		create(context) {
			const opts = (context.options && context.options[0]) || {};
			const allow = Array.isArray(opts.allow) ? opts.allow : [];
			return {
				Program(node) {
					try {
						const filename = context.getFilename();
						if (!filename || filename === '<input>') return;
						const fn = filename.replace(/\\\\/g, '/').split('/').pop();
						if (!fn) return;
						if (/^README(\.|$)/i.test(fn)) return;
						let core = fn.replace(/\.d\.ts$/i, '').replace(/\.[^.]+$/, '');
						core = core.replace(/\.(test|spec|stories|honeypot\.test)$/i, '');
						if (!core || core === 'index') return;
						if (/\/(?:docs|src\/tests|src\/stories)\//.test(filename)) return;
						if (allow.includes(fn)) return;
						if (!KEBAB_RE.test(core)) {
							const expected = core.replace(/([A-Z])/g, (m) => '-' + m.toLowerCase()).replace(/[_\s]+/g, '-').replace(/--+/g, '-').replace(/^[-]+|[-]+$/g, '');
							const suggested = expected || core.toLowerCase();
							context.report({ node, messageId: 'notKebab', data: { name: fn, expected: suggested } });
						}
					} catch (err) { /* defensive */ }
				}
			};
		}
	};
	return rule;
})();

/* ===== RULE: no-duplicate-export-names ===== */
const noDuplicateExportNamesRule = {
	meta: {
		type: 'problem',
		docs: { description: 'Disallow duplicate exported identifiers from multiple source modules in a barrel file', category: 'Possible Errors', recommended: true },
		schema: [],
		messages: { duplicateExport: 'Duplicate export "{{name}}" found in multiple modules: {{modules}}' },
	},
	create(context) {
		const filename = context.getFilename();
		return {
			Program() {
				try {
					const sourceCode = context.getSourceCode();
					const exportAll = sourceCode.ast.body.filter(n => n.type === 'ExportAllDeclaration');
					if (exportAll.length < 2) return; // nothing to compare

					const nameMap = new Map();
					for (const node of exportAll) {
						if (!node.source || node.source.type !== 'Literal') continue;
						const spec = String(node.source.value);
						if (!spec.startsWith('.') && !spec.startsWith('/')) continue; // only local modules
						let resolved;
						try {
							resolved = require.resolve(spec, { paths: [path.dirname(filename)] });
						} catch (err) {
							const alt = path.resolve(path.dirname(filename), spec);
							if (fs.existsSync(alt + '.ts')) resolved = alt + '.ts';
							else if (fs.existsSync(alt + '.tsx')) resolved = alt + '.tsx';
							else if (fs.existsSync(alt + '.js')) resolved = alt + '.js';
							else continue;
						}
						let content = '';
						try { content = fs.readFileSync(resolved, 'utf8'); } catch (err) { continue; }

						// best-effort: collect exported identifiers via regex (covers common TS/JS exports)
						const exports = new Set();
						const patterns = [ /export\s+function\s+([A-Za-z0-9_$]+)/g, /export\s+(?:const|let|var)\s+([A-Za-z0-9_$]+)/g, /export\s+class\s+([A-Za-z0-9_$]+)/g, /export\s+(?:type|interface|enum)\s+([A-Za-z0-9_$]+)/g, /export\s*\{([^}]+)\}/g ];
						for (const re of patterns) {
							let m;
							while ((m = re.exec(content))) {
								if (m[1]) {
									m[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean).forEach(n => exports.add(n));
								}
							}
						}
						for (const name of exports) {
							if (!nameMap.has(name)) nameMap.set(name, []);
							nameMap.get(name).push(spec);
						}
					}

					// report duplicates collected across all export * sources
					for (const [name, modules] of nameMap.entries()) {
						if (modules.length > 1) {
							context.report({ node: sourceCode.ast, messageId: 'duplicateExport', data: { name, modules: modules.join(', ') } });
						}
					}
				} catch (err) {
					// defensive: do not allow rule errors to crash ESLint
				}
			}
		};
	}
};

export default {
	rules: {
		'prop-types-inferprops': propTypesInferPropsRule,
		'required-schemas': requiredSchemasRule,
		'required-files': requiredFilesRule,
		'no-raw-img': noRawImgRule,
		'require-section-ids': requireSectionIdsRule,
		'required-faq': requiredFaqRule,
		'validate-test-locations': validateTestLocationsRule,
		'no-process-env': noProcessEnvRule,
		'no-debug-true': noDebugTrueRule,
		'required-proptypes-jsdoc': propTypesJsdocRule,
		'file-name-kebab-case': fileNameKebabCaseRule,
		'no-duplicate-export-names': noDuplicateExportNamesRule,
		'class-name-kebab-case': classNameKebabCaseRule,
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
				'pixelated/validate-test-locations': 'error',
				'pixelated/no-process-env': ['error', { allowed: ALLOWED_ENV_VARS } ],
				'pixelated/no-debug-true': 'warn',
				'pixelated/file-name-kebab-case': 'off',
				'pixelated/required-proptypes-jsdoc': 'warn',
				'pixelated/no-duplicate-export-names': 'error',
				'pixelated/class-name-kebab-case': 'warn',
			},
		},
	},
};

