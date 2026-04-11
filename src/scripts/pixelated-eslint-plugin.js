import fs from 'fs';
import path from 'path';
import { builtinModules } from 'module';

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

function isRelativeOrAliasImport(source) {
	return source.startsWith('.') || source.startsWith('/') || source.startsWith('@/') || source.startsWith('~/');
}

function getPackageNameFromSource(source) {
	if (!source || typeof source !== 'string') return null;
	if (isRelativeOrAliasImport(source)) return null;
	if (source.startsWith('node:')) source = source.slice(5);
	const segments = source.split('/');
	if (source.startsWith('@')) {
		return segments.length >= 2 ? `${segments[0]}/${segments[1]}` : source;
	}
	return segments[0];
}

function isBuiltinModule(name) {
	if (!name || typeof name !== 'string') return false;
	if (name.startsWith('node:')) name = name.slice(5);
	return builtinModules.includes(name);
}

function getNearestPackageJsonPath(filename) {
	if (!filename || filename === '<input>' || filename === '<text>') {
		const cwd = process.cwd();
		const candidate = path.join(cwd, 'package.json');
		return fs.existsSync(candidate) ? candidate : null;
	}

	let current = path.resolve(filename);
	if (fs.existsSync(current) && fs.statSync(current).isFile()) {
		current = path.dirname(current);
	}

	while (true) {
		const candidate = path.join(current, 'package.json');
		if (fs.existsSync(candidate)) return candidate;
		const parent = path.dirname(current);
		if (parent === current) break;
		current = parent;
	}
	return null;
}

function readPackageJson(packageJsonPath) {
	try {
		return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	} catch {
		return null;
	}
}

function getContextFilename(context) {
	if (!context) return null;
	if (typeof context.getFilename === 'function') return context.getFilename();
	if (typeof context.filename === 'string') return context.filename;
	if (context.sourceCode?.filename) return context.sourceCode.filename;
	return null;
}

function getContextSourceCode(context) {
	if (!context) return null;
	if (typeof context.getSourceCode === 'function') return context.getSourceCode();
	if (context.sourceCode) return context.sourceCode;
	return null;
}

function stripComments(source) {
	return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function collectImportsFromSource(source) {
	const cleaned = stripComments(source);
	const imports = new Set();
	const regex = /(?:import\s+(?:[^'"\n]+?\s+from\s+)?|export\s+(?:\*\s+from\s+|\{[^}]*\}\s+from\s+)?|require\(\s*|import\()(['"])([^'"\\]+)\1/g;
	let match;
	while ((match = regex.exec(cleaned))) {
		const specifier = match[2];
		const name = getPackageNameFromSource(specifier);
		if (name) imports.add(name);
	}
	return [...imports];
}

function collectPackagesFromScript(script) {
	const packages = new Set();
	if (typeof script !== 'string' || !script.trim()) return packages;

	const cleaned = script.replace(/#.*/g, '').trim();
	const tokens = cleaned.split(/[\s|&;]+/);
	const ignoredCommands = new Set([
		'npm', 'npx', 'pnpm', 'yarn', 'node', 'bash', 'sh', 'git', 'cd', 'mkdir',
		'rimraf', 'cross-env', 'run', 'exec', 'npm/run', 'pnpm/exec', 'yarn/exec',
	]);

	for (const token of tokens) {
		if (!token || token.startsWith('-')) continue;
		const normalized = token.replace(/^node_modules\/\.bin\//, '');
		if (!normalized || normalized.startsWith('.') || normalized.startsWith('/')) continue;
		if (ignoredCommands.has(normalized)) continue;
		const candidate = getPackageNameFromSource(normalized);
		if (candidate) packages.add(candidate);
	}

	return packages;
}

function collectCommandPackagesFromScript(script, declaredPackages) {
	const packages = new Set();
	if (typeof script !== 'string' || !script.trim()) return packages;

	const cleaned = script.replace(/#.*/g, '').trim();
	const tokens = cleaned.split(/[\s|&;]+/);
	const ignoredCommands = new Set([
		'npm', 'npx', 'pnpm', 'yarn', 'node', 'bash', 'sh', 'git', 'cd', 'mkdir',
		'rimraf', 'cross-env', 'run', 'exec', 'npm/run', 'pnpm/exec', 'yarn/exec',
	]);

	for (const token of tokens) {
		if (!token || token.startsWith('-')) continue;
		const normalized = token.replace(/^node_modules\/\.bin\//, '');
		if (!normalized || normalized.startsWith('.') || normalized.startsWith('/')) continue;
		if (ignoredCommands.has(normalized)) continue;

		const candidate = getPackageNameFromSource(normalized);
		if (candidate && declaredPackages.has(candidate)) {
			packages.add(candidate);
			continue;
		}

		for (const declared of declaredPackages) {
			if (declared === normalized || declared.endsWith(`/${normalized}`)) {
				packages.add(declared);
				break;
			}
		}
	}

	return packages;
}

function scanPackageJsonScriptPackages(projectRoot, manifest) {
	const packages = new Set();
	if (!manifest || !manifest.scripts) return packages;

	const declaredPackages = new Set([
		...Object.keys(manifest.dependencies || {}),
		...Object.keys(manifest.devDependencies || {}),
		...Object.keys(manifest.optionalDependencies || {}),
		...Object.keys(manifest.peerDependencies || {}),
	]);

	for (const script of Object.values(manifest.scripts || {})) {
		collectCommandPackagesFromScript(script, declaredPackages).forEach(pkg => packages.add(pkg));
	}

	return packages;
}

const reportedUnusedDependencyRoots = new Set();

function scanProjectImports(projectRoot) {
	const importedPackages = new Set();
	const extensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts']);

	function walk(directory) {
		let entries;
		try {
			entries = fs.readdirSync(directory, { withFileTypes: true });
		} catch {
			return;
		}

		for (const entry of entries) {
			if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next' || entry.name === 'dist' || entry.name.startsWith('.')) {
				continue;
			}

			const fullPath = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath);
				continue;
			}

			if (!extensions.has(path.extname(entry.name))) continue;
			let source;
			try {
				source = fs.readFileSync(fullPath, 'utf8');
			} catch {
				continue;
			}
			collectImportsFromSource(source).forEach(pkg => importedPackages.add(pkg));
		}
	}

	walk(projectRoot);
	return importedPackages;
}

function scanProjectRuntimeImports(projectRoot) {
	const importedPackages = new Set();
	const extensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts']);

	function walk(directory) {
		let entries;
		try {
			entries = fs.readdirSync(directory, { withFileTypes: true });
		} catch {
			return;
		}

		for (const entry of entries) {
			if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next' || entry.name === 'dist' || entry.name.startsWith('.')) {
				continue;
			}

			const fullPath = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath);
				continue;
			}

			if (!extensions.has(path.extname(entry.name))) continue;
			const normalizedPath = fullPath.replace(/\\/g, '/');
			if (
				normalizedPath.includes('/tests/') ||
				normalizedPath.includes('/__tests__/') ||
				normalizedPath.includes('/stories/') ||
				/\.(?:test|spec)\.(?:t|j)sx?$/i.test(normalizedPath)
			) continue;
			if (isDevFile(normalizedPath)) continue;
			let source;
			try {
				source = fs.readFileSync(fullPath, 'utf8');
			} catch {
				continue;
			}
			collectImportsFromSource(source).forEach(pkg => importedPackages.add(pkg));
		}
	}

	walk(projectRoot);
	return importedPackages;
}

function isConfigFile(filename) {
	if (!filename) return false;
	const normalized = filename.replace(/\\/g, '/');
	return [
		/\.rc(?:\.(?:js|cjs|mjs|ts|tsx|json))?$/i,
		/\.(?:config)\.(?:js|cjs|mjs|ts|tsx|json)$/i,
	].some(re => re.test(normalized));
}

function isTestFile(filename) {
	if (!filename) return false;
	const normalized = filename.replace(/\\/g, '/');
	return [
		/(?:^|\/)(?:tests?|__tests?)(?:\/|$)/i,
		/\.(?:test|spec)\.(?:t|j)sx?$/i,
		/\.stories?\.(?:t|j)sx?$/i,
	].some(re => re.test(normalized));
}

function isDevFile(filename) {
	if (!filename) return false;
	if (isConfigFile(filename)) return true;
	if (isTestFile(filename)) return true;
	const normalized = filename.replace(/\\/g, '/');
	const patterns = [
		/\/(?:scripts|build|tools|config)\//,
		/\b(?:jest|vite|webpack|rollup|tailwind|postcss|tsconfig|swc|vitest|eslint)\.(?:js|cjs|mjs|ts|tsx|json)$/i,
	];
	return patterns.some(re => re.test(normalized));
}

const packageJsonNoUnusedDependencyRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Detect dependencies declared in package.json that are not imported from runtime source.',
			category: 'Dependencies',
			recommended: true,
		},
		messages: {
			unusedDependency: 'Package "{{name}}" is declared in dependencies but not imported by any runtime source file. Remove it if it is no longer needed.',
			unusedOptionalDependency: 'Package "{{name}}" is declared in optionalDependencies but not imported by any runtime source file. Move it to devDependencies if it is only used by tests/build tooling, or remove it if it is no longer needed.',
		},
		schema: [],
	},
	create(context) {
		const filename = getContextFilename(context);
		const packageJsonPath = getNearestPackageJsonPath(filename);
		if (!packageJsonPath) return {};
		const projectRoot = path.dirname(packageJsonPath);
		const manifest = readPackageJson(packageJsonPath);
		if (!manifest) return {};

		const dependencies = manifest.dependencies || {};
		const optionalDependencies = manifest.optionalDependencies || {};
		const declaredPackages = new Set([ ...Object.keys(dependencies), ...Object.keys(optionalDependencies) ]);
		if (reportedUnusedDependencyRoots.has(projectRoot)) return {};
		reportedUnusedDependencyRoots.add(projectRoot);

		return {
			'Program:exit'() {
				const usedPackages = scanProjectImports(projectRoot);
				scanPackageJsonScriptPackages(projectRoot, manifest).forEach(pkg => usedPackages.add(pkg));
				const sourceCode = getContextSourceCode(context);
				for (const name of declaredPackages) {
					if (name.startsWith('@types/')) continue;
					if (!usedPackages.has(name)) {
						const messageId = optionalDependencies[name]
							? 'unusedOptionalDependency'
							: 'unusedDependency';
						context.report({ node: sourceCode?.ast || null, messageId, data: { name } });
					}
				}
			},
		};
	},
};

const packageJsonMissingDependencyRule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Detect imports that are not declared in package.json.',
			category: 'Dependencies',
			recommended: true,
		},
		messages: {
			missingDependency: 'Package "{{name}}" is imported but not declared in package.json.',
		},
		schema: [],
	},
	create(context) {
		const filename = getContextFilename(context);
		const packageJsonPath = getNearestPackageJsonPath(filename);
		if (!packageJsonPath) return {};
		const manifest = readPackageJson(packageJsonPath);
		if (!manifest) return {};

		const declaredPackages = new Set([
			...Object.keys(manifest.dependencies || {}),
			...Object.keys(manifest.devDependencies || {}),
			...Object.keys(manifest.optionalDependencies || {}),
			...Object.keys(manifest.peerDependencies || {}),
		]);

		function checkSource(node, source) {
			const name = getPackageNameFromSource(source);
			if (!name) return;
			if (declaredPackages.has(name)) return;
			if (isBuiltinModule(name)) return;
			context.report({ node, messageId: 'missingDependency', data: { name } });
		}

		return {
			ImportDeclaration(node) {
				checkSource(node.source, node.source.value);
			},
			ExportAllDeclaration(node) {
				if (node.source) checkSource(node.source, node.source.value);
			},
			ExportNamedDeclaration(node) {
				if (node.source) checkSource(node.source, node.source.value);
			},
			CallExpression(node) {
				if (node.callee.type === 'Identifier' && node.callee.name === 'require' && node.arguments.length === 1) {
					const arg = node.arguments[0];
					if (arg.type === 'Literal' && typeof arg.value === 'string') {
						checkSource(node, arg.value);
					}
				}
			},
			ImportExpression(node) {
				if (node.source.type === 'Literal' && typeof node.source.value === 'string') {
					checkSource(node, node.source.value);
				}
			},
		};
	},
};

const packageJsonWrongDependencyTypeRule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Detect mismatches between import file locations and package.json dependency type.',
			category: 'Dependencies',
			recommended: true,
		},
		messages: {
			prodUsedInDev: 'Package "{{name}}" is declared in {{declaredType}} but imported from dev-only source "{{filename}}". Move it to devDependencies if it is only used for development or testing.',
			devUsedInProd: 'Package "{{name}}" is declared in devDependencies but imported by runtime source "{{filename}}". Move it to dependencies or optionalDependencies.',
			optionalUsedInDev: 'Package "{{name}}" is declared in optionalDependencies but imported from dev-only source "{{filename}}". Move it to devDependencies if it is a build/test-only dependency.',
		},
		schema: [],
	},
	create(context) {
		const filename = getContextFilename(context);
		const packageJsonPath = getNearestPackageJsonPath(filename);
		if (!packageJsonPath) return {};
		const manifest = readPackageJson(packageJsonPath);
		if (!manifest) return {};

		const categories = {
			dependencies: new Set(Object.keys(manifest.dependencies || {})),
			devDependencies: new Set(Object.keys(manifest.devDependencies || {})),
			optionalDependencies: new Set(Object.keys(manifest.optionalDependencies || {})),
			peerDependencies: new Set(Object.keys(manifest.peerDependencies || {})),
		};

		const fileIsDev = isDevFile(filename);
	const runtimePackages = scanProjectRuntimeImports(path.dirname(packageJsonPath));

	function getDeclaredType(name) {
		if (categories.devDependencies.has(name)) return 'devDependencies';
		if (categories.optionalDependencies.has(name)) return 'optionalDependencies';
		if (categories.dependencies.has(name)) return 'dependencies';
		if (categories.peerDependencies.has(name)) return 'peerDependencies';
		return null;
	}

	function checkSource(node, source) {
		const name = getPackageNameFromSource(source);
		if (!name) return;
		const declaredType = getDeclaredType(name);
		if (!declaredType) return;
		if (fileIsDev) {
			if ((declaredType === 'dependencies' || declaredType === 'optionalDependencies') && runtimePackages.has(name)) {
				return;
			}
			if (declaredType === 'dependencies') {
				if (isConfigFile(filename)) return;
				context.report({ node, messageId: 'prodUsedInDev', data: { name, declaredType, filename } });
			}
			if (declaredType === 'optionalDependencies') {
				context.report({ node, messageId: 'optionalUsedInDev', data: { name, declaredType, filename } });
			}
			return;
		}
		// runtime source
		if (declaredType === 'devDependencies') {
			context.report({ node, messageId: 'devUsedInProd', data: { name, declaredType, filename } });
		}
	};

		return {
			ImportDeclaration(node) {
				checkSource(node.source, node.source.value);
			},
			ExportAllDeclaration(node) {
				if (node.source) checkSource(node.source, node.source.value);
			},
			ExportNamedDeclaration(node) {
				if (node.source) checkSource(node.source, node.source.value);
			},
			CallExpression(node) {
				if (node.callee.type === 'Identifier' && node.callee.name === 'require' && node.arguments.length === 1) {
					const arg = node.arguments[0];
					if (arg.type === 'Literal' && typeof arg.value === 'string') {
						checkSource(node, arg.value);
					}
				}
			},
			ImportExpression(node) {
				if (node.source.type === 'Literal' && typeof node.source.value === 'string') {
					checkSource(node, node.source.value);
				}
			},
		};
	},
};

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
					const sourceCode = context.sourceCode || context.getSourceCode?.();
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
		const filename = context.sourceCode?.filename || context.getFilename?.() || '';
		if (!filename.endsWith('layout.tsx')) return {};

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

/* ===== RULE: no-temp-dependency ===== */
const noTempDependencyRule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow temporary security dependencies listed in the rule options (lockfile-only check).',
			category: 'Security',
			recommended: true
		},
		fixable: false,
		messages: {
			tempDepPresent: 'Temporary dependency "{{name}}" detected at version {{version}} (vulnerable: {{range}}). Remove once upstream packages are fixed.'
		},
		schema: [{ type: 'array', items: { type: 'object' } }]
	},
	create(context) {
		let ran = false;

		function cmpParts(a, b) {
			const A = (a || '').split('.').map(n => parseInt(n,10) || 0);
			const B = (b || '').split('.').map(n => parseInt(n,10) || 0);
			for (let i=0;i<3;i++) {
				if ((A[i]||0) < (B[i]||0)) return -1;
				if ((A[i]||0) > (B[i]||0)) return 1;
			}
			return 0;
		}

		function normalizeVersion(v) {
			if (!v || typeof v !== 'string') return '';
			return v.trim().replace(/^[^0-9]*/, '').replace(/\s+.*$/, '');
		}

		function satisfiesRange(version, rangeSpec) {
			if (!rangeSpec || typeof rangeSpec !== 'string') return false;
			rangeSpec = rangeSpec.trim();
			const ver = normalizeVersion(version);
			// simple operators: <=, <, >=, >, =, exact
			if (rangeSpec.startsWith('<=')) {
				const v = rangeSpec.slice(2).trim();
				return cmpParts(ver,v) <= 0;
			}
			if (rangeSpec.startsWith('<')) {
				const v = rangeSpec.slice(1).trim();
				return cmpParts(ver,v) < 0;
			}
			if (rangeSpec.startsWith('>=')) {
				const v = rangeSpec.slice(2).trim();
				return cmpParts(ver,v) >= 0;
			}
			if (rangeSpec.startsWith('>')) {
				const v = rangeSpec.slice(1).trim();
				return cmpParts(ver,v) > 0;
			}
			if (rangeSpec.startsWith('^')) {
				const v = rangeSpec.slice(1).trim();
				const [maj, min] = v.split('.').map(n=>parseInt(n,10)||0);
				if (maj > 0) {
					return cmpParts(ver, v) >= 0 && cmpParts(ver, (maj+1)+'.0.0') < 0;
				}
				if (maj === 0 && min > 0) {
					return cmpParts(ver, v) >= 0 && cmpParts(ver, '0.'+(min+1)+'.0') < 0;
				}
				return cmpParts(ver, v) >= 0 && cmpParts(ver, '0.0.'+((parseInt(v.split('.')[2]||'0',10)||0)+1)) < 0;
			}
			if (rangeSpec.startsWith('~')) {
				const v = rangeSpec.slice(1).trim();
				const [maj, min] = v.split('.').map(n=>parseInt(n,10)||0);
				return cmpParts(ver, v) >= 0 && cmpParts(ver, maj + '.' + (min+1) + '.0') < 0;
			}
			// exact equality
			return cmpParts(ver, normalizeVersion(rangeSpec)) === 0 || rangeSpec === '=' + ver;
		}

		function overrideCoversTarget(overrides, targetName) {
			if (!overrides || typeof overrides !== 'object') return false;
			if (Object.prototype.hasOwnProperty.call(overrides, targetName)) return true;
			for (const [k,v] of Object.entries(overrides)) {
				if (k === targetName) return true;
				if (v && typeof v === 'object' && Object.prototype.hasOwnProperty.call(v, targetName)) return true;
			}
			return false;
		}

		function collectVersions(lock, pkgName) {
			const versions = [];
			try {
				// New lockfile format (package-lock v3) exposes package paths under lock.packages
				if (lock && lock.packages && typeof lock.packages === 'object') {
					for (const [pkgPath, pkgObj] of Object.entries(lock.packages)) {
						if (!pkgObj || !pkgObj.version) continue;
						if (!pkgPath || pkgPath === '') continue; // skip root
						if (!pkgPath.startsWith('node_modules/')) continue;
						// Handle nested package paths like 'node_modules/@aws-sdk/xml-builder/node_modules/fast-xml-parser'
						const segments = pkgPath.split('node_modules/').slice(1);
						for (const seg of segments) {
							let candidate;
							if (seg.startsWith('@')) {
								const p = seg.split('/'); candidate = p.slice(0,2).join('/');
							} else {
								candidate = seg.split('/')[0];
							}
							if (candidate === pkgName) {
								versions.push(pkgObj.version);
								break;
							}
						}
					}
				}

				// Also search nested dependency trees if present (older lockfile layout)
				function walk(deps) {
					if (!deps) return;
					for (const [k,v] of Object.entries(deps)) {
						if (k === pkgName) {
							if (v && typeof v === 'string') versions.push(v);
							else if (v && v.version) versions.push(v.version);
						}
						if (v && v.dependencies) walk(v.dependencies);
					}
				}
				if (lock && lock.dependencies) walk(lock.dependencies);
			} catch (e) {
				// defensive
			}
			return versions;
		}

		return {
			Program(node) {
				if (ran) return; ran = true;
				const projectRoot = process.cwd();
				const lockPath = path.join(projectRoot, 'package-lock.json');
				if (!fs.existsSync(lockPath)) return; // lockfile-only check
				let lock;
				try { lock = JSON.parse(fs.readFileSync(lockPath, 'utf8')); } catch (e) { return; }

				const rules = context.options[0] || [{ name: 'fast-xml-parser', vulnerableRange: '<=5.3.3', note: 'temporary security pin' }];
				for (const r of rules) {
					// Check all installed copies (including nested) for vulnerable versions
					const versions = collectVersions(lock, r.name);
					const vulnerable = versions.some(v => satisfiesRange(v, r.vulnerableRange));
					if (vulnerable) {
						context.report({ node, messageId: 'tempDepPresent', data: { name: r.name, version: versions[0], range: r.vulnerableRange } });
						continue;
					}

					// No vulnerable hits — do not report on overrides here; stale override checks are handled by `no-stale-override` rule.
					// This rule only reports actual vulnerable installed copies.
					// nothing to report here
				}
			}
		};
	}
};

/* ===== RULE: no-stale-override ===== */
const noStaleOverrideRule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Detect overrides that are now unnecessary because the target library already requires an equal-or-higher version.',
			category: 'Security',
			recommended: true
		},
		fixable: false,
		messages: {
			staleOverride: 'Override for "{{library}}" -> "{{dep}}" is stale: library declares "{{libConstraint}}" which satisfies or exceeds override "{{override}}". Remove the override.'
		},
		schema: [],
	},
	create(context) {
		let ran = false;

		function cmpParts(a, b) {
			const A = (a || '').split('.').map(n => parseInt(n,10) || 0);
			const B = (b || '').split('.').map(n => parseInt(n,10) || 0);
			for (let i=0;i<3;i++) {
				if ((A[i]||0) < (B[i]||0)) return -1;
				if ((A[i]||0) > (B[i]||0)) return 1;
			}
			return 0;
		}

		function normalizeVersion(v) {
			if (!v || typeof v !== 'string') return '';
			return v.trim().replace(/^[^0-9]*/, '').replace(/\s+.*$/, '');
		}

		function parseBaseVersion(range) {
			if (!range || typeof range !== 'string') return '';
			const s = range.trim();
			if (s.startsWith('^') || s.startsWith('~') || s.startsWith('>=') || s.startsWith('<=') || s.startsWith('>') || s.startsWith('<') || s.startsWith('=')) {
				return normalizeVersion(s.replace(/^[^0-9]*/, ''));
			}
			return normalizeVersion(s);
		}

		function findLibraryEntry(lock, library) {
			try {
				if (!lock || !lock.packages) return null;
				for (const [pkgPath, pkgObj] of Object.entries(lock.packages)) {
					if (!pkgPath || !pkgPath.startsWith('node_modules/')) continue;
					const after = pkgPath.split('node_modules/').pop();
					let candidate;
					if (after.startsWith('@')) {
						const p = after.split('/'); candidate = p.slice(0,2).join('/');
					} else {
						candidate = after.split('/')[0];
					}
					if (candidate === library) return pkgObj;
				}
			} catch (e) { /* defensive */ }
			return null;
		}

		return {
			Program(node) {
				if (ran) return; ran = true;
				const projectRoot = process.cwd();
				const lockPath = path.join(projectRoot, 'package-lock.json');
				const pkgPath = path.join(projectRoot, 'package.json');
				if (!fs.existsSync(lockPath) || !fs.existsSync(pkgPath)) return;
				let lock, pkg;
				try { lock = JSON.parse(fs.readFileSync(lockPath, 'utf8')); pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch (e) { return; }

				const overrides = pkg.overrides || pkg.resolutions || (pkg['pnpm'] && pkg['pnpm'].overrides) || {};
				for (const [k,v] of Object.entries(overrides)) {
					// only consider nested mapping overrides: library -> { dep: version }
					if (v && typeof v === 'object') {
						const library = k;
						for (const [dep, overrideSpec] of Object.entries(v)) {
							const libEntry = findLibraryEntry(lock, library);
							if (!libEntry) continue;
							const libDep = (libEntry.dependencies && libEntry.dependencies[dep]) || (libEntry.requires && libEntry.requires[dep]);
							if (!libDep) continue;
							const libBase = normalizeVersion(libDep);
							const overrideBase = parseBaseVersion(overrideSpec);
							if (libBase && overrideBase && cmpParts(libBase, overrideBase) >= 0) {
								context.report({ node, messageId: 'staleOverride', data: { library, dep, libConstraint: libDep, override: overrideSpec } });
							}
						}
					}
				}
			}
		};
	}
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
					const sourceCode = context.sourceCode || context.getSourceCode?.();
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
		const filename = context.sourceCode?.filename || context.getFilename?.() || '';
		if (!filename.endsWith('layout.tsx')) return {};

		const projectRoot = context.cwd;
		const requiredFiles = [
			{ name: 'sitemap', pattern: /sitemap\.(ts|js|xml|tsx)$/ },
			{ name: 'manifest', pattern: /manifest\.(json|ts|tsx)$/ },
			{ name: 'not-found', pattern: /not-found\.tsx$/ },
			{ name: 'robots', pattern: /robots\.(ts|tsx)$/ },
			{ name: 'proxy.ts', pattern: /^proxy\.ts$/ },
			/* { name: 'amplify.yml', pattern: /^amplify\.yml$/ }, */
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
		const filename = context.sourceCode?.filename;
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
				const sourceCode = context.sourceCode || context.getSourceCode?.();
				const source = sourceCode?.text || '';
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
		const filename = context.sourceCode?.filename || '';
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
		const filename = context.sourceCode?.filename || context.getFilename?.() || '';
		if (!filename.endsWith('layout.tsx')) return {};

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
						const filename = context.sourceCode?.filename;
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
		const filename = context.sourceCode?.filename;
		return {
			Program() {
				try {
					const sourceCode = context.sourceCode || context.getSourceCode?.();
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

/**
 * no-hardcoded-config-keys Rule
 * 
 * Prevents hardcoding of Pixelated-specific configuration keys that should come from:
 * - Config provider (usePixelatedConfig)
 * - Environment variables
 * - Function parameters/props
 * 
 * Only flags keys that are Pixelated-specific to avoid false positives.
 * Severity: ERROR for secrets, WARNING for other Pixelated config keys.
 */
const noHardcodedConfigKeysRule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Prevent hardcoded Pixelated configuration keys that should come from config provider',
			category: 'Security',
			recommended: true,
		},
		fixable: false,
		schema: [],
		messages: {
			secretConfigKey: 'Hardcoded SECRET configuration key "{{keyName}}" ({{serviceName}}) detected. Must use config provider (usePixelatedConfig) or environment variables.',
			publicConfigKey: 'Hardcoded Pixelated config key "{{keyName}}" ({{serviceName}}) detected. Should use config provider (usePixelatedConfig) or pass as parameter instead.',
		},
	},
	create(context) {
		// Pixelated-SPECIFIC configuration keys (keys that are unlikely to be false positives)
		// Keys that are unique/distinctive to Pixelated integrations, excluding generic names
		const pixelatedConfigKeys = {
			// Contentful (very Pixelated-specific)
			contentful: ['space_id', 'delivery_access_token', 'management_access_token', 'preview_access_token', 'proxyURL', 'base_url', 'environment'],
			// eBay (very distinctive)
			ebay: ['appId', 'appDevId', 'appCertId', 'sbxAppId', 'sbxAppDevId', 'sbxAppCertId', 'globalId', 'baseTokenURL', 'baseSearchURL', 'baseAnalyticsURL', 'qsSearchURL', 'baseItemURL', 'qsItemURL'],
			// AWS (distinctive with service prefix or secretive names)
			aws: ['access_key_id', 'secret_access_key', 'session_token'],
			// Cloudinary
			cloudinary: ['product_env', 'api_key', 'api_secret'],
			// Flickr
			flickr: ['user_id'],
			// GitHub
			github: ['token', 'apiBaseUrl', 'defaultOwner'],
			// Google services
			google: ['client_id', 'client_secret', 'api_key', 'refresh_token'],
			// Google Analytics
			googleAnalytics: [],  // Skip 'id' and 'adId' as too generic
			// Google Maps
			googleMaps: ['apiKey'],
			// HubSpot (keep only distinctive ones)
			hubspot: ['portalId', 'formId', 'trackingCode'],
			// Instagram
			instagram: ['accessToken', 'userId'],
			// NextAuth
			nextAuth: ['secret'],
			// PayPal
			paypal: ['sandboxPayPalApiKey', 'sandboxPayPalSecret', 'payPalApiKey', 'payPalSecret'],
			// WordPress
			wordpress: ['baseURL', 'site'],
			// Puppeteer
			puppeteer: ['executable_path', 'cache_dir'],
			// Global
			global: ['PIXELATED_CONFIG_KEY']
		};

		// Secret keys that should NEVER be hardcoded (ERROR severity)
		const secretKeys = new Set([
			// AWS
			'access_key_id', 'secret_access_key', 'session_token',
			// Cloudinary
			'api_key', 'api_secret',
			// Contentful
			'management_access_token', 'preview_access_token',
			// eBay
			'sbxAppId',
			// GitHub
			'token',
			// Instagram
			'accessToken',
			// PayPal
			'sandboxPayPalApiKey', 'sandboxPayPalSecret', 'payPalApiKey', 'payPalSecret',
			// NextAuth
			'secret',
			// Global
			'PIXELATED_CONFIG_KEY'
		]);

		// Build set of all known Pixelated config keys
		const allConfigKeys = new Set();
		Object.values(pixelatedConfigKeys).forEach(keys => {
			keys.forEach(key => allConfigKeys.add(key));
		});

		function findServiceForKey(keyName) {
			for (const [serviceName, keys] of Object.entries(pixelatedConfigKeys)) {
				if (keys.includes(keyName)) {
					return serviceName;
				}
			}
			return 'unknown';
		}

		function isConfigKey(keyName) {
			return allConfigKeys.has(keyName);
		}

		function isSecretKey(keyName) {
			return secretKeys.has(keyName);
		}

		return {
			ObjectExpression(node) {
				node.properties.forEach(prop => {
					// Check properties that look like { space_id: "value" } or { api_key: "..." }
					if (prop.type === 'Property' && prop.key) {
						const keyName = prop.key.name || prop.key.value;
						
						// Check if this is a known Pixelated config key
						if (isConfigKey(keyName)) {
							// Check if value is a string literal (hardcoded)
							if (prop.value.type === 'Literal' && typeof prop.value.value === 'string') {
								const stringValue = prop.value.value;
								if (stringValue && stringValue.length > 0) {
									const serviceName = findServiceForKey(keyName);
									const messageId = isSecretKey(keyName) ? 'secretConfigKey' : 'publicConfigKey';
									
									context.report({
										node: prop,
										messageId,
										data: { keyName, serviceName },
									});
								}
							}
						}
					}
				});
			}
		};
	}
};

/* ===== RULE: no-direct-fetch ===== */
const noDirectFetchRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Warn when fetch() is used directly instead of smartFetch. smartFetch provides caching, retries, error handling, and timeout support.',
			category: 'Best Practices',
			recommended: true,
		},
		fixable: false,
		schema: [],
		messages: {
			useSmartFetch: 'Use smartFetch instead of direct fetch(). smartFetch provides caching, retries, proper error handling, timeouts, and proxy fallback. See components/general/smartfetch.ts for details.',
		},
	},
	create(context) {
		const filename = context.sourceCode?.filename || '';
		
		// Skip ESLint config files, tests, node_modules, build scripts, old files, and smartfetch itself
		if (
			filename.includes('node_modules') ||
			filename.includes('eslint.config') ||
			filename.includes('.old.') ||
			filename.endsWith('.old.js') ||
			filename.endsWith('.old.ts') ||
			filename.includes('/scripts/') ||
			filename.includes('/build/') ||
			filename.endsWith('/smartfetch.ts')
		) {
			return {};
		}

		return {
			CallExpression(node) {
				// Check if this is a direct fetch() call
				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'fetch'
				) {
					context.report({
						node,
						messageId: 'useSmartFetch',
					});
				}
			},
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
		'no-temp-dependency': noTempDependencyRule,
		'no-stale-override': noStaleOverrideRule,
		'file-name-kebab-case': fileNameKebabCaseRule,
		'no-duplicate-export-names': noDuplicateExportNamesRule,
		'class-name-kebab-case': classNameKebabCaseRule,
		'no-hardcoded-config-keys': noHardcodedConfigKeysRule,
		'package-json-missing-dependency': packageJsonMissingDependencyRule,
		'package-json-wrong-dependency-type': packageJsonWrongDependencyTypeRule,
		'package-json-no-unused-dependency': packageJsonNoUnusedDependencyRule,
		'no-direct-fetch': noDirectFetchRule,
	},
	configs: {
		recommended: {
			rules: {
				'pixelated/prop-types-inferprops': 'error',
				'pixelated/required-schemas': 'warn',
				'pixelated/no-temp-dependency': 'error',
				'pixelated/no-stale-override': 'error',
				'pixelated/required-files': 'warn',
				'pixelated/no-raw-img': 'warn',
				'pixelated/require-section-ids': 'error',
				'pixelated/required-faq': 'warn',
				'pixelated/validate-test-locations': 'error',
				'pixelated/no-process-env': ['error', { allowed: ALLOWED_ENV_VARS } ],
				'pixelated/no-debug-true': 'warn',
				'pixelated/file-name-kebab-case': 'off',
				'pixelated/required-proptypes-jsdoc': 'error',
				'pixelated/no-duplicate-export-names': 'error',
				'pixelated/class-name-kebab-case': 'error',
				'pixelated/no-hardcoded-config-keys': 'error',
				'pixelated/package-json-missing-dependency': 'error',
			'pixelated/package-json-wrong-dependency-type': 'warn',
			'pixelated/package-json-no-unused-dependency': 'warn',
			'pixelated/no-direct-fetch': 'error',
			},
		},
	},
};

