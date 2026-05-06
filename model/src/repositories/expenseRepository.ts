  import { AIResponse } from '../aiMockResponses';
import supabase  from '../config/supabase';

export class ExpenseRepository {


  async findByUserId(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

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
      .gte('transaction_date', startDate.toISOString().split('T')[0]);
 
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
        description: expense.args.description,
        created_at: expense.args.date || new Date().toISOString().split('T')[0],
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
    .select('category, amount, created_at')
    .eq('user_id', userId).gte('created_at', begin).lte('created_at', end);    

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

    const { data, error } = await supabase
    .from('expenses')
    .select('category, amount, created_at').like('category', `%${expense.args.category}%`)
    .eq('user_id', userId).gte('created_at', begin).lte('created_at', end);    

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
  
  async get_days_spending_month(userId:string,expense: AIResponse): Promise<any> {
    const begin = expense.args.start_date;
    const end = expense.args.end_date;

    const { data, error } = await supabase
    .from('expenses')
    .select('description, amount')
    .eq('user_id', userId).gte('created_at', begin).lte('created_at', end).order('created_at', { ascending: true });
    
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
      .delete()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1) 
    
    if (error) {
      throw error; 
    }

    return 0;
  }
  
  async get_saving_advice(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('expenses')
      .select('description,category, amount')
      .eq('user_id', userId)
      .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 60)).toISOString().split('T')[0]);

    if (error) {
      throw error; 
    }
  
    return data;
  }
}
