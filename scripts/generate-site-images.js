/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const outFile = path.join(publicDir, 'site-images.json');

function listFiles(dir, exts = ['.jpg','.jpeg','.png','.webp','.avif','.gif']) {
	const out = [];
	if (!fs.existsSync(dir)) return out;
	const items = fs.readdirSync(dir, { withFileTypes: true });
	for (const it of items) {
		const full = path.join(dir, it.name);
		if (it.isDirectory()) out.push(...listFiles(full, exts));
		else if (exts.includes(path.extname(it.name).toLowerCase())) {
			out.push(path.relative(publicDir, full).replace(/\\\\/g, '/'));
		}
	}
	return out;
}

const files = listFiles(publicDir);
const manifest = {
	metadata: {
		generatedAt: new Date().toISOString(),
		imageCount: files.length,
	},
	images: files,
};
fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2), 'utf8');
console.log('Wrote', outFile, 'with', files.length, 'images and metadata');
