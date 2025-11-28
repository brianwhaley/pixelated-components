import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function requestHandler(req: NextRequest): Promise<NextResponse | undefined> {
	// let page = parseInt(req.nextUrl.searchParams.get('page') || '1');
	let page = 1;
	const perPage = parseInt(req.nextUrl.searchParams.get('perPage') || '100');
	const fileName = 'companies-nj-denville.txt';
	const addl_query = "denville new jersey contact email address";

	const filePath = path.join(process.cwd(), 'public', fileName);
	const companies = fs.readFileSync(filePath, 'utf8').split('\n').map((name: string) => name.trim());
	const companyPages = Math.ceil(companies.length / perPage);
	console.log(`Total companies: ${companies.length}, Total pages: ${companyPages}`);
	const results = [];

	try {
		for (let i = 1; i <= companyPages; i++ ) {
			const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
			// await new Promise(r => setTimeout(r, 10000));
			for (let k = (((page - 1) * perPage)); k < (page * perPage); k++ ) {
				if (k >= companies.length) break;
				const puppetPage = await browser.newPage();
				await puppetPage.setDefaultNavigationTimeout(0);
				await puppetPage.setDefaultTimeout(0);

				// await puppetPage.setDefaultNavigationTimeout(60000); // Set timeout to 60 seconds
				// await puppetPage.setDefaultTimeout(60000); // Set default timeout to 60 seconds

				const company = companies[k];
				console.log(`Searching for emails for #${k}: ${company}`);
				const query = company + ' ' + addl_query;
				const url = "https://www.google.com/search?udm=50";
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
				} catch (error) {
					console.log(`Timeout waiting for search results for ${company}:`, error);
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
				await puppetPage.close();
			}
			await browser.close();
			page++;
		}
		return NextResponse.json({ results: results }, { status: 200 });
		// return NextResponse.json({ companies });
	} catch (err) {
		// await puppetPage.close();
		console.error(err);
		return NextResponse.json({ error: 'Scraping failed' }, { status: 500 });
	} finally {
		// await browser.close();
	}
}

export { requestHandler as GET };
