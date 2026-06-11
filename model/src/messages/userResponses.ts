import { User } from "../repositories/userRepository";

export class userResponses {
  private readonly categoryLabels: Record<string, string> = {
    Food: "Alimentação",
    Transport: "Transportes",
    Entertainment: "Lazer",
    Shopping: "Compras",
  };

  private readonly categoryIcons: Record<string, string> = {
    Food: "🍽️",
    Transport: "🚗",
    Entertainment: "🎬",
    Shopping: "🛍️",
  };

  private readonly closingMessage =
    "💬 Quando precisares, envia uma nova despesa ou pede uma análise rápida.";

  private withClosing(message: string): string {
    return `${message}\n\n${this.closingMessage}`;
  }

  private formatCategory(category: string): string {
    return this.categoryLabels[category] ?? category;
  }

  public firstMessage(user: User): string {
    const firstName = user.name?.trim().split(/\s+/)[0];
    const greeting = firstName ? `Olá ${firstName},` : "Olá,";

    return `👋 ${greeting} bem-vindo ao Spendly.

✅ A tua conta já está ligada.

A partir de agora podes registar despesas e consultar os teus gastos directamente por WhatsApp, com linguagem natural.

💸 Para registar uma despesa, escreve por exemplo:

• almoço 12,50€
• Uber 8€
• supermercado 34,20€

📊 Também podes perguntar:

• quanto gastei este mês?
• quanto gastei em alimentação?
• onde estou a gastar mais?

🧠 Eu trato da organização por categoria e ajudo-te a perceber melhor para onde vai o teu dinheiro.

Quando quiseres, envia a tua primeira despesa.`;
  }

  public formatMoney(value: number): string {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  }

  public formatCategoryList(list: Record<string, number>): string {
    return Object.entries(list)
      .sort(([, a], [, b]) => b - a)
      .map(([category, value]) => {
        const icon = this.categoryIcons[category] ?? "•";
        return `${icon} ${this.formatCategory(category)}: ${this.formatMoney(value)}`;
      })
      .join("\n");
  }

  public formatExpensesList(expenses: { description: string; amount: number }[]): string {
    return expenses
      .map((item) => `• ${item.description}: ${this.formatMoney(item.amount)}`)
      .join("\n");
  }

  public expenseCreated(amount: number, category: string, date: string, description?: string): string {
    const title = description?.trim() || "Despesa";

    return this.withClosing(
      `✅ Despesa registada\n\n📝 ${title}\n🏷️ Categoria: ${this.formatCategory(category)}\n💶 Valor: ${this.formatMoney(amount)}\n📅 Data: ${date}`
    );
  }

  public expenseError(): string {
    return this.withClosing(
      `⚠️ Não consegui registar essa despesa.\n\nEnvia a despesa com valor e descrição, por exemplo:\n• almoço 12,50€`
    );
  }

  public lastExpenseDeleted(expense: string | number): string {
    return this.withClosing(`🗑️ Última despesa eliminada\n\n${expense}`);
  }

  public monthlySummary(month: string, total: number, expenses: { description: string; amount: number }[]): string {
    if (expenses.length === 0) {
      return this.withClosing(`📊 Resumo de ${month}\n\n${this.noData()}`);
    }

    return this.withClosing(
      `📊 Resumo de ${month}\n\n${this.formatExpensesList(expenses)}\n\n💶 Total registado: ${this.formatMoney(total)}`
    );
  }

  public monthlyByCategory(
    month: string,
    total: number,
    categories: Record<string, number>
  ): string {
    if (Object.keys(categories).length === 0) {
      return this.withClosing(`📂 Resumo por categoria de ${month}\n\n${this.noData()}`);
    }

    return this.withClosing(
      `📂 Resumo por categoria de ${month}\n\n💶 Total registado: ${this.formatMoney(total)}\n\n${this.formatCategoryList(categories)}`
    );
  }

  public categorySummary(
    category: string,
    month: string,
    total: number
  ): string {
    return this.withClosing(
      `🏷️ ${this.formatCategory(category)} em ${month}\n\n💶 Total registado: ${this.formatMoney(total)}`
    );
  }

  public topCategory(
    month: string,
    category: string,
    amount: number
  ): string {
    return this.withClosing(
      `🏆 Maior categoria em ${month}\n\n${this.formatCategory(category)} foi a categoria com maior peso, com ${this.formatMoney(amount)}.`
    );
  }

  public weeklyTotal(total: number): string {
    return this.withClosing(`📅 Esta semana\n\n💶 Tens ${this.formatMoney(total)} em despesas registadas.`);
  }

  public todayTotal(total: number): string {
    return this.withClosing(`📍 Hoje\n\n💶 Tens ${this.formatMoney(total)} em despesas registadas.`);
  }

  public noData(): string {
    return "Ainda não encontrei despesas para esse período.";
  }

  public invalidCategory(): string {
    return this.withClosing(
      `⚠️ Não consegui identificar essa categoria.\n\nPodes tentar com termos como:\n• alimentação\n• transportes\n• compras\n• lazer`
    );
  }

  public invalidDate(): string {
    return this.withClosing(
      `⚠️ Não consegui identificar o período.\n\nPodes usar expressões como:\n• este mês\n• abril\n• últimos 7 dias`
    );
  }

  public generalError(): string {
    return this.withClosing(
      `⚠️ Não consegui concluir esse pedido neste momento.\n\nTenta novamente dentro de instantes.`
    );
  }

  public help(): string {
    return this.withClosing(
      `✨ Podes falar comigo de forma natural.\n\n💸 Registar despesas:\n• almoço 12,50€\n• combustível 45€\n\n📊 Consultar gastos:\n• quanto gastei este mês?\n• quanto gastei em alimentação?\n• onde estou a gastar mais?`
    );
  }
}
