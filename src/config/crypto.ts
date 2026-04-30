import crypto from "crypto";

export class CryptoService {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.SECRET_KEY!;
  }

  sign(query: string): string {
    return crypto
      .createHmac("sha256", this.secretKey)
      .update(query)
      .digest("hex");
  }
}