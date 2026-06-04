import { User } from "../repositories/userRepository";

// src/messages/Message.ts
export class userResponses {

  private emojisCategory: Record<string, string> = {
    "Food": "🍔",
    "Transport": "🚗",
    "Entertainment": "🎬",
    "Shopping": "🛍️"
  };

  private readonly closingMessage =
    "Se for necessário registar mais despesas ou fazer consultas, é só avisar 😊";

  private withClosing(message: string): string {
    return `${message}\n\n${this.closingMessage}`;
  }

  public firstMessage(user: User): string {
    const firstName = user.name?.trim().split(/\s+/)[0] || "olá";

    return `Olá ${firstName} 👋

Bem-vindo ao Spendly. A partir de agora podes tratar das tuas despesas diretamente por aqui, sem folhas de cálculo, apps complicadas ou esquecimentos no fim do dia.

Para registar uma despesa, escreve naturalmente:

• "almoço 12€"
• "uber 8,50€"
• "supermercado 34€"

Também podes perguntar:

• "quanto gastei este mês?"
• "quanto gastei em comida?"
• "onde estou a gastar mais?"

Eu organizo tudo por ti e vou ajudando a perceber para onde está a ir o teu dinheiro.

Quando quiseres, envia já a tua primeira despesa.`;
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
      .map(([des, val]) => `• ${this.emojisCategory[des]} ${des}: ${this.formatMoney(val)}`)
      .join("\n");
  }

  public formatExpensesList(expenses: { description: string; amount: number }[]): string {
    return expenses
      .map((item) => `• ${item.description}: ${this.formatMoney(item.amount)}`)
      .join("\n");
  }

  // =============================
  // 🟢 EXPENSE ACTIONS
  // =============================

  public expenseCreated(amount: number, category: string, date: string, description?: string): string {
    return this.withClosing(
      `✅ Despesa registada!\n\n📝 ${description || 'Sem descrição'} (${category})\n💸 ${this.formatMoney(amount)}\n\n🗓️ ${date}`
    );
  }

  public expenseError(): string {
    return this.withClosing(
      `⚠️ Não consegui registar essa despesa.\n\nTenta algo como: "12€ almoço"`
    );
  }
  
  public lastExpenseDeleted(expense: string): string {
    return this.withClosing(`❌ Última despesa eliminada com sucesso.\n\n"${expense}"`);
  }

  // =============================
  // 📊 SUMMARIES
  // =============================

  public monthlySummary(month: string, total: number, expenses: { description: string; amount: number }[]): string {
    if (expenses.length === 0) {
      return this.withClosing(`📊 Gastos (${month})\n\n${this.noData()}`);
    }

    return this.withClosing(
      `📊 Gastos (${month})\n\n${this.formatExpensesList(expenses)}\n\n💰 Total: ${this.formatMoney(total)}`
    );
  }

  public monthlyByCategory(
    month: string,
    total: number,
    categories: Record<string, number>
  ): string {
    return this.withClosing(
      `📊 Resumo de ${month}\n\n💰 Total: ${this.formatMoney(total)}\n\n📂 Categorias:\n${this.formatCategoryList(categories)}`
    );
  }

  public categorySummary(
    category: string,
    month: string,
    total: number
  ): string {
    return this.withClosing(`Em ${month}, gastaste ${this.formatMoney(total)} em ${category}.`);
  }

  public topCategory(
    month: string,
    category: string,
    amount: number
  ): string {
    return this.withClosing(`🏆 Em ${month}, gastaste mais em ${category} (${this.formatMoney(amount)}).`);
  }

  public weeklyTotal(total: number): string {
    return this.withClosing(`📅 Esta semana gastaste ${this.formatMoney(total)}.`);
  }

  public todayTotal(total: number): string {
    return this.withClosing(`Hoje já gastaste ${this.formatMoney(total)}.`);
  }

  // =============================
  // ❌ ERRORS / EDGE CASES
  // =============================

  public noData(): string {
    return `Não encontrei despesas para esse período.`;
  }

  public invalidCategory(): string {
    return this.withClosing(`Não percebi a categoria. Podes tentar outra forma?`);
  }

  public invalidDate(): string {
    return this.withClosing(`Não percebi o período. Ex: "abril", "este mês", "últimos 7 dias".`);
  }

  public generalError(): string {
    return this.withClosing(`⚠️ Algo correu mal. Tenta novamente daqui a pouco.`);
  }

  // =============================
  // 🤖 HELP
  // =============================

  public help(): string {
    return this.withClosing(
      `Podes dizer coisas como:\n\n• "12€ almoço"\n• "quanto gastei este mês?"\n• "quanto gastei em comida em abril?"\n• "onde gasto mais?"`
    );
  }
}
