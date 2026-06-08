import axios from 'axios';

export class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;

    if (!this.accessToken || !this.phoneNumberId) {
      console.warn('Missing WhatsApp env variables.', {
        hasAccessToken: Boolean(this.accessToken),
        hasPhoneNumberId: Boolean(this.phoneNumberId),
      });
    }
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/v22.0/${this.phoneNumberId}/messages`;

      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: String(message),
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('WhatsApp message sent successfully:', {
        to,
        messageId: response.data.messages?.[0]?.id,
      });
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const metaError = error.response?.data?.error;
        console.error('Error sending WhatsApp message:', {
          status: error.response?.status,
          message: metaError?.message,
          type: metaError?.type,
          code: metaError?.code,
          errorSubcode: metaError?.error_subcode,
          fbtraceId: metaError?.fbtrace_id,
          data: error.response?.data,
          to,
          phoneNumberId: this.phoneNumberId,
          hasAccessToken: Boolean(this.accessToken),
        });
      } else {
        console.error('Error sending WhatsApp message:', error);
      }
      throw error;
    }
  }

  verifyWebhook(mode: string, challenge: string, token: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }

    return null;
  }
}
