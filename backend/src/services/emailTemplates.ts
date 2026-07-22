export const SPENDLY_LOGO_URL =
  "https://drajbrhctejnaqbutwof.supabase.co/storage/v1/object/public/brand/spendly_logo_transparent.png";

export type MonthlyCategorySummary = {
  category: string;
  total: number;
};

export type MonthlyExpensesEmailParams = {
  displayName: string;
  periodLabel: string;
  categories: MonthlyCategorySummary[];
  total: number;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function buildEmailShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: string;
  footer: string;
}): string {
  return `<!doctype html>
<html lang="pt">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f7f5;font-family:Arial,Helvetica,sans-serif;color:#152019;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f5;margin:0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dce6df;border-radius:12px;overflow:hidden;">
            ${children}
          </table>
          <p style="max-width:600px;margin:18px 0 0 0;font-size:12px;line-height:18px;color:#748278;">
            ${footer}
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildWelcomeEmailHtml(displayName: string, whatsappLink: string): string {
  const safeDisplayName = escapeHtml(displayName);

  return buildEmailShell({
    title: "Começa a usar o Spendly",
    footer: "Recebeste este email porque compraste acesso ao Spendly.",
    children: `
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
                  Ol&aacute; ${safeDisplayName},
                </p>
                <p style="margin:0 0 18px 0;font-size:16px;line-height:24px;color:#26352b;">
                  Obrigado por comprares o Spendly. A tua conta j&aacute; est&aacute; ativa e pronta a usar.
                </p>
                <p style="margin:0 0 26px 0;font-size:16px;line-height:24px;color:#26352b;">
                  Clica no bot&atilde;o abaixo para abrir a conversa no WhatsApp e come&ccedil;ar a registar despesas de forma simples.
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 26px 0;">
                  <tr>
                    <td bgcolor="#16803c" style="border-radius:8px;">
                      <a href="${whatsappLink}" style="display:inline-block;padding:14px 22px;font-size:16px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
                        Abrir no WhatsApp
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
            </tr>`,
  });
}

export function buildWelcomeEmailText(displayName: string, whatsappLink: string): string {
  return `Ola ${displayName},

Obrigado por comprares o Spendly.

O teu acesso esta pronto. Para começares a usar o Spendly no WhatsApp, abre este link:

${whatsappLink}

Depois da ativacao, podes enviar mensagens como "almoco 12 EUR" ou "quanto gastei este mes?"`;
}

export function buildMonthlyExpensesEmailHtml({
  displayName,
  periodLabel,
  categories,
  total,
}: MonthlyExpensesEmailParams): string {
  const safeDisplayName = escapeHtml(displayName);
  const safePeriodLabel = escapeHtml(periodLabel);
  const sortedCategories = [...categories].sort((a, b) => b.total - a.total);

  const tableRows = sortedCategories.length
    ? sortedCategories
        .map(
          (item) => `
                  <tr>
                    <td style="padding:13px 16px;border-bottom:1px solid #edf2ef;font-size:14px;line-height:20px;color:#26352b;">
                      ${escapeHtml(item.category)}
                    </td>
                    <td align="right" style="padding:13px 16px;border-bottom:1px solid #edf2ef;font-size:14px;line-height:20px;color:#102016;font-weight:700;">
                      ${formatMoney(item.total)}
                    </td>
                  </tr>`,
        )
        .join("")
    : `
                  <tr>
                    <td colspan="2" style="padding:16px;border-bottom:1px solid #edf2ef;font-size:14px;line-height:20px;color:#5a6f61;">
                      Ainda n&atilde;o existem despesas registadas para este per&iacute;odo.
                    </td>
                  </tr>`;

  return buildEmailShell({
    title: `Relat&oacute;rio mensal Spendly - ${safePeriodLabel}`,
    footer: "Recebeste este email porque tens os relat&oacute;rios mensais Spendly ativos.",
    children: `
            <tr>
              <td style="padding:28px 32px 18px 32px;border-bottom:1px solid #edf2ef;">
                <img src="${SPENDLY_LOGO_URL}" width="132" alt="Spendly" style="display:block;width:132px;max-width:132px;height:auto;margin:0 0 18px 0;border:0;" />
                <h1 style="margin:0;font-size:26px;line-height:34px;font-weight:700;color:#102016;">
                  O teu relat&oacute;rio mensal est&aacute; pronto
                </h1>
                <p style="margin:10px 0 0 0;font-size:15px;line-height:22px;color:#5a6f61;">
                  ${safePeriodLabel}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <p style="margin:0 0 18px 0;font-size:16px;line-height:24px;color:#26352b;">
                  Ol&aacute; ${safeDisplayName},
                </p>
                <p style="margin:0 0 18px 0;font-size:16px;line-height:24px;color:#26352b;">
                  Segue em anexo o ficheiro Excel com o detalhe das tuas despesas de ${safePeriodLabel}. Para te dar uma leitura r&aacute;pida, deixamos tamb&eacute;m abaixo o resumo por categoria.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px 0;background:#f8faf8;border:1px solid #dce6df;border-radius:10px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 4px 0;font-size:13px;line-height:18px;color:#5a6f61;text-transform:uppercase;letter-spacing:0.04em;">
                        Total registado
                      </p>
                      <p style="margin:0;font-size:28px;line-height:36px;color:#102016;font-weight:700;">
                        ${formatMoney(total)}
                      </p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #dce6df;border-radius:10px;overflow:hidden;border-collapse:separate;">
                  <tr>
                    <th align="left" style="padding:13px 16px;background:#edf5ef;border-bottom:1px solid #dce6df;font-size:13px;line-height:18px;color:#36513d;text-transform:uppercase;letter-spacing:0.04em;">
                      Categoria
                    </th>
                    <th align="right" style="padding:13px 16px;background:#edf5ef;border-bottom:1px solid #dce6df;font-size:13px;line-height:18px;color:#36513d;text-transform:uppercase;letter-spacing:0.04em;">
                      Valor
                    </th>
                  </tr>
                  ${tableRows}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 30px 32px;background:#f8faf8;border-top:1px solid #edf2ef;">
                <p style="margin:0 0 8px 0;font-size:14px;line-height:22px;color:#5a6f61;">
                  Dica Spendly
                </p>
                <p style="margin:0;font-size:14px;line-height:22px;color:#26352b;">
                  Usa este relat&oacute;rio para comparar categorias, encontrar padr&otilde;es e decidir onde queres ajustar os teus gastos no pr&oacute;ximo m&ecirc;s.
                </p>
              </td>
            </tr>`,
  });
}

export function buildMonthlyExpensesEmailText({
  displayName,
  periodLabel,
  categories,
  total,
}: MonthlyExpensesEmailParams): string {
  const categoriesText = categories.length
    ? categories
        .sort((a, b) => b.total - a.total)
        .map((item) => `- ${item.category}: ${formatMoney(item.total)}`)
        .join("\n")
    : "Ainda nao existem despesas registadas para este periodo.";

  return `Ola ${displayName},

Segue em anexo o ficheiro Excel com o detalhe das tuas despesas de ${periodLabel}.

Total registado: ${formatMoney(total)}

Resumo por categoria:
${categoriesText}

Usa este relatorio para comparar categorias, encontrar padroes e decidir onde queres ajustar os teus gastos no proximo mes.`;
}
