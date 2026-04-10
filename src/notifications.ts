/**
 * Notification Service
 * Handles Slack notifications for brand changes, settings updates, and system events
 */

import { WebClient } from '@slack/web-api';

let slackClient: WebClient | null = null;
let notificationChannel: string = '';

/**
 * Initialize notification service with Slack credentials
 */
export function initializeNotifications(slackToken?: string, channel?: string): void {
  if (slackToken && channel) {
    slackClient = new WebClient(slackToken);
    notificationChannel = channel;
    console.log(`✅ Notifications initialized for Slack channel: ${channel}`);
  } else {
    console.log('ℹ️  Notifications disabled (no Slack credentials)');
  }
}

/**
 * Send a notification to Slack
 */
async function sendNotification(
  title: string,
  fields: Array<{ name: string; value: string; inline?: boolean }>,
  color?: string
): Promise<void> {
  if (!slackClient || !notificationChannel) {
    console.log(`📢 [Notification - Slack Disabled] ${title}`);
    return;
  }

  try {
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title,
        },
      },
    ];

    // Add fields as sections
    for (const field of fields) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${field.name}:*\n${field.value}`,
        },
      });
    }

    // Add timestamp
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `🕐 ${new Date().toLocaleString()}`,
        },
      ],
    });

    await slackClient.chat.postMessage({
      channel: notificationChannel,
      blocks,
      text: title, // Fallback text
    });

    console.log(`✅ Notification sent to Slack: ${title}`);
  } catch (error) {
    console.error('❌ Failed to send Slack notification:', error);
  }
}

/**
 * Notify when a brand is added
 */
export async function notifyBrandAdded(brand: {
  avatar: string;
  brand_name: string;
  active: boolean;
}): Promise<void> {
  await sendNotification(
    '🆕 New Brand Added',
    [
      { name: 'Avatar', value: brand.avatar },
      { name: 'Brand Name', value: brand.brand_name },
      { name: 'Status', value: brand.active ? '✅ Active' : '❌ Inactive' },
    ],
    'good'
  );
}

/**
 * Notify when a brand is updated
 */
export async function notifyBrandUpdated(
  brandId: number,
  brandName: string,
  changes: string[]
): Promise<void> {
  await sendNotification(
    '✏️ Brand Updated',
    [
      { name: 'Brand ID', value: brandId.toString() },
      { name: 'Brand Name', value: brandName },
      { name: 'Changes', value: changes.join('\n') },
    ],
    'warning'
  );
}

/**
 * Notify when a brand is deleted
 */
export async function notifyBrandDeleted(brandId: number, brandName: string): Promise<void> {
  await sendNotification(
    '🗑️ Brand Deleted',
    [
      { name: 'Brand ID', value: brandId.toString() },
      { name: 'Brand Name', value: brandName },
    ],
    'danger'
  );
}

/**
 * Notify when a brand page is added
 */
export async function notifyBrandPageAdded(page: {
  brand_name: string;
  page_url: string;
  page_name: string | null;
  is_active: boolean;
}): Promise<void> {
  await sendNotification(
    '📄 New Brand Page Added',
    [
      { name: 'Brand', value: page.brand_name },
      { name: 'Page URL', value: page.page_url },
      { name: 'Page Name', value: page.page_name || 'N/A' },
      { name: 'Status', value: page.is_active ? '✅ Active' : '❌ Inactive' },
    ],
    'good'
  );
}

/**
 * Notify when a brand page is updated
 */
export async function notifyBrandPageUpdated(
  pageId: number,
  pageUrl: string,
  changes: string[]
): Promise<void> {
  await sendNotification(
    '✏️ Brand Page Updated',
    [
      { name: 'Page ID', value: pageId.toString() },
      { name: 'Page URL', value: pageUrl },
      { name: 'Changes', value: changes.join('\n') },
    ],
    'warning'
  );
}

/**
 * Notify when a brand page is deleted
 */
export async function notifyBrandPageDeleted(pageId: number, pageUrl: string): Promise<void> {
  await sendNotification(
    '🗑️ Brand Page Deleted',
    [
      { name: 'Page ID', value: pageId.toString() },
      { name: 'Page URL', value: pageUrl },
    ],
    'danger'
  );
}

/**
 * Notify when global settings are changed
 */
export async function notifySettingsChanged(setting: string, oldValue: any, newValue: any): Promise<void> {
  await sendNotification(
    '⚙️ Global Settings Updated',
    [
      { name: 'Setting', value: setting },
      { name: 'Old Value', value: String(oldValue) },
      { name: 'New Value', value: String(newValue) },
    ],
    'warning'
  );
}

/**
 * Notify when brand-specific settings are changed
 */
export async function notifyBrandSettingsChanged(
  brandId: number,
  brandName: string,
  changes: string[]
): Promise<void> {
  await sendNotification(
    '⚙️ Brand Settings Updated',
    [
      { name: 'Brand ID', value: brandId.toString() },
      { name: 'Brand Name', value: brandName },
      { name: 'Changes', value: changes.join('\n') },
    ],
    'warning'
  );
}

/**
 * Notify when scraper is enabled/disabled
 */
export async function notifyScraperStatusChanged(enabled: boolean, actor?: string): Promise<void> {
  await sendNotification(
    enabled ? '🟢 Scraper Enabled' : '🔴 Scraper Disabled',
    [
      { name: 'Status', value: enabled ? 'Scraper is now ON' : 'Scraper is now OFF' },
      { name: 'Changed By', value: actor || 'System' },
    ],
    enabled ? 'good' : 'danger'
  );
}
