
/* 
// const path = require('path');
// const fs = require('fs');
import path from "path";
import fs from "fs";

function generateIndexExports(componentDirPath: string) {
	const exportStatements = [];
	const files = fs.readdirSync(componentDirPath);
	for (const file of files) {
		const filePath = path.join(componentDirPath, file);
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			generateIndexExports(filePath);
		} else if (['.js', '.jsx', '.ts', '.tsx' ].some(extension => file.endsWith(extension))) {
			const componentPath = filePath.replace("src/app", ".");
			exportStatements.push(`export * from '${componentPath}';`);
		}
	}
	return exportStatements.join('\n');
}

// Example usage:
const rootPath = './src/app';
const generatedExports = generateIndexExports(rootPath);
console.log("output:", generatedExports);

*/







/* 
// const path = require('path');
// const fs = require('fs');
import path from "path";
// import fs from "fs";
import { promises as fs } from 'fs';

async function findCodeFiles(dirPath: string) {
	let codeFiles: string[] = [];
	const entries = await fs.readdir(dirPath, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);
		if (entry.isDirectory()) {
			codeFiles = codeFiles.concat(await findCodeFiles(fullPath));
		} else if (entry.isFile()) {
			const ext = path.extname(entry.name);
			if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
				// console.log(fullPath);
				const componentPath = fullPath.replace("src/app", ".");
			    codeFiles.push(`export * from '${componentPath}';`);
				// codeFiles.push(fullPath);
			}
		}
	}
	return codeFiles;
}

// Example usage:
(async () => {
	try {
		const files = await findCodeFiles('./src/app');
		console.log(files);
	} catch (error) {
		console.error('Error:', error);
	}
})();

export default function Exporting() {
	return (findCodeFiles);
}

*/







// index.js in your component library's root (or components directory)
import fs from 'fs';
import path from 'path';
const componentsDir = path.resolve(__dirname, './src/app'); // Adjust path as needed
// Dynamically import and export all components
const exportComponents = async () => {
	const componentFiles = fs.readdirSync(componentsDir).filter(file => {
		// Filter for common component file extensions (e.g., .js, .jsx, .ts, .tsx)
		return /\.(js|jsx|ts|tsx)$/.test(file) && !file.includes('index.'); // Exclude index.js itself
	});
	for (const file of componentFiles) {
		const componentName = path.parse(file).name; // Get component name without extension
		const componentPath = path.join(componentsDir, file);
		// Dynamic import and re-export
		try {
			// eslint-disable-next-line @next/next/no-assign-module-variable
			const module = await import(componentPath);
			// If using default exports:
			if (module.default) {
				module.exports[componentName] = module.default; // Export as named export
			} else {
				// If using named exports within the component file:
				Object.assign(module.exports, module);
			}
		} catch (error) {
			console.error(`Error importing component ${componentName}:`, error);
		}
	}
};

exportComponents();

export default function Exporting() {
	return (exportComponents());
}