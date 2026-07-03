import supabase  from '../config/supabase';
import type { AIResponse } from '../types';

export class ExpenseRepository {


  async findByUserId(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('expense_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async getSummary(userId: string, period: 'today' | 'week' | 'month'): Promise<{
    total_spent: number;
    category_breakdown: Record<string, number>;
  }> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('amount, category')
      .eq('user_id', userId)
      .gte('expense_date', startDate.toISOString().split('T')[0]);
 
    if (error) {
      throw error;
    }

    const summary = {
      total_spent: 0,
      category_breakdown: {} as Record<string, number>,
    };

    return summary;
  }

  async createExpense(userId: string, expense: any): Promise<any> {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        amount: expense.args.amount,
        category: expense.args.category,
        expense_date: expense.args.date,
        description: expense.args.description
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }


  async get_category_spending(userId:string,expense: AIResponse): Promise<any> {
    const begin = expense.args.start_date;
    const end = expense.args.end_date;

    const { data, error } = await supabase
    .from('expenses')
    .select('category, amount, expense_date')
    .eq('user_id', userId).gte('expense_date', begin).lte('expense_date', end);    

    if (error) throw error;
    let total = 0;
    const result = data.reduce((acc: any, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = 0;
      }
      acc[curr.category] += Number(curr.amount);
      total += Number(curr.amount);
      
      return acc;
    }, {});

    return {total,result};
  }
  
  async get_specific_category_spending(userId:string,expense: AIResponse): Promise<any> {
    const begin = expense.args.start_date;
    const end = expense.args.end_date;
    let list_of_expenses: { description: string; amount: string; date: string; }[] = [];

    const { data, error } = await supabase
    .from('expenses')
    .select('*').eq('category', expense.args.category)
    .eq('user_id', userId).gte('expense_date', begin).lte('expense_date', end);    

    if (error) throw error;
    let total = 0;
    const result = data.reduce((acc: any, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = 0;
      }
      acc[curr.category] += Number(curr.amount);
      total += Number(curr.amount);
      
      list_of_expenses.push({
        description: curr.description,
        amount: curr.amount,
        date: curr.expense_date
      });
      
      return acc;
    }, {});

    return {total,list_of_expenses,result};
  }
  
  async get_days_spending_month(userId:string,expense: AIResponse): Promise<any> {
    const begin = expense.args.start_date;
    const end = expense.args.end_date;

    const { data, error } = await supabase
    .from('expenses')
    .select('description, amount')
    .eq('user_id', userId).gte('expense_date', begin).lte('expense_date', end).order('expense_date', { ascending: true });
    
    console.log('Expenses from DB:', data, 'Error:', error);
    if (error) {
      throw error;
    }

    const total = data.reduce((sum, item) => sum + Number(item.amount), 0);

    return { total,data };
  }
  

  async delete_last_expense(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('expenses')
      .select("*")
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1) 

      if(!data || data.length === 0) {
        console.log('No expenses found for user:', userId);
        return 0;
      }
      // 2. apagar exatamente essa despesa pelo id
    const { data: lastExpense,error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', data[0]?.id).eq('user_id', userId).select();

    if (deleteError) {
      throw deleteError;
    }

    return lastExpense;

  }
  
  async delete_expense(userId: string, expense: AIResponse): Promise<any> {
    
    const { data, error } = await supabase
      .from('expenses')
      .select("*")
      .eq('user_id', userId)
      .eq('expense_date', expense.args.date)
      .ilike('description', `%${expense.args.description}%`)
      .order('created_at', { ascending: false })
      .limit(1) 

    if (error) {
      throw error;
    }

    if(!data || data.length === 0) {
      console.log('No expenses found for user:', userId);
      return 0;
    }

    // 2. apagar exatamente essa despesa pelo id
    const { data: lastExpense,error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', data[0]?.id).eq('user_id', userId)
      .select();

    if (deleteError) {
      throw deleteError;
    }

    return lastExpense;

  }
  
  async get_user_data_advice(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('expenses')
      .select('description,category, amount')
      .eq('user_id', userId)
      .gte('expense_date', new Date(new Date().setDate(new Date().getDate() - 60)).toISOString().split('T')[0]);

    if (error) {
      throw error; 
    }
  
    return data;
  }
  
}
