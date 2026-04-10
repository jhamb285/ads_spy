import { NormalizedAd } from './normalize';
import { AdAnalysis } from './llm';
import { calculateAdDuration, formatAdDuration } from './utils';

/**
 * Log ad analysis to console (used when Slack is not configured)
 */
export function logAdAnalysis(ad: NormalizedAd, analysis: AdAnalysis): void {
  console.log('\n' + '='.repeat(80));
  console.log('🎯 NEW AD ANALYSIS');
  console.log('='.repeat(80));
  console.log(`\nAvatar: ${ad.avatar}`);
  console.log(`Brand: ${ad.brandName}`);
  
  if (ad.adUrl) {
    console.log(`\n🔗 Facebook Ad URL: ${ad.adUrl}`);
  }
  
  if (ad.linkUrl) {
    console.log(`\n🌐 Landing page: ${ad.linkUrl}`);
  }
  
  console.log(`\n📝 Original ad:`);
  console.log('-'.repeat(80));
  console.log(ad.text);
  console.log('-'.repeat(80));
  
  console.log(`\n💡 Why this ad works:`);
  console.log(analysis.whyItWorks);
  
  console.log(`\n🔧 How to improve:`);
  analysis.howToImprove.forEach((item, idx) => {
    console.log(`  ${idx + 1}. ${item}`);
  });
  
  console.log(`\n✍️  Rewritten for our offer:`);
  console.log('-'.repeat(80));
  console.log(analysis.rewrittenAd);
  console.log('-'.repeat(80));
  
  if (ad.imageUrl) {
    console.log(`\n🖼️  Image: ${ad.imageUrl}`);
    if (ad.imageDescription) {
      console.log(`\n📸 Image Description:`);
      console.log('-'.repeat(80));
      console.log(ad.imageDescription);
      console.log('-'.repeat(80));
    }
  }
  
  if (ad.videoUrl) {
    console.log(`\n🎥 Video: ${ad.videoUrl}`);
    if (ad.videoTranscript) {
      console.log(`\n🎬 Video Transcript:`);
      console.log('-'.repeat(80));
      console.log(ad.videoTranscript);
      console.log('-'.repeat(80));
    }
  }
  
  // Calculate ad duration
  const durationDays = calculateAdDuration(ad.startDate, ad.endDate);
  const durationText = formatAdDuration(durationDays);
  
  console.log(`\n📊 Metadata:`);
  console.log(`   Ad ID: ${ad.id}`);
  console.log(`   Duration: ${durationText}`);
  console.log(`   Dates: ${ad.startDate} → ${ad.endDate}`);
  if (ad.raw.categories && ad.raw.categories.length > 0) {
    console.log(`   Categories: ${ad.raw.categories.join(', ')}`);
  }
  console.log(`   Active: ${ad.raw.isActive ? 'Yes' : 'No'}`);
  console.log('='.repeat(80) + '\n');
}

