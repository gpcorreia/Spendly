import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";
import {
  buildMonthlyExpensesEmailHtml,
  buildMonthlyExpensesEmailText,
  buildWelcomeEmailHtml,
  buildWelcomeEmailText,
  type MonthlyCategorySummary,
} from "./emailTemplates";

type SendWelcomeEmailParams = {
  to: string;
  name?: string;
  accessToken: string;
};

type SendMonthlySummaryEmailParams = {
  to: string;
  name?: string;
  periodLabel?: string;
  categories?: MonthlyCategorySummary[];
  total?: number;
  excelAttachment?: Attachment;
};

function buildWhatsappActivationLink(accessToken: string): string {
  const botNumber = process.env.WHATSAPP_BOT_NUMBER;

  if (!botNumber) {
    throw new Error("Missing WHATSAPP_BOT_NUMBER env variable.");
  }

  return `https://wa.me/${botNumber}?text=${encodeURIComponent(`ativar ${accessToken}`)}`;
}

function createEmailTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
}

function getEmailFrom(): string {
  const gmailUser = process.env.GMAIL_USER;
  return process.env.EMAIL_FROM || `Spendly <${gmailUser}>`;
}

function getDisplayName(name?: string): string {
  return name?.trim() || "cliente";
}

export async function sendWelcomeEmail({
  to,
  name,
  accessToken,
}: SendWelcomeEmailParams): Promise<boolean> {
  const transporter = createEmailTransporter();

  if (!transporter) {
    console.warn("Missing GMAIL_USER or GMAIL_APP_PASSWORD. Welcome email was not sent.", { to });
    return false;
  }

  const whatsappLink = buildWhatsappActivationLink(accessToken);
  const displayName = getDisplayName(name);

  await transporter.sendMail({
    from: getEmailFrom(),
    to,
    subject: "Ativa o teu acesso ao Spendly",
    html: buildWelcomeEmailHtml(displayName, whatsappLink),
    text: buildWelcomeEmailText(displayName, whatsappLink),
  });

  return true;
}

export async function sendMonthlySummaryEmail({
  to,
  name,
  periodLabel = "este mês",
  categories = [],
  total = categories.reduce((sum, item) => sum + item.total, 0),
  excelAttachment,
}: SendMonthlySummaryEmailParams): Promise<boolean> {
  const transporter = createEmailTransporter();

  if (!transporter) {
    console.warn("Missing GMAIL_USER or GMAIL_APP_PASSWORD. Monthly summary email was not sent.", { to });
    return false;
  }

  const displayName = getDisplayName(name);

  await transporter.sendMail({
    from: getEmailFrom(),
    to,
    subject: `Relatório mensal Spendly - ${periodLabel}`,
    html: buildMonthlyExpensesEmailHtml({
      displayName,
      periodLabel,
      categories,
      total,
    }),
    text: buildMonthlyExpensesEmailText({
      displayName,
      periodLabel,
      categories,
      total,
    }),
    attachments: excelAttachment ? [excelAttachment] : undefined,
  });

  return true;
}
