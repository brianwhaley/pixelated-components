import puppeteer from 'puppeteer';
import { NextRequest, NextResponse } from 'next/server';
const fs = (await import('fs')).promises;

async function requestHandler(req: NextRequest): Promise<NextResponse> {
// async function scrapeEmails() {
    const companies = (await fs.readFile('companies.txt', 'utf8')).split('\n').map((name: string) => name.trim());
    const results = [];
    const browser = await puppeteer.launch({ headless: true });

    for (const company of companies) {
        const page = await browser.newPage();
        console.log(`Searching for emails for: ${company}`);

        try {
            const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(company + ' contact email')}`;
            await page.goto(googleSearchUrl, { waitUntil: 'networkidle2' });

            const websiteUrl = await page.evaluate(() => {
                const link = document.querySelector('div.rc a') as HTMLAnchorElement;
                return link ? link.href : null;
            });

            if (websiteUrl) {
                console.log(`Found website: ${websiteUrl}. Scraping for emails...`);
                
                // Scrape the main page
                const mainPageEmails = await scrapePageForEmails(page, websiteUrl);
                
                // Scrape potential contact pages
                let contactPageEmails: string[] = [];
                for (const path of ['/contact', '/about-us', '/contact-us']) {
                    const contactUrl = new URL(path, websiteUrl).href;
                    contactPageEmails = await scrapePageForEmails(page, contactUrl);
                    if (contactPageEmails.length > 0) {
                        break;
                    }
                }

                const allEmails = [...new Set([...mainPageEmails, ...contactPageEmails])];

                results.push({
                    company,
                    website: websiteUrl,
                    emails: allEmails.length > 0 ? allEmails : 'Not found'
                });
            } else {
                results.push({
                    company,
                    website: 'Not found',
                    emails: 'Not found'
                });
            }

        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error scraping ${company}: ${error.message}`);
            } else {
                console.error(`Error scraping ${company}: ${String(error)}`);
            }
            results.push({ company, emails: 'Error' });
        } finally {
            await page.close();
        }
    }

    await browser.close();
    console.log(JSON.stringify(results, null, 2));
    await fs.writeFile('emails.json', JSON.stringify(results, null, 2));

    return NextResponse.json({ message: "success" });
}

async function scrapePageForEmails(page: any, url: string) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    let emails: string[] = [];

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 }).catch((e: unknown) => {
            if (e instanceof Error) {
                console.log(`Navigation to ${url} failed: ${e.message}`);
            } else {
                console.log(`Navigation to ${url} failed: ${String(e)}`);
            }
        });
        
        const pageContent = await page.content();
        const matches = pageContent.match(emailRegex);
        if (matches) {
            emails = [...new Set(matches as string[])]; // Use Set to get unique emails
        }
    } catch (e) {
        if (e instanceof Error) {
            console.log(`Could not fetch content from ${url}: ${e.message}`);
        } else {
            console.log(`Could not fetch content from ${url}: ${String(e)}`);
        }
    }

    return emails;
}

export { requestHandler as GET };
// scrapeEmails();