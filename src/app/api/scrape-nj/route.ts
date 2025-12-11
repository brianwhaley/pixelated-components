import puppeteer from 'puppeteer';
import { NextRequest, NextResponse } from 'next/server';

interface Lead {
  category?: string;
  companyname: string;
  membername?: string;
  address?: string;
  streetaddress?: string;
  locality?: string;
  region?: string;
  postalcode?: string;  
  phone: string | null;
  website: string | null;
}

async function requestHandler(req: NextRequest): Promise<NextResponse> {
	const url = 'https://njccdirectory.com/index.php';
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	const businesses = [];
	try {
		await page.goto(url, { waitUntil: 'networkidle2' });
		const isNext = true;
		await page.waitForSelector('#index');
		const categories = await page.$$('#index a');
		const categoryMaps = await page.evaluate(() => {
			const anchors = document.querySelectorAll('#index a');
			return Array.from(anchors).map((anchor: Element) => {
				const href = (anchor as HTMLAnchorElement).getAttribute('href');
				const cat = anchor.textContent?.trim();
				return { href, cat };
			});
		});
		for (const { href, cat } of categoryMaps) {
			await page.goto("https://njccdirectory.com/index.php" + href + "/all", { waitUntil: 'networkidle2' });
			// tabbertab even gets the tabs that are hidden with style tabbertabhide
			// const pages = await page.$$('.pagination a');
			const pageAnchors = await page.$$('.pagination a');
			const pages = [];
			pages.push(page.url());
			for (const anchor of pageAnchors) {
				const href = await page.evaluate(el => el.getAttribute('href'), anchor);
				pages.push(href);
			}
			for  (let i = 0; i < pages.length; i++) {
				if (pages[i] === page.url()) {
					// do nothing - use the page that has been fetched
				} else {
					// fetch the new page
					await page.goto("https://njccdirectory.com/index.php" + pages[i], { waitUntil: 'networkidle2' });
				}
				// loop through members
				// const members = await page.$$('.lsrow');
				const pageData = await page.$$eval('.lsrow', members =>
					members.map(member => {
						const category = new URL(window.location.href).pathname.split('/')[3].replace(/-/g, ' ');
						const companyname = member.querySelector('.header a')?.textContent?.trim();
						// const membername = member.querySelector('.ListingResults_Level5_MAINCONTACT a')?.textContent?.trim();
						// const streetaddress = member.querySelector('[itemprop="street-address"]')?.textContent?.trim();
						// const locality = member.querySelector('[itemprop="locality"]')?.textContent?.trim();
						// const region = member.querySelector('[itemprop="region"]')?.textContent?.trim();
						// const postalcode = member.querySelector('[itemprop="postal-code"]')?.textContent?.trim();
						const address = member.querySelector('.address')?.textContent?.trim();
						const phone = member.querySelector('.mfieldtype_coretelephone .output')?.textContent?.trim();
						const website = ("https://njccdirectory.com" + member.querySelector('.website a')?.getAttribute('href') || null);
						const newmember = { category, companyname, address, phone, website };
						return newmember;
					})
				);
				businesses.push(...pageData);
			}
		}
		await browser.close();
		return NextResponse.json({ businesses });
	} catch (err) {
		console.error(err);
		await browser.close();
		return NextResponse.json({ error: 'Scraping failed' });
	}
}

export { requestHandler as GET };
