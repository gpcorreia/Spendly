import axios from 'axios';
import { CryptoService } from '../config/crypto';

export class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;
  private cryptoService: CryptoService;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
    this.cryptoService = new CryptoService();
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/v22.0/${this.phoneNumberId}/messages`;

      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message,
        },
      };

      const sha256Hash = this.cryptoService.sign(JSON.stringify(payload));

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': `sha256=${sha256Hash}`,
        },
      });

      console.log('WhatsApp message sent successfully:', {
        to,
        messageId: response.data.messages?.[0]?.id,
      });
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
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
