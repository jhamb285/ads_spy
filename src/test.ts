import { normalizeApifyAdsBatch, NormalizedAd, ApifyAdItem } from './normalize';

// Example test data matching the Apify response structure
const sampleApifyData: ApifyAdItem[] = [
  {
    inputUrl: "https://www.facebook.com/ads/library/?id=123",
    pageID: "123456",
    adArchiveId: "789012",
    pageId: "123456",
    pageName: "Drive for Quantix",
    startDateFormatted: "2024-01-15",
    endDateFormatted: "2024-02-15",
    isActive: true,
    categories: ["Jobs"],
    snapshot: {
      pageId: "123456",
      pageName: "Drive for Quantix",
      pageProfileUri: "https://www.facebook.com/quantix",
      caption: "Join our team of professional truck drivers",
      cards: [
        {
          body: "Looking for experienced truck drivers. Great pay, benefits, and flexible schedules. Apply today!",
          linkUrl: "https://quantix.com/careers",
          title: "Truck Driver Opportunities",
          resizedImageUrl: "https://example.com/image.jpg",
          originalImageUrl: "https://example.com/original.jpg"
        }
      ],
      linkUrl: "https://quantix.com/careers"
    }
  },
  {
    inputUrl: "https://www.facebook.com/ads/library/?id=456",
    pageID: "123456",
    adArchiveId: "789013",
    pageId: "123456",
    pageName: "Drive for Quantix",
    startDateFormatted: "2024-01-20",
    endDateFormatted: "2024-02-20",
    isActive: true,
    snapshot: {
      pageId: "123456",
      pageName: "Drive for Quantix",
      pageProfileUri: "https://www.facebook.com/quantix",
      caption: "New routes available",
      cards: [
        {
          body: "We're hiring! Competitive salary and comprehensive benefits package.",
          linkUrl: "https://quantix.com/apply"
        }
      ]
    }
  }
];

// Test the normalization
function runTest() {
  console.log('🧪 Testing Apify Ad Normalization\n');
  console.log('Input: Sample Apify data with', sampleApifyData.length, 'items\n');

  const avatar = "Truck Drivers";
  const brandName = "Drive for Quantix";
  
  const normalizedAds = normalizeApifyAdsBatch(sampleApifyData, avatar, brandName);

  console.log('✅ Normalized', normalizedAds.length, 'ads:\n');
  
  normalizedAds.forEach((ad, index) => {
    console.log(`--- Ad ${index + 1} ---`);
    console.log('ID:', ad.id);
    console.log('Brand:', ad.brandName);
    console.log('Avatar:', ad.avatar);
    console.log('Text:', ad.text);
    console.log('Title:', ad.title || '(none)');
    console.log('Link:', ad.linkUrl || '(none)');
    console.log('Image:', ad.imageUrl || '(none)');
    console.log('Dates:', `${ad.startDate} → ${ad.endDate}`);
    console.log('');
  });

  console.log('\n✨ Normalization complete!');
}

// Run the test
runTest();

