/**
 * Test script to verify Google Ads normalizer handles actual Apify output
 * Run with: npx ts-node test-normalizer.ts
 */

import { normalizeGoogleTransparencyAd, GoogleTransparencyAd } from './src/platforms/google/normalizer';
import { CompetitorInput } from './src/platforms/types';

// Sample data from silva95gustavo/google-ads-scraper Apify actor
const sampleTextAd: GoogleTransparencyAd = {
  advertiserId: "AR12702210093945454593",
  advertiserName: "A-TEX PEST MANAGEMENT INC.",
  creativeId: "CR09649426728124153857",
  format: "TEXT",
  previewUrl: "https://tpc.googlesyndication.com/archive/simgad/11715475814981012121",
  regionStats: [{
    regionCode: "US",
    regionName: "United States",
    lastShown: "2026-02-12"
  }],
  variations: [{
    headline: "Professional Pest Control Services",
    body: "Get rid of pests fast! Call A-Tex for expert pest management solutions.",
    clickUrl: "https://atexpest.com",
    address: "123 Main St",
    imageUrls: ["https://example.com/logo.png"]
  }]
};

const sampleImageAd: GoogleTransparencyAd = {
  advertiserId: "AR12345678901234567890",
  advertiserName: "Test Company",
  creativeId: "CR98765432109876543210",
  format: "IMAGE",
  previewUrl: "https://tpc.googlesyndication.com/archive/simgad/12345678901234567890",
  regionStats: [{
    regionCode: "US",
    regionName: "United States",
    lastShown: "2026-02-15"
  }],
  variations: [{
    imageUrl: "https://example.com/ad-image.jpg",
    headline: "Amazing Product",
    description: "Check out our amazing product line!",
    clickUrl: "https://testcompany.com/products",
    logoUri: "https://example.com/logo.png"
  }]
};

const sampleVideoAd: GoogleTransparencyAd = {
  advertiserId: "AR11111111111111111111",
  advertiserName: "Video Brand Inc",
  creativeId: "CR22222222222222222222",
  format: "VIDEO",
  previewUrl: "https://youtube.com/watch?v=example",
  regionStats: [{
    regionCode: "US",
    regionName: "United States",
    lastShown: "2026-02-10"
  }],
  variations: [{
    videoUrl: "https://youtube.com/watch?v=example",
    headline: "Watch Our Story",
    description: "See how we changed the industry",
    clickUrl: "https://videobrand.com"
  }]
};

const testCompetitor: CompetitorInput = {
  name: "A-Tex Pest",
  domain: "atexpest.com",
  isSubject: true,
  adTransparencyUrl: "https://adstransparency.google.com/?region=US&domain=atexpest.com"
};

console.log('🧪 Testing Google Ads Normalizer\n');
console.log('=' .repeat(80));

// Test TEXT ad
console.log('\n📝 TEST 1: TEXT Ad');
console.log('-'.repeat(80));
const normalizedText = normalizeGoogleTransparencyAd(sampleTextAd, testCompetitor);
console.log('✅ Normalized TEXT ad:');
console.log(JSON.stringify(normalizedText, null, 2));
console.log('\n✓ Expected checks:');
console.log(`  - ID format correct: ${normalizedText.id === 'google-CR09649426728124153857' ? '✅' : '❌'}`);
console.log(`  - Has title: ${normalizedText.title ? '✅' : '❌'} ("${normalizedText.title}")`);
console.log(`  - Has text: ${normalizedText.text ? '✅' : '❌'}`);
console.log(`  - Has linkUrl: ${normalizedText.linkUrl ? '✅' : '❌'} (${normalizedText.linkUrl})`);
console.log(`  - Date format: ${normalizedText.startDate === '2026-02-12' ? '✅' : '❌'} (${normalizedText.startDate})`);
console.log(`  - Platform: ${normalizedText.platform === 'google' ? '✅' : '❌'}`);
console.log(`  - Ad URL correct: ${normalizedText.adUrl?.includes('AR12702210093945454593') ? '✅' : '❌'}`);

// Test IMAGE ad
console.log('\n🖼️  TEST 2: IMAGE Ad');
console.log('-'.repeat(80));
const normalizedImage = normalizeGoogleTransparencyAd(sampleImageAd, testCompetitor);
console.log('✅ Normalized IMAGE ad:');
console.log(JSON.stringify(normalizedImage, null, 2));
console.log('\n✓ Expected checks:');
console.log(`  - ID format correct: ${normalizedImage.id === 'google-CR98765432109876543210' ? '✅' : '❌'}`);
console.log(`  - Has title: ${normalizedImage.title ? '✅' : '❌'} ("${normalizedImage.title}")`);
console.log(`  - Has imageUrl: ${normalizedImage.imageUrl ? '✅' : '❌'} (${normalizedImage.imageUrl})`);
console.log(`  - No videoUrl: ${!normalizedImage.videoUrl ? '✅' : '❌'}`);
console.log(`  - Date format: ${normalizedImage.startDate === '2026-02-15' ? '✅' : '❌'} (${normalizedImage.startDate})`);

// Test VIDEO ad
console.log('\n🎥 TEST 3: VIDEO Ad');
console.log('-'.repeat(80));
const normalizedVideo = normalizeGoogleTransparencyAd(sampleVideoAd, testCompetitor);
console.log('✅ Normalized VIDEO ad:');
console.log(JSON.stringify(normalizedVideo, null, 2));
console.log('\n✓ Expected checks:');
console.log(`  - ID format correct: ${normalizedVideo.id === 'google-CR22222222222222222222' ? '✅' : '❌'}`);
console.log(`  - Has title: ${normalizedVideo.title ? '✅' : '❌'} ("${normalizedVideo.title}")`);
console.log(`  - Has videoUrl: ${normalizedVideo.videoUrl ? '✅' : '❌'} (${normalizedVideo.videoUrl})`);
console.log(`  - No imageUrl: ${!normalizedVideo.imageUrl ? '✅' : '❌'}`);
console.log(`  - Date format: ${normalizedVideo.startDate === '2026-02-10' ? '✅' : '❌'} (${normalizedVideo.startDate})`);

console.log('\n' + '='.repeat(80));
console.log('🎉 All tests completed!\n');
