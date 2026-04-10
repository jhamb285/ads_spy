import { WebClient } from '@slack/web-api';
import { NormalizedAd } from './normalize';
import { AdAnalysis } from './llm';
import { calculateAdDuration, formatAdDuration } from './utils';

/**
 * Slack has a 3000 character limit per text block
 * Truncate text safely to avoid errors
 */
function truncateForSlack(text: string, maxLength: number = 2900): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...\n\n[Truncated for Slack - view full text in database]';
}

/**
 * Send a formatted ad analysis to Slack
 * Routes to different channels based on ad type (static vs video)
 */
export async function sendAdToSlack(
  slackClient: WebClient,
  channelStaticOrSingle: string,
  ad: NormalizedAd,
  analysis: AdAnalysis,
  channelVideos?: string
): Promise<void> {
  // Determine which channel to use based on ad type
  const channel = ad.videoUrl && channelVideos
    ? channelVideos  // Video ad → adspy-videos
    : channelStaticOrSingle; // Image/static ad → adspy-static (or fallback single channel)

  const adType = ad.videoUrl ? '🎥 VIDEO' : '🖼️ STATIC';
  console.log(`📤 Sending ${adType} ad ${ad.id} to Slack channel: ${channel}`);

  // Truncate all text fields for Slack's 3000 char limit per block
  const truncatedAdText = truncateForSlack(ad.text, 1000);

  // Build message blocks
  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🎯 New Ad Analysis',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Avatar:*\n${ad.avatar}`,
        },
        {
          type: 'mrkdwn',
          text: `*Brand:*\n${ad.brandName}`,
        },
      ],
    },
  ];

  // Add Facebook Ad URL if available
  if (ad.adUrl) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🔗 *Facebook Ad URL:*\n<${ad.adUrl}|View in Ad Library>`,
      },
    });
  }

  // Add landing page if available
  if (ad.linkUrl) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🌐 *Landing page:*\n<${ad.linkUrl}|${ad.linkUrl}>`,
      },
    });
  }

  // Add image prominently at the top (before text analysis)
  if (ad.imageUrl) {
    blocks.push({
      type: 'divider',
    });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*🖼️ Ad Image:*',
      },
    });
    blocks.push({
      type: 'image',
      image_url: ad.imageUrl,
      alt_text: 'Ad image',
    });
    
    // Add AI image description right after the image
    if (ad.imageDescription) {
      const truncatedImageDesc = truncateForSlack(ad.imageDescription, 2000);
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*📸 AI Image Analysis:*\n\`\`\`${truncatedImageDesc}\`\`\``,
        },
      });
    }
  }

  // Add video URL if available
  if (ad.videoUrl) {
    blocks.push({
      type: 'divider',
    });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🎥 Ad Video:*\n<${ad.videoUrl}|Watch Video>`,
      },
    });
    // Add video preview image if available
    const firstVideo = ad.raw.snapshot.videos?.[0];
    const videoPreview = firstVideo?.videoPreviewImageUrl || ad.raw.snapshot.cards?.[0]?.videoPreviewImageUrl;
    if (videoPreview) {
      blocks.push({
        type: 'image',
        image_url: videoPreview,
        alt_text: 'Video preview',
      });
    }
    
    // Add video transcription right after the video
    if (ad.videoTranscript) {
      const truncatedTranscript = truncateForSlack(ad.videoTranscript, 2000);
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🎬 Video Transcription:*\n\`\`\`${truncatedTranscript}\`\`\``,
        },
      });
    }
  }

  // Add divider before text content
  if (ad.imageUrl || ad.videoUrl) {
    blocks.push({
      type: 'divider',
    });
  }

  // Add original ad text
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `📝 *Original ad:*\n\`\`\`${truncatedAdText}\`\`\``,
    },
  });

  // Add why it works (with truncation)
  const truncatedWhyItWorks = truncateForSlack(analysis.whyItWorks, 2000);
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `💡 *Why this ad works:*\n${truncatedWhyItWorks}`,
    },
  });

  // Add how to improve (with truncation)
  const improvementsList = analysis.howToImprove
    .map((item, idx) => `${idx + 1}. ${item}`)
    .join('\n');
  const truncatedImprovements = truncateForSlack(improvementsList, 2000);

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `🔧 *How to improve:*\n${truncatedImprovements}`,
    },
  });

  // Add rewritten ad (with truncation)
  const truncatedRewrittenAd = truncateForSlack(analysis.rewrittenAd, 2000);
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `✍️ *Rewritten for our offer:*\n\`\`\`${truncatedRewrittenAd}\`\`\``,
    },
  });

  // Add divider
  blocks.push({
    type: 'divider',
  });

  // Calculate ad duration
  const durationDays = calculateAdDuration(ad.startDate, ad.endDate);
  const durationText = formatAdDuration(durationDays);

  // Add metadata (truncate categories if too long)
  let metadataText = `Ad ID: ${ad.id} | Duration: ${durationText} | Dates: ${ad.startDate} → ${ad.endDate}`;
  if (ad.raw.categories && ad.raw.categories.length > 0) {
    const categoriesText = ad.raw.categories.join(', ');
    const truncatedCategories = categoriesText.length > 100
      ? categoriesText.substring(0, 100) + '...'
      : categoriesText;
    metadataText += ` | Categories: ${truncatedCategories}`;
  }
  metadataText += ` | Active: ${ad.raw.isActive ? 'Yes' : 'No'}`;

  // Ensure metadata itself isn't too long
  metadataText = truncateForSlack(metadataText, 500);

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: metadataText,
      },
    ],
  });

  try {
    // Log block count and estimated size for debugging
    const totalBlocks = blocks.length;
    const estimatedSize = JSON.stringify(blocks).length;
    console.log(`📊 Slack message stats: ${totalBlocks} blocks, ~${estimatedSize} chars total`);

    // Validate that we're not exceeding Slack's limits
    if (totalBlocks > 50) {
      console.warn(`⚠️  Warning: Message has ${totalBlocks} blocks (Slack limit: 50). Some content may be dropped.`);
    }

    await slackClient.chat.postMessage({
      channel,
      blocks,
      text: `New ad analysis for ${ad.brandName}`, // Fallback text
    });
    console.log(`✅ Successfully sent ad ${ad.id} to Slack channel: ${channel}`);
  } catch (error: any) {
    console.error(`❌ Error sending ad ${ad.id} to Slack:`, error);

    // Log specific error details
    if (error.data) {
      console.error('Slack API error details:', JSON.stringify(error.data, null, 2));

      // Check for specific error codes
      if (error.data.error === 'msg_too_long') {
        console.error('❌ Message too long. Try reducing text content further.');
      } else if (error.data.error === 'channel_not_found') {
        console.error(`❌ Channel not found: ${channel}. Make sure the bot is invited to this channel.`);
      } else if (error.data.error === 'not_in_channel') {
        console.error(`❌ Bot not in channel: ${channel}. Invite the bot using: /invite @bot-name`);
      }
    }

    throw error;
  }
}

/**
 * Create a Slack WebClient instance
 */
export function createSlackClient(token: string): WebClient {
  return new WebClient(token);
}

