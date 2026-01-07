import fs from 'fs';
import glob from 'glob';
import { CLIENT_ONLY_PATTERNS, TS_FILE_IGNORE_PATTERNS, TSX_FILE_IGNORE_PATTERNS, SERVER_ONLY_PATTERNS } from '../components/utilities/functions.ts';

console.log('🔍 Validating exports...\n');

// Find all .ts files (excluding .d.ts, test files, stories, examples, types.ts)
const tsFiles = glob.sync('src/components/**/*.ts', {
	ignore: TS_FILE_IGNORE_PATTERNS
});

// Find all .tsx files (excluding test files, stories, examples)
const tsxFiles = glob.sync('src/components/**/*.tsx', {
	ignore: TSX_FILE_IGNORE_PATTERNS
});

// Combine all component files
const allComponentFiles = [...tsFiles, ...tsxFiles];

// Analyze each component file to determine if it's client-required or server-safe
function analyzeComponentFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');

	// Server-only patterns that indicate this should only be on server (not client)
	// (Imported from shared utilities)

	// Client-only patterns that require the component to run on client
	// (Imported from shared utilities)

	// Check if file contains any server-only patterns
	const isServerOnly = SERVER_ONLY_PATTERNS.some(pattern => pattern.test(content));

	// Check if file contains any client-only patterns
	const isClientOnly = CLIENT_ONLY_PATTERNS.some(pattern => pattern.test(content));

	return {
		filePath,
		isClientOnly,
		isServerOnly,
		exportPath: filePath.replace('src/', './').replace(/\.tsx?$/, '')
	};
}

// Analyze all component files
const analyzedComponents = allComponentFiles.map(analyzeComponentFile);

// Special handling for utilities/functions.ts - it's safe for both client and server despite containing pattern definitions
analyzedComponents.forEach(comp => {
	if (comp.exportPath === './components/utilities/functions') {
		comp.isClientOnly = false;
		comp.isServerOnly = false;
	}
});

// Separate admin and non-admin components
const adminComponents = analyzedComponents.filter(comp => comp.exportPath.startsWith('./components/admin/'));
const nonAdminComponents = analyzedComponents.filter(comp => !comp.exportPath.startsWith('./components/admin/'));

// Create arrays of components for each bundle (non-admin only)
// If a component has server-only patterns, it's server-only; if client-only and not server-only, client-only; else safe
const serverOnlyComponents = nonAdminComponents.filter(comp => comp.isServerOnly);
const clientOnlyComponents = nonAdminComponents.filter(comp => comp.isClientOnly && !comp.isServerOnly);
const clientAndServerSafeComponents = nonAdminComponents.filter(comp => !comp.isClientOnly && !comp.isServerOnly);

// Read index files
const indexServer = fs.readFileSync('src/index.server.js', 'utf8');
const indexClient = fs.readFileSync('src/index.js', 'utf8');
const indexAdminServer = fs.readFileSync('src/index.adminserver.js', 'utf8');
const indexAdminClient = fs.readFileSync('src/index.adminclient.js', 'utf8');

// Helper function to extract exports from index file
function extractExports(content) {
	// Remove comments
	content = content.replace(/\/\*[\s\S]*?\*\//g, '');
	content = content.replace(/\/\/.*$/gm, '');

	const exports = [];

	// Handle export * from './path' syntax
	const exportAllRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
	let match;

	while ((match = exportAllRegex.exec(content)) !== null) {
		exports.push(match[1]);
	}

	// Handle export { ... } from './path' syntax
	const exportRegex = /export\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g;
	while ((match = exportRegex.exec(content)) !== null) {
		const exportList = match[1];
		const exportItems = exportList.split(',').map(item => item.trim());
		exports.push(...exportItems.map(item => match[2])); // Use the from path
	}

	return exports;
}

// Extract exports from all index files
const serverExports = extractExports(indexServer);
const clientExports = extractExports(indexClient);
const adminServerExports = extractExports(indexAdminServer);
const adminClientExports = extractExports(indexAdminClient);

const missing = {
	server: [],
	client: [],
	adminServer: [],
	adminClient: [],
	files: [] // New: exported paths that don't correspond to existing files
};

const bundleErrors = {
	server: [], // Client-only components incorrectly in server bundle
	client: [], // Server-only components incorrectly in client bundle
	adminServer: [], // Client-only components incorrectly in admin server bundle
	adminClient: [] // Server-only components incorrectly in admin client bundle
};

// Check if exported paths correspond to existing files
function checkExportPathsExist(exports, bundleName) {
	exports.forEach(exportPath => {
		// Convert export path to file path (./components/... -> src/components/...)
		const filePathBase = exportPath.replace('./', 'src/');
		const tsFile = `${filePathBase}.ts`;
		const tsxFile = `${filePathBase}.tsx`;
    
		const tsExists = fs.existsSync(tsFile);
		const tsxExists = fs.existsSync(tsxFile);
    
		if (!tsExists && !tsxExists) {
			missing.files.push(`${bundleName}: ${exportPath} (.ts/.tsx files not found)`);
		}
	});
}

checkExportPathsExist(serverExports, 'server bundle');
checkExportPathsExist(clientExports, 'client bundle');
checkExportPathsExist(adminServerExports, 'admin server bundle');
checkExportPathsExist(adminClientExports, 'admin client bundle');

// Check for missing exports
clientAndServerSafeComponents.forEach(comp => {
	if (!serverExports.includes(comp.exportPath)) {
		missing.server.push(comp.exportPath);
	}
});

serverOnlyComponents.forEach(comp => {
	if (!serverExports.includes(comp.exportPath)) {
		missing.server.push(comp.exportPath);
	}
});

clientOnlyComponents.forEach(comp => {
	if (!clientExports.includes(comp.exportPath)) {
		missing.client.push(comp.exportPath);
	}
});

clientAndServerSafeComponents.forEach(comp => {
	if (!clientExports.includes(comp.exportPath)) {
		missing.client.push(comp.exportPath);
	}
});

// Check admin components - separate server and client bundles
const serverRelevantAdmin = adminComponents.filter(comp => comp.isServerOnly || !comp.isClientOnly);
const clientRelevantAdmin = adminComponents.filter(comp => comp.isClientOnly || !comp.isServerOnly);

serverRelevantAdmin.forEach(comp => {
	if (!adminServerExports.includes(comp.exportPath)) {
		missing.adminServer.push(comp.exportPath);
	}
	if (serverExports.includes(comp.exportPath) && !comp.isServerOnly) {
		bundleErrors.server.push(comp.exportPath + ' (admin component in server bundle)');
	}
	if (clientExports.includes(comp.exportPath) && !comp.isServerOnly) {
		bundleErrors.client.push(comp.exportPath + ' (admin component in client bundle)');
	}
});

clientRelevantAdmin.forEach(comp => {
	if (!adminClientExports.includes(comp.exportPath)) {
		missing.adminClient.push(comp.exportPath);
	}
	if (serverExports.includes(comp.exportPath) && comp.isClientOnly) {
		bundleErrors.server.push(comp.exportPath + ' (client-only admin component in server bundle)');
	}
	// Allow client-only components in adminserver if they are also server-only (both)
	if (adminServerExports.includes(comp.exportPath) && comp.isClientOnly && !comp.isServerOnly) {
		bundleErrors.adminServer.push(comp.exportPath + ' (client-only admin component in admin server bundle)');
	}
});

// Check for bundle contamination errors
clientOnlyComponents.forEach(comp => {
	if (serverExports.includes(comp.exportPath)) {
		bundleErrors.server.push(comp.exportPath);
	}
});

serverOnlyComponents.forEach(comp => {
	if (clientExports.includes(comp.exportPath)) {
		bundleErrors.client.push(comp.exportPath + ' (server-only component in client bundle)');
	}
});

// Report results
console.log('📊 Analysis Results:');
console.log(`   Found ${allComponentFiles.length} component files`);
console.log(`   ${clientOnlyComponents.length} client-only components`);
console.log(`   ${clientAndServerSafeComponents.length} client-and-server-safe components`);
console.log(`   ${serverOnlyComponents.length} server-only components`);
console.log(`   ${adminComponents.length} admin components`);
if (missing.server.length > 0) {
	console.log('❌ Missing from server bundle (index.server.js):');
	missing.server.forEach(path => console.log(`   - ${path}`));
	console.log('');
}

if (missing.client.length > 0) {
	console.log('❌ Missing from client bundle (index.js):');
	missing.client.forEach(path => console.log(`   - ${path}`));
	console.log('');
}

if (missing.adminServer.length > 0) {
	console.log('❌ Missing from admin server bundle (index.adminserver.js):');
	missing.adminServer.forEach(path => console.log(`   - ${path}`));
	console.log('');
}

if (missing.adminClient.length > 0) {
	console.log('❌ Missing from admin client bundle (index.adminclient.js):');
	missing.adminClient.forEach(path => console.log(`   - ${path}`));
	console.log('');
}

if (bundleErrors.server.length > 0) {
	console.log('🚨 Bundle contamination errors:');
	console.log('   Client-required components incorrectly exported from server bundle:');
	bundleErrors.server.forEach(path => console.log(`   - ${path}`));
	console.log('');
}

if (bundleErrors.client.length > 0) {
	console.log('🚨 Bundle contamination errors:');
	console.log('   Server-required components incorrectly exported from client bundle:');
	bundleErrors.client.forEach(path => console.log(`   - ${path}`));
	console.log('');
}

if (bundleErrors.adminServer.length > 0) {
	console.log('🚨 Bundle contamination errors:');
	console.log('   Client-required components incorrectly exported from admin server bundle:');
	bundleErrors.adminServer.forEach(path => console.log(`   - ${path}`));
	console.log('');
}

if (bundleErrors.adminClient.length > 0) {
	console.log('🚨 Bundle contamination errors:');
	console.log('   Server-only components incorrectly exported from admin client bundle:');
	bundleErrors.adminClient.forEach(path => console.log(`   - ${path}`));
	console.log('');
}

if (missing.files.length > 0) {
	console.log('❌ Exported paths that don\'t exist:');
	missing.files.forEach(path => console.log(`   - ${path}`));
	console.log('');
}

const hasErrors = missing.server.length > 0 || missing.client.length > 0 || missing.adminServer.length > 0 || missing.adminClient.length > 0 || bundleErrors.server.length > 0 || bundleErrors.client.length > 0 || bundleErrors.adminServer.length > 0 || bundleErrors.adminClient.length > 0 || missing.files.length > 0;

if (hasErrors) {
	console.log('❌ Validation failed!');
	process.exit(1);
} else {
	console.log('✅ All exports validated successfully!');
}
