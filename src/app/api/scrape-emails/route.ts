import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function requestHandler(req: NextRequest): Promise<NextResponse | undefined> {
	const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
	const perPage = parseInt(req.nextUrl.searchParams.get('perPage') || '100');

	const filePath = path.join(process.cwd(), 'public', 'companies-hhi.txt'); // Adjust path as needed
	const companies = fs.readFileSync(filePath, 'utf8').split('\n').map((name: string) => name.trim());
	const results = [];
	const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
	const puppetPage = await browser.newPage();

	try {
		for (let i = (((page - 1) * perPage)); i < (page * perPage); i++ ) {
			if (i >= companies.length) break;
			const company = companies[i];
			console.log(`Searching for emails for #${i}: ${company}`);
			const query = company + " contact email address";
			const url = "https://www.google.com/search?udm=50" ;
			await puppetPage.goto(url, { waitUntil: 'networkidle2' });
			// await puppetPage.keyboard.press('Tab');  
			await puppetPage.keyboard.type(query);
			await puppetPage.keyboard.press('Enter');
			// await new Promise(resolve => setTimeout(resolve, 3000));
			const myId = 'mtid'; // Define myId with an appropriate value
			try {
				await puppetPage.waitForFunction( (id) => {
					const url = new URL(window.location.href);
					return url.searchParams.get(id) !== null;
				}, {}, myId );
			} catch (e) {
				console.log(`Timeout waiting for search results for ${company}`);
			}
			await puppetPage.waitForSelector('[data-container-id="main-col"]');
			const emailsHTML = await puppetPage.$eval('[data-container-id="main-col"]', (element) => element.innerHTML);
			const emailData = [ ...new Set(
				(emailsHTML.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])
				.map(e => {
					const decoded = decodeURIComponent(e);
					const trimmed = decoded.trim();
					const lower = trimmed.toLowerCase();
					const validated = lower.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)?.toString();
					return validated;
				})
			)].sort();
			for (const email of emailData) {
				results.push({
					company: company,
					email: email
				});
			}
		}
		await puppetPage.close();
		return NextResponse.json({ results: results }, { status: 200 });
		// return NextResponse.json({ companies });
	} catch (err) {
		await puppetPage.close();
		console.error(err);
		return NextResponse.json({ error: 'Scraping failed' }, { status: 500 });
	} finally {
		await browser.close();
	}
}

export { requestHandler as GET };
