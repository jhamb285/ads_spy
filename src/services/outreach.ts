import { ApifyClient } from 'apify-client';
import { createApifyClient } from '../apifyClient';
import { analyzeCompetitorSet } from '../main';
import {
  createLeads,
  updateLead,
  updateCampaignStatus,
  updateCampaignCounts,
  getCampaignById,
  getLeadsForAnalysis,
  getAllLeadsByCampaign,
  createContacts,
  OutreachLead,
} from '../storage';

const GOOGLE_PLACES_ACTOR = 'compass/crawler-google-places';
const SOCIAL_MEDIA_FINDER_ACTOR = 'H2ZIBUsxwkvDbXzqG';
const LEADS_FINDER_ACTOR = 'code_crafter/leads-finder';

const VALID_SENIORITIES = [
  'Owner', 'Executive', 'Director', 'Partner',
  'Vice President', 'Head', 'Manager', 'Senior',
];

function getApifyClient(): ApifyClient {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error('APIFY_API_TOKEN is required');
  return createApifyClient(token);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function scrapeGooglePlaces(
  campaignId: number,
  industry: string,
  city: string,
  maxPlaces: number
): Promise<void> {
  console.log(`📍 Scraping Google Places: "${industry}" in "${city}" (max ${maxPlaces})`);

  try {
    await updateCampaignStatus(campaignId, 'scraping');
    const client = getApifyClient();

    const run = await client.actor(GOOGLE_PLACES_ACTOR).call({
      searchStringsArray: [industry],
      locationQuery: city,
      maxCrawledPlacesPerSearch: maxPlaces,
      scrapeContacts: true,
      scrapeSocialMediaProfiles: { facebooks: true },
      skipClosedPlaces: true,
      language: 'en',
      maxImages: 0,
      includeWebResults: true,
      scrapeDirectories: false,
      scrapePlaceDetailPage: false,
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`✅ Found ${items.length} businesses`);

    if (items.length === 0) {
      await updateCampaignStatus(campaignId, 'scraped');
      await updateCampaignCounts(campaignId);
      return;
    }

    const leads = (items as any[]).map(item => ({
      place_id: item.placeId || null,
      name: item.title || item.searchString || 'Unknown',
      address: item.address || null,
      phone: item.phone || null,
      website: item.website || null,
      rating: item.totalScore || null,
      reviews_count: item.reviewsCount || 0,
      category_name: item.categoryName || null,
      fb_page_url: item.facebookUrl ||
        (item.socialProfiles?.facebook) ||
        (Array.isArray(item.facebooks) && item.facebooks.length > 0 ? item.facebooks[0] : null),
      raw_data: item,
    }));

    await createLeads(campaignId, leads);
    await updateCampaignStatus(campaignId, 'scraped');
    await updateCampaignCounts(campaignId);

    console.log(`✅ Saved ${leads.length} leads for campaign ${campaignId}`);
  } catch (error: any) {
    console.error(`❌ Google Places scrape failed:`, error);
    await updateCampaignStatus(campaignId, 'error', error.message);
    throw error;
  }
}

export async function discoverSocialMedia(campaignId: number): Promise<void> {
  console.log(`🔍 Discovering social media for campaign ${campaignId}`);

  try {
    await updateCampaignStatus(campaignId, 'discovering_socials');
    const client = getApifyClient();

    const allLeads = await getAllLeadsByCampaign(campaignId);
    const leadsWithoutFb = allLeads.filter(l => !l.fb_page_url);

    console.log(`Found ${leadsWithoutFb.length} leads without Facebook pages`);

    const batchSize = 10;
    for (let i = 0; i < leadsWithoutFb.length; i += batchSize) {
      const batch = leadsWithoutFb.slice(i, i + batchSize);

      for (const lead of batch) {
        try {
          const run = await client.actor(SOCIAL_MEDIA_FINDER_ACTOR).call({
            profileNames: [lead.name],
            socials: ['facebook'],
          });

          const { items } = await client.dataset(run.defaultDatasetId).listItems();

          if (items.length > 0) {
            const fbItem = items[0] as any;
            const fbUrl = fbItem.socialProfileUrl || fbItem.url || null;
            if (fbUrl) {
              await updateLead(lead.id, {
                fb_page_url: fbUrl,
                status: 'socials_found',
              });
              console.log(`  ✅ Found FB for "${lead.name}": ${fbUrl}`);
            }
          }
        } catch (err: any) {
          console.error(`  ⚠️ Failed to find socials for "${lead.name}": ${err.message}`);
        }
      }

      if (i + batchSize < leadsWithoutFb.length) {
        await sleep(5000);
      }
    }

    await updateCampaignStatus(campaignId, 'socials_done');
    await updateCampaignCounts(campaignId);

    console.log(`✅ Social media discovery complete for campaign ${campaignId}`);
  } catch (error: any) {
    console.error(`❌ Social discovery failed:`, error);
    await updateCampaignStatus(campaignId, 'error', error.message);
    throw error;
  }
}

interface CompetitorSet {
  subject: OutreachLead;
  competitors: OutreachLead[];
}

function getSizeTier(reviewsCount: number): string {
  if (reviewsCount <= 50) return 'small';
  if (reviewsCount <= 200) return 'medium';
  return 'large';
}

export function buildCompetitorSets(leads: OutreachLead[]): CompetitorSet[] {
  const leadsWithFb = leads.filter(l => l.fb_page_url || l.fb_ads_url);
  const sets: CompetitorSet[] = [];

  for (let i = 0; i < leadsWithFb.length; i++) {
    const subject = leadsWithFb[i];
    const subjectTier = getSizeTier(subject.reviews_count);

    let competitors = leadsWithFb.filter((b, idx) => {
      if (idx === i) return false;
      const sameTier = getSizeTier(b.reviews_count) === subjectTier;
      const sameCategory = b.category_name === subject.category_name;
      return sameTier && sameCategory;
    });

    if (competitors.length < 2) {
      competitors = leadsWithFb.filter((b, idx) => {
        if (idx === i) return false;
        return b.category_name === subject.category_name;
      });
    }

    competitors = competitors
      .sort((a, b) => b.reviews_count - a.reviews_count)
      .slice(0, 5);

    if (competitors.length >= 2) {
      sets.push({ subject, competitors });
    }
  }

  return sets;
}

function getFbDomain(lead: OutreachLead): string | null {
  if (lead.fb_ads_url) return lead.fb_ads_url;
  if (lead.fb_page_url) return lead.fb_page_url;

  if (lead.website && !lead.website.includes('google.com')) {
    try {
      const urlObj = new URL(lead.website);
      const domainName = urlObj.hostname.replace('www.', '').split('.')[0];
      return `https://facebook.com/${domainName}`;
    } catch { /* ignore */ }
  }

  return null;
}

export async function runCompetitiveAnalysis(campaignId: number): Promise<void> {
  console.log(`🎯 Running competitive analysis for campaign ${campaignId}`);

  try {
    await updateCampaignStatus(campaignId, 'analyzing');
    const allLeads = await getAllLeadsByCampaign(campaignId);
    const competitorSets = buildCompetitorSets(allLeads);

    console.log(`Built ${competitorSets.length} competitor sets`);

    const analyzedSubjectIds = new Set<number>();

    for (let i = 0; i < competitorSets.length; i++) {
      const set = competitorSets[i];

      if (analyzedSubjectIds.has(set.subject.id)) continue;

      const subjectDomain = getFbDomain(set.subject);
      if (!subjectDomain) {
        console.log(`  ⚠️ No FB URL for "${set.subject.name}", skipping`);
        continue;
      }

      const competitors = set.competitors
        .map(c => {
          const domain = getFbDomain(c);
          return domain ? { name: c.name, domain, isSubject: false } : null;
        })
        .filter((c): c is { name: string; domain: string; isSubject: boolean } => c !== null);

      if (competitors.length < 2) {
        console.log(`  ⚠️ Not enough competitors with FB URLs for "${set.subject.name}"`);
        continue;
      }

      console.log(`  📊 Analyzing ${set.subject.name} vs ${competitors.length} competitors (${i + 1}/${competitorSets.length})`);

      try {
        const result = await analyzeCompetitorSet({
          competitors: [
            { name: set.subject.name, domain: subjectDomain, isSubject: true },
            ...competitors,
          ],
        });

        if (result.analysis_id) {
          await updateLead(set.subject.id, {
            analysis_id: result.analysis_id,
            status: 'analyzed',
          });
          analyzedSubjectIds.add(set.subject.id);
        }

        await updateCampaignCounts(campaignId);
      } catch (err: any) {
        console.error(`  ❌ Analysis failed for "${set.subject.name}": ${err.message}`);
      }

      await sleep(2000);
    }

    await updateCampaignStatus(campaignId, 'analyzed');
    await updateCampaignCounts(campaignId);

    console.log(`✅ Competitive analysis complete for campaign ${campaignId}`);
  } catch (error: any) {
    console.error(`❌ Competitive analysis failed:`, error);
    await updateCampaignStatus(campaignId, 'error', error.message);
    throw error;
  }
}

export async function enrichLeads(campaignId: number): Promise<void> {
  console.log(`🔎 Enriching leads for campaign ${campaignId}`);

  try {
    await updateCampaignStatus(campaignId, 'enriching');
    const client = getApifyClient();

    const allLeads = await getAllLeadsByCampaign(campaignId);
    const leadsWithWebsite = allLeads.filter(l => l.website);

    console.log(`Found ${leadsWithWebsite.length} leads with websites to enrich`);

    const batchSize = 5;
    for (let i = 0; i < leadsWithWebsite.length; i += batchSize) {
      const batch = leadsWithWebsite.slice(i, i + batchSize);

      for (const lead of batch) {
        try {
          const run = await client.actor(LEADS_FINDER_ACTOR).call({
            company_domain: [lead.website],
            email_status: ['validated'],
          });

          const { items } = await client.dataset(run.defaultDatasetId).listItems();

          const filtered = (items as any[])
            .filter(item => {
              const seniority = item.seniority || '';
              return VALID_SENIORITIES.some(s =>
                seniority.toLowerCase().includes(s.toLowerCase())
              );
            })
            .slice(0, 100);

          if (filtered.length > 0) {
            await createContacts(
              lead.id,
              campaignId,
              filtered.map(item => ({
                full_name: item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || null,
                email: item.email || null,
                title: item.title || null,
                seniority: item.seniority || null,
                linkedin_url: item.linkedin_url || null,
                company_name: item.organization?.name || lead.name,
                company_linkedin_url: item.organization?.linkedin_url || null,
                email_status: item.email_status || 'found',
                raw_data: item,
              }))
            );

            await updateLead(lead.id, { status: 'enriched' });
            console.log(`  ✅ Found ${filtered.length} contacts for "${lead.name}"`);
          }
        } catch (err: any) {
          console.error(`  ⚠️ Enrichment failed for "${lead.name}": ${err.message}`);
        }
      }

      await updateCampaignCounts(campaignId);

      if (i + batchSize < leadsWithWebsite.length) {
        await sleep(5000);
      }
    }

    await updateCampaignStatus(campaignId, 'enriched');
    await updateCampaignCounts(campaignId);

    console.log(`✅ Lead enrichment complete for campaign ${campaignId}`);
  } catch (error: any) {
    console.error(`❌ Lead enrichment failed:`, error);
    await updateCampaignStatus(campaignId, 'error', error.message);
    throw error;
  }
}
