import { performOnSiteSEOAnalysis } from '../components/admin/site-health/site-health-on-site-seo.integration.js';

async function test() {
    const brianResult = await performOnSiteSEOAnalysis('https://www.brianwhaley.com');
    const brianAudits = brianResult.onSiteAudits.filter(a => ['schema-blogposting', 'schema-faq'].includes(a.id));

    const pixelatedResult = await performOnSiteSEOAnalysis('https://www.pixelated.tech');
    const pixelatedAudits = pixelatedResult.onSiteAudits.filter(a => ['schema-blogposting', 'schema-faq'].includes(a.id));
} 

test().catch(console.error);
