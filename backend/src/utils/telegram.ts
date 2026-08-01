/**
 * Telegram Bot notification utility.
 * Sends messages to admin's Telegram when new inquiries arrive.
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

/**
 * Send a message to the admin's Telegram chat.
 * Silently fails if credentials are not configured.
 */
export async function sendTelegramNotification(message: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[Telegram] Bot token or chat ID not configured, skipping notification');
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('[Telegram] Failed to send notification:', errorData);
    }
  } catch (error) {
    console.error('[Telegram] Error sending notification:', error);
  }
}

/**
 * Format a new contact inquiry for Telegram notification.
 */
export function formatInquiryNotification(data: {
  fullName: string;
  email: string;
  mobile?: string;
  serviceType: string;
  message: string;
}): string {
  return `🔔 <b>New Inquiry on Meetvia!</b>

👤 <b>Name:</b> ${data.fullName}
📧 <b>Email:</b> ${data.email}
📱 <b>Mobile:</b> ${data.mobile || 'Not provided'}
🎯 <b>Service:</b> ${data.serviceType}

💬 <b>Message:</b>
${data.message.substring(0, 200)}${data.message.length > 200 ? '...' : ''}

🕐 <i>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</i>`;
}

/**
 * Format a new companion application for Telegram notification.
 */
export function formatCompanionNotification(data: {
  fullName: string;
  email: string;
  mobile: string;
  city: string;
}): string {
  return `🆕 <b>New Companion Application!</b>

👤 <b>Name:</b> ${data.fullName}
📧 <b>Email:</b> ${data.email}
📱 <b>Mobile:</b> ${data.mobile}
📍 <b>City:</b> ${data.city}

🕐 <i>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</i>`;
}
