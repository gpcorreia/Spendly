import { Request, Response } from "express";
import { UserRepository } from "../repositories/userRepository";
import { sendMonthlySummaryEmail } from "../services/emailService";
import Excel from "exceljs";


const userRepository = new UserRepository();

const categoryLabels: Record<string, string> = {
  Food: "Alimentação",
  Groceries: "Supermercado",
  Transport: "Transportes",
  Fuel: "Combustível",
  Rent: "Renda",
  Bills: "Contas",
  Shopping: "Compras",
  Entertainment: "Lazer",
  Health: "Saúde",
  Subscriptions: "Subscrições",
  Travel: "Viagens",
  Other: "Outros",
};

const months : Record<number, string> = {
  1: "Janeiro",
  2: "Fevereiro",
  3: "Março",
  4: "Abril",
  5: "Maio",
  6: "Junho",
  7: "Julho",
  8: "Agosto",
  9: "Setembro",  
  10: "Outubro",
  11: "Novembro",
  12: "Dezembro",
};

type MonthlyExpense = {
  description: string;
  amount: string | number;
  category: string;
  expense_date: string;
};

async function buildExcelAttachement(expenses: MonthlyExpense[]): Promise<Buffer> {

  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("Resumo Mensal");

  worksheet.columns = [
    { header: "Descrição", key: "description", width: 25 },
    { header: "Valor", key: "amount", width: 15 },
    { header: "Categoria", key: "category", width: 25 },
    { header: "Data", key: "expense_date", width: 15 },
  ];

  expenses.forEach((expense) => {
    worksheet.addRow({
      description: expense.description,
      amount: expense.amount,
      category: categoryLabels[expense.category] || expense.category,
      expense_date: new Date(expense.expense_date).toLocaleDateString("pt-PT"),
    });
  })

  const buffer = await workbook.xlsx.writeBuffer();
  
  return Buffer.from(buffer);
}

function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function handleMonthlySummaryEmail(
  req: Request,
  res: Response
): Promise<void> {


    try {
      const users = await userRepository.findAllUsers();

      const date = new Date();
      const firstDayOfMonth = formatDateYYYYMMDD(new Date(date.getFullYear(), date.getMonth(), 1));
      const lastDayOfMonth = formatDateYYYYMMDD(new Date(date.getFullYear(), date.getMonth() + 1, 0));
      const month = months[date.getMonth() + 1];

      console.log(`Sending monthly summary emails for period: ${firstDayOfMonth} to ${lastDayOfMonth}`);
      for (const user of users) {
        try {
            
            const expensesUser = await userRepository.findAllExpensesbyUser(user.id, [firstDayOfMonth, lastDayOfMonth]) as MonthlyExpense[];
            
            const expensesByCategory = expensesUser.reduce((acc: Record<string, MonthlyExpense[]>, expense: MonthlyExpense) => {
              const category = expense.category || "Other";
              acc[category] = acc[category] || [];
              acc[category].push(expense);
              return acc;
            }, {});

            const expensesUserSummary = Object.entries(expensesByCategory).map(([category, expenses]) => ({
              category: categoryLabels[category] || category,
              total: expenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
            }));

            const total = expensesUserSummary.reduce((sum, category) => sum + category.total, 0);
            const excelBuffer = await buildExcelAttachement(expensesUser);

            const emailSent = await sendMonthlySummaryEmail({
              to: user.email,
              name: user.name,
              periodLabel: month,
              categories: expensesUserSummary,
              total,
              excelAttachment: {
                filename: `resumo_mensal_${month.toLowerCase()}.xlsx`,
                content: excelBuffer,
                contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              },
            });


            if(!emailSent) {
             console.error("Monthly summary email was not sent.", { usermail: user.email });
            }
        } catch (error) {
            console.error("Failed to send monthly summary email.", {
            userId: user.id,
            email: user.email,
            error,
            });
        }
    }

    res.status(200).send("Emails sent successfully");


    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to process checkout session");
      return;
    }
}

