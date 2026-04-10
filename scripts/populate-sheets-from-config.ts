/**
 * Populate Google Sheets with all default brands from config.ts
 *
 * This script reads the default brand list and writes them all to Google Sheets.
 * Run this once to set up your initial brand list.
 *
 * Usage:
 *   npm run populate-sheets
 */

import 'dotenv/config';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

// Import default brand list from config
const configPath = path.join(__dirname, '../src/config.ts');
const configContent = fs.readFileSync(configPath, 'utf-8');

// Extract brand list using regex
const brandListMatch = configContent.match(/const DEFAULT_BRAND_LIST:.*?\[([\s\S]*?)\];/);
if (!brandListMatch) {
  console.error('❌ Could not find DEFAULT_BRAND_LIST in config.ts');
  process.exit(1);
}

// Parse brands (simplified extraction)
interface Brand {
  avatar: string;
  brandName: string;
  pageUrl: string;
  minActiveDays?: number;
}

// Manually extract brands from config
const brands: Brand[] = [
  { avatar: "Rosabella", brandName: "Rosabella", pageUrl: "https://www.facebook.com/moringabyrosabella/" },
  { avatar: "Spirituality", brandName: "spirilet.com", pageUrl: "https://www.facebook.com/106105038806701" },
  { avatar: "Spirituality", brandName: "projectyourself.com", pageUrl: "https://www.facebook.com/134795180050249" },
  { avatar: "Spirituality", brandName: "mindfulsouls.com", pageUrl: "https://www.facebook.com/184817572099721" },
  { avatar: "Spirituality", brandName: "karmaitems.com", pageUrl: "https://www.facebook.com/109598535381020" },
  { avatar: "Spirituality", brandName: "369project.com", pageUrl: "https://www.facebook.com/102792421439477" },
  { avatar: "Insecure Men", brandName: "shopvitacore.com", pageUrl: "https://www.facebook.com/831843123349383" },
  { avatar: "Insecure Men", brandName: "bluestarnutraceuticals.com", pageUrl: "https://www.facebook.com/144653225549096" },
  { avatar: "Insecure Men", brandName: "naturalrems.com", pageUrl: "https://www.facebook.com/234300143107077" },
  { avatar: "Insecure Men", brandName: "hygienelab.com", pageUrl: "https://www.facebook.com/127347197126621" },
  { avatar: "Insecure Men", brandName: "menerals.com", pageUrl: "https://www.facebook.com/536258462915019" },
  { avatar: "Insecure Men", brandName: "innosupps.com", pageUrl: "https://www.facebook.com/329949444375869" },
  { avatar: "Insecure Men", brandName: "mengotomars.com", pageUrl: "https://www.facebook.com/184711951390377" },
  { avatar: "Insecure Men", brandName: "ancestralsupplements.co", pageUrl: "https://www.facebook.com/187583778382475" },
  { avatar: "Insecure Men", brandName: "xarashilajit.com", pageUrl: "https://www.facebook.com/292335420816699" },
  { avatar: "Insecure Men", brandName: "peakshilajitstore.com", pageUrl: "https://www.facebook.com/108920655642266" },
  { avatar: "Bloating/Constipation", brandName: "Emma relief", pageUrl: "https://www.facebook.com/105745751961937" },
  { avatar: "Bloating/Constipation", brandName: "Colonbroom", pageUrl: "https://www.facebook.com/103357974681001" },
  { avatar: "Bloating/Constipation", brandName: "ARMRA", pageUrl: "https://www.facebook.com/109196117495123" },
  { avatar: "Bloating/Constipation", brandName: "Arrae", pageUrl: "https://www.facebook.com/108401623899597" },
  { avatar: "Bloating/Constipation", brandName: "Happy mammoth", pageUrl: "https://www.facebook.com/1343771369029582" },
  { avatar: "Bloating/Constipation", brandName: "Seed", pageUrl: "https://www.facebook.com/181356250331" },
  { avatar: "Detox", brandName: "sourplus.com", pageUrl: "https://www.facebook.com/104134227645898" },
  { avatar: "Detox", brandName: "Organicsnature.co", pageUrl: "https://www.facebook.com/102488931453396" },
  { avatar: "Detox", brandName: "Catakor", pageUrl: "https://www.facebook.com/671948515999679" },
  { avatar: "Detox", brandName: "Sereneherbs", pageUrl: "https://www.facebook.com/248307828359857" },
  { avatar: "Detox", brandName: "resilia.shop", pageUrl: "https://www.facebook.com/547622448442236" },
  { avatar: "Detox", brandName: "ethale.com", pageUrl: "https://www.facebook.com/108386698678340" },
  { avatar: "Detox", brandName: "oryanhealth.com", pageUrl: "https://www.facebook.com/836023079584036" },
  { avatar: "Detox", brandName: "tryprimehaven.com", pageUrl: "https://www.facebook.com/562055046990799" },
  { avatar: "Detox", brandName: "Saffralabs.shop", pageUrl: "https://www.facebook.com/879284728598966" },
  { avatar: "Detox", brandName: "trynutrivora.com", pageUrl: "https://www.facebook.com/614603678409016" },
  { avatar: "Detox", brandName: "maryruthorganics.com", pageUrl: "https://www.facebook.com/461471903707959" },
  { avatar: "Detox", brandName: "auvely.com", pageUrl: "https://www.facebook.com/109719045226605" },
  { avatar: "Detox", brandName: "freerangesupplements.com", pageUrl: "https://www.facebook.com/107538644953379" },
  { avatar: "Detox", brandName: "tryvelvra.com", pageUrl: "https://www.facebook.com/652010014665723" },
  { avatar: "Detox", brandName: "Dosedaily", pageUrl: "https://www.facebook.com/112242250425540" },
  { avatar: "Cortisol/puffy face", brandName: "Rosabella", pageUrl: "https://www.facebook.com/389183070942458" },
  { avatar: "Cortisol/puffy face", brandName: "Pulsetto.tech", pageUrl: "https://www.facebook.com/104835338849392" },
  { avatar: "Cortisol/puffy face", brandName: "shaktimat.com", pageUrl: "https://www.facebook.com/414329738918974" },
  { avatar: "General", brandName: "Primal Queen", pageUrl: "https://www.facebook.com/125572610639402" },
  { avatar: "General", brandName: "Ryze", pageUrl: "https://www.facebook.com/107940537227344" },
  { avatar: "General", brandName: "Norse Organics", pageUrl: "https://www.facebook.com/125701703959711" },
  { avatar: "General", brandName: "Neurodrops", pageUrl: "https://www.facebook.com/527023310491879" },
  { avatar: "General", brandName: "Grounding.co", pageUrl: "https://www.facebook.com/107385845781364" },
  { avatar: "General", brandName: "Lhanel", pageUrl: "https://www.facebook.com/150123041508232" },
  { avatar: "General", brandName: "Sassysaints", pageUrl: "https://www.facebook.com/105363611534516" },
  { avatar: "General", brandName: "Heyshape", pageUrl: "https://www.facebook.com/108815292124532" },
  { avatar: "General", brandName: "Smooche", pageUrl: "https://www.facebook.com/114830840156278" },
  { avatar: "General", brandName: "Polar hair care", pageUrl: "https://www.facebook.com/888537411001717" },
  { avatar: "General", brandName: "Forchics", pageUrl: "https://www.facebook.com/109982436998264" },
  { avatar: "General", brandName: "Spoiledchild", pageUrl: "https://www.facebook.com/103345698622969" },
  { avatar: "General", brandName: "Trybello.com", pageUrl: "https://www.facebook.com/100494126121683" },
  { avatar: "General", brandName: "Earlybird Morning", pageUrl: "https://www.facebook.com/138237812716146" },
  { avatar: "General", brandName: "trybloomin.com", pageUrl: "https://www.facebook.com/503989472801936" },
  { avatar: "General", brandName: "Neurobrocc", pageUrl: "https://www.facebook.com/812765235568779" },
  { avatar: "General", brandName: "Petlabsco", pageUrl: "https://www.facebook.com/177930899801067" },
  { avatar: "General", brandName: "Spacegoods", pageUrl: "https://www.facebook.com/104163495557745" },
  { avatar: "General", brandName: "Serenova beauty", pageUrl: "https://www.facebook.com/820573164478851" },
  { avatar: "General", brandName: "Fifth ray", pageUrl: "https://www.facebook.com/110765378766779" },
  { avatar: "General", brandName: "Olavita skin", pageUrl: "https://www.facebook.com/114540138243153" },
  { avatar: "General", brandName: "Thermoslim.co", pageUrl: "https://www.facebook.com/103303048248229" },
  { avatar: "General", brandName: "Terra health", pageUrl: "https://www.facebook.com/428304487728046" },
  { avatar: "General", brandName: "Nutri Paw", pageUrl: "https://www.facebook.com/100862391745873" },
  { avatar: "General", brandName: "Taos footwear", pageUrl: "https://www.facebook.com/134519076619788" },
  { avatar: "General", brandName: "City beauty", pageUrl: "https://www.facebook.com/1431625556919604" },
  { avatar: "General", brandName: "Froya organics", pageUrl: "https://www.facebook.com/278851805311073" },
  { avatar: "General", brandName: "Scandinavian biolabs", pageUrl: "https://www.facebook.com/108462620630298" },
  { avatar: "General", brandName: "Everyday dose", pageUrl: "https://www.facebook.com/102454544917397" },
  { avatar: "General", brandName: "Thera hair", pageUrl: "https://www.facebook.com/139011999285191" },
  { avatar: "General", brandName: "Montysupps.com", pageUrl: "https://www.facebook.com/736039796252458" },
  { avatar: "General", brandName: "Fleava.shop", pageUrl: "https://www.facebook.com/180128691861413" },
  { avatar: "General", brandName: "trylipocore.com", pageUrl: "https://www.facebook.com/498772106662651" },
  { avatar: "General", brandName: "Obvi", pageUrl: "https://www.facebook.com/2431731276838642" },
  { avatar: "General", brandName: "Undrdog", pageUrl: "https://www.facebook.com/196764956858148" },
  { avatar: "General", brandName: "FLO", pageUrl: "https://www.facebook.com/142179242517441" },
  { avatar: "General", brandName: "holistichealthlabs.com", pageUrl: "https://www.facebook.com/307068659928253" },
  { avatar: "General", brandName: "Enhanced scents", pageUrl: "https://www.facebook.com/101440846193082" },
  { avatar: "General", brandName: "Getvitalix", pageUrl: "https://www.facebook.com/455291037660905" },
  { avatar: "General", brandName: "Veganic", pageUrl: "https://www.facebook.com/525636463965098" },
  { avatar: "General", brandName: "Klonescents", pageUrl: "https://www.facebook.com/119921011103446" },
  { avatar: "General", brandName: "Botanic", pageUrl: "https://www.facebook.com/138946309458915" },
  { avatar: "General", brandName: "Infinityhoop", pageUrl: "https://www.facebook.com/101304882243072" },
  { avatar: "General", brandName: "Magicstyler", pageUrl: "https://www.facebook.com/277755915431693" },
  { avatar: "General", brandName: "Flow pouches", pageUrl: "https://www.facebook.com/381074388432842" },
  { avatar: "General", brandName: "Capyera", pageUrl: "https://www.facebook.com/110593825333849" },
  { avatar: "General", brandName: "FODZYME", pageUrl: "https://www.facebook.com/108903474669342" },
  { avatar: "General", brandName: "kittyspout.com", pageUrl: "https://www.facebook.com/102825741868911" },
  { avatar: "General", brandName: "maelyscosmetics.com", pageUrl: "https://www.facebook.com/145474042804451" },
];

async function main() {
  console.log('📊 Populating Google Sheets with default brands...\n');

  const sheetsId = process.env.GOOGLE_SHEETS_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!sheetsId || !serviceAccountEmail || !serviceAccountKey) {
    console.error('❌ Missing Google Sheets credentials in .env');
    process.exit(1);
  }

  // Clean up private key
  serviceAccountKey = serviceAccountKey.trim();
  if (serviceAccountKey.startsWith('"')) {
    serviceAccountKey = serviceAccountKey.substring(1);
  }
  if (serviceAccountKey.endsWith('",') || serviceAccountKey.endsWith('"')) {
    serviceAccountKey = serviceAccountKey.replace(/",?$/, '');
  }
  serviceAccountKey = serviceAccountKey.replace(/\\n/g, '\n');

  const serviceAccountAuth = new JWT({
    email: serviceAccountEmail,
    key: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(sheetsId, serviceAccountAuth);

  await doc.loadInfo();
  console.log(`✅ Connected to sheet: "${doc.title}"\n`);

  // Find or create "Brands" tab
  let brandsSheet = doc.sheetsByTitle['Brands'];

  if (!brandsSheet) {
    console.log('📝 Creating "Brands" tab...');
    brandsSheet = await doc.addSheet({
      title: 'Brands',
      headerValues: ['Avatar', 'Brand Name', 'Facebook Page URL', 'Active', 'Min Active Days', 'Last Scraped', 'Total Ads Scraped']
    });
    console.log('✅ Created "Brands" tab\n');
  } else {
    console.log('✅ Found existing "Brands" tab\n');

    // Clear existing rows (except header)
    const rows = await brandsSheet.getRows();
    if (rows.length > 0) {
      console.log(`🗑️  Clearing ${rows.length} existing rows...\n`);
      for (const row of rows) {
        await row.delete();
      }
    }
  }

  // Add all brands with delay to avoid rate limit
  console.log(`📝 Adding ${brands.length} brands to Google Sheets (with 200ms delay per brand)...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < brands.length; i++) {
    const brand = brands[i];
    try {
      await brandsSheet.addRow({
        'Avatar': brand.avatar,
        'Brand Name': brand.brandName,
        'Facebook Page URL': brand.pageUrl,
        'Active': 'TRUE',
        'Min Active Days': brand.minActiveDays || 0,
        'Last Scraped': '',
        'Total Ads Scraped': 0
      });
      successCount++;

      // Add 200ms delay to avoid rate limiting (Google Sheets: 60 writes/min)
      await new Promise(resolve => setTimeout(resolve, 200));

      if ((i + 1) % 10 === 0) {
        console.log(`   ✅ Added ${i + 1}/${brands.length} brands...`);
      }
    } catch (error) {
      failCount++;
      console.error(`   ❌ Failed to add brand ${brand.brandName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log(`\n📊 Results: ${successCount} brands added successfully, ${failCount} failed\n`);

  if (successCount !== brands.length) {
    console.warn(`⚠️  WARNING: Only ${successCount}/${brands.length} brands were added!\n`);
  } else {
    console.log(`✅ Successfully populated all ${successCount} brands in Google Sheets!\n`);
  }

  console.log(`📊 Next step: Run "npm run sync-brands" to sync from Sheets → Database`);
}

main().catch(console.error);
