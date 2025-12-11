import axios from 'axios';
import * as cheerio from 'cheerio';

import { NextRequest, NextResponse } from 'next/server';

interface Lead {
  name: string;
  address?: string;
  phone: string | null;
  website: string | null;
}

async function requestHandler(req: NextRequest): Promise<NextResponse> {
	try {
		const url = 'https://www.hiltonheadchamber.org/membership/member-directory/';
		const { data } = await axios.get(url);

		const $ = cheerio.load(data);
		const results: Lead[] = [];

		$('.c-card__member').each((i, el) => {
			const name = $(el).find('.c-card__member-title a').text().trim();
			// const address = $(el).find('.mn-directory-listing__address').text().trim().replace(/\s+/g, ' ');
			const phone = $(el).find('.c-card__member-links a.phone-link').attr('href') || null;
			const website = $(el).find('.c-card__member-links a.website-link').attr('href') || null;
			results.push({
				name,
				phone,
				website,
			});
		});

		// res.status(200).json({ businesses: results });
		return NextResponse.json({ leads: results });
	} catch (error) {
		console.error('Scraping error:', error);
		// res.status(500).json({ error: 'Failed to scrape data.' });
		return NextResponse.json({ error: 'Failed to scrape data.' });
	}
}

export { requestHandler as GET };


/* 
export default async function GET(request) {
  try {
    const url = 'https://chamber.hiltonheadisland.org/list/';
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);
    const results = [];

    $('.mn-directory-listing').each((i, el) => {
      const name = $(el).find('.mn-directory-listing__title a').text().trim();

      const address = $(el).find('.mn-directory-listing__address').text().trim().replace(/\s+/g, ' ');
      const phone = $(el).find('.mn-directory-listing__phone').text().trim();
      const website = $(el).find('.mn-directory-listing__website a').attr('href') || null;

      results.push({
        name,
        address,
        phone,
        website,
      });
    });

    // res.status(200).json({ businesses: results });
    return NextResponse.json({ businesses: results });
  } catch (error) {
    console.error('Scraping error:', error);
    // res.status(500).json({ error: 'Failed to scrape data.' });
    return NextResponse.json({ error: 'Failed to scrape data.' });
  }
}
  */
 