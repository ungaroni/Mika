const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

export async function sendClaimNotification(giftName: string, claimedBy: string): Promise<void> {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.log('[notify] EmailJS not configured, skipping notification');
    return;
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: 'ungaroni@gmail.com',
          gift_name: giftName,
          claimed_by: claimedBy,
          timestamp: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
        },
      }),
    });

    if (!response.ok) {
      console.error('[notify] EmailJS error:', response.status);
    }
  } catch (err) {
    console.error('[notify] Failed to send notification:', err);
  }
}
