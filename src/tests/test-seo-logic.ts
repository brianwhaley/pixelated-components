import { performOnSiteSEOAnalysis } from '../components/admin/site-health/site-health-on-site-seo.integration.js';

async function test() {
    console.log('Testing brianwhaley.com...');
    const brianResult = await performOnSiteSEOAnalysis('https://www.brianwhaley.com');
    const brianAudits = brianResult.onSiteAudits.filter(a => ['schema-blogposting', 'schema-faq'].includes(a.id));
    console.log('Brian Whaley Audits:', JSON.stringify(brianAudits, null, 2));

    console.log('\nTesting pixelated.tech...');
    const pixelatedResult = await performOnSiteSEOAnalysis('https://www.pixelated.tech');
    const pixelatedAudits = pixelatedResult.onSiteAudits.filter(a => ['schema-blogposting', 'schema-faq'].includes(a.id));
    console.log('Pixelated Audits:', JSON.stringify(pixelatedAudits, null, 2));
}

test().catch(console.error);
