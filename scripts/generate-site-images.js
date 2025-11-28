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
fs.writeFileSync(outFile, JSON.stringify(files, null, 2), 'utf8');
console.log('Wrote', outFile, 'with', files.length, 'images');
