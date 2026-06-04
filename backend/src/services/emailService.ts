import nodemailer from "nodemailer";

type SendWelcomeEmailParams = {
  to: string;
  name: string;
  accessToken: string;
};

const SPENDLY_LOGO_URL =
  "https://drajbrhctejnaqbutwof.supabase.co/storage/v1/object/public/brand/spendly_logo_transparent.png";

function buildWhatsappActivationLink(accessToken: string): string {
  const botNumber = process.env.WHATSAPP_BOT_NUMBER;

  if (!botNumber) {
    throw new Error("Missing WHATSAPP_BOT_NUMBER env variable.");
  }

  return `https://wa.me/${botNumber}?text=${encodeURIComponent(`ativar ${accessToken}`)}`;
}

function buildWelcomeEmailHtml(displayName: string, whatsappLink: string): string {
  return `<!doctype html>
<html lang="pt">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ativa o teu acesso ao Spendly</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f7f5;font-family:Arial,Helvetica,sans-serif;color:#152019;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f5;margin:0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dce6df;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 18px 32px;border-bottom:1px solid #edf2ef;">
                <img src="${SPENDLY_LOGO_URL}" width="132" alt="Spendly" style="display:block;width:132px;max-width:132px;height:auto;margin:0 0 18px 0;border:0;" />
                <h1 style="margin:0;font-size:26px;line-height:34px;font-weight:700;color:#102016;">
                  O teu acesso est&aacute; pronto
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <p style="margin:0 0 18px 0;font-size:16px;line-height:24px;color:#26352b;">
                  Ola ${displayName},
                </p>
                <p style="margin:0 0 18px 0;font-size:16px;line-height:24px;color:#26352b;">
                  Obrigado por comprares o Spendly. Falta s&oacute; ativares o teu acesso no WhatsApp para come&ccedil;ares a registar despesas e consultar os teus gastos.
                </p>
                <p style="margin:0 0 26px 0;font-size:16px;line-height:24px;color:#26352b;">
                  Clica no bot&atilde;o abaixo. O WhatsApp vai abrir com uma mensagem de ativa&ccedil;&atilde;o j&aacute; preenchida. S&oacute; tens de enviar essa mensagem.
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 26px 0;">
                  <tr>
                    <td bgcolor="#16803c" style="border-radius:8px;">
                      <a href="${whatsappLink}" style="display:inline-block;padding:14px 22px;font-size:16px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
                        Ativar no WhatsApp
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 10px 0;font-size:14px;line-height:22px;color:#5a6f61;">
                  Se o bot&atilde;o n&atilde;o funcionar, copia e abre este link:
                </p>
                <p style="margin:0 0 24px 0;font-size:14px;line-height:22px;word-break:break-all;">
                  <a href="${whatsappLink}" style="color:#16803c;text-decoration:underline;">${whatsappLink}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 30px 32px;background:#f8faf8;border-top:1px solid #edf2ef;">
                <p style="margin:0 0 8px 0;font-size:14px;line-height:22px;color:#5a6f61;">
                  Depois da ativa&ccedil;&atilde;o, podes enviar mensagens como:
                </p>
                <p style="margin:0;font-size:14px;line-height:22px;color:#26352b;">
                  "almoco 12 EUR" ou "quanto gastei este mes?"
                </p>
              </td>
            </tr>
          </table>
          <p style="max-width:600px;margin:18px 0 0 0;font-size:12px;line-height:18px;color:#748278;">
            Recebeste este email porque compraste acesso ao Spendly.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildWelcomeEmailText(displayName: string, whatsappLink: string): string {
  return `Ola ${displayName},

Obrigado por comprares o Spendly.

O teu acesso esta pronto. Para ativares o Spendly no WhatsApp, abre este link e envia a mensagem que ja vem preenchida:

${whatsappLink}

Depois da ativacao, podes enviar mensagens como "almoco 12 EUR" ou "quanto gastei este mes?"`;
}

export async function sendWelcomeEmail({
  to,
  name,
  accessToken,
}: SendWelcomeEmailParams): Promise<boolean> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const from = process.env.EMAIL_FROM || `Spendly <${gmailUser}>`;

  if (!gmailUser || !gmailAppPassword) {
    console.warn("Missing GMAIL_USER or GMAIL_APP_PASSWORD. Welcome email was not sent.", { to });
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  const whatsappLink = buildWhatsappActivationLink(accessToken);
  const displayName = name || "Ola";

  await transporter.sendMail({
    from,
    to,
    subject: "Ativa o teu acesso ao Spendly",
    html: buildWelcomeEmailHtml(displayName, whatsappLink),
    text: buildWelcomeEmailText(displayName, whatsappLink),
  });

  return true;
}
