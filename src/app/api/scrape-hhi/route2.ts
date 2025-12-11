import axios from 'axios';
import puppeteer from 'puppeteer';

import { NextRequest, NextResponse } from 'next/server';

interface Lead {
  name: string;
  address?: string;
  phone: string | null;
  website: string | null;
}

async function requestHandler(req: NextRequest): Promise<NextResponse> {
	const url = 'https://www.hiltonheadchamber.org/membership/member-directory/';
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	const businesses = [];
	let pagenumber = 1;
	try {
		await page.goto(url, { waitUntil: 'networkidle2' });
		let isNext = true;
		while (isNext) {
			// await page.waitForSelector('c-members__search-load-more');
			const nextButton = await page.$('c-members__search-load-more');
			const nextButtonInactive = await page.$('.c-members__search-load-more.in-active');
			if (nextButton && !nextButtonInactive) {
				await Promise.all([
					nextButton.click(),
					page.waitForNavigation({ waitUntil: 'networkidle2' })
				]);
				pagenumber++;
				console.log(pagenumber);
			} else {
				isNext = false;
			}



			const pageData = await page.$$eval('c-card__member', members =>
				members.map(member => {
					const name = member.querySelector('.c-card__member-title a')?.textContent?.trim() || null;
					// const address = $(el).find('.mn-directory-listing__address').text().trim().replace(/\s+/g, ' ');
					const phone = member.querySelector('.c-card__member-links a.phone-link')?.getAttribute('href') || null;
					const website = member.querySelector('.c-card__member-links a.website-link')?.getAttribute('href') || null;
					const thisMember = { name, phone, website };
					console.log(thisMember);
					return thisMember;
				})
			);
			businesses.push(...pageData); 

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
