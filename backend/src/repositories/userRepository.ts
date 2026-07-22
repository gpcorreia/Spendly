import supabase from '../config/supabase';

export type User = {
  id: string;
  phone_number: string;
  email: string;
  name: string;
  number_id: string;
  timestamp: string;
  payment: boolean;
};

export type CreateUserPayload = {
  email: string;
  name: string;
  phone_number: string;
  payment: boolean;
};

export class UserRepository {
  async create(user: CreateUserPayload): Promise<User | "existing"> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: user.email || '',
        name: user.name,
        phone_number: user.phone_number,
        payment: user.payment,
        timestamp: Date.now().toString(),
      })
      .select()
      .single();

    if (error?.code === "23505") {
      return "existing";
    }
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return data;
  }
  
  async findAllUsers(): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name')
      
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data;
  }
  
  async findAllExpensesbyUser(userId: string, [begin, end]: [string, string]): Promise<any> {
    const { data, error } = await supabase
      .from('expenses')
      .select('description,amount,category,expense_date')
      .eq('user_id', userId)
      .gte('expense_date', begin).lte('expense_date', end).order('expense_date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }

    return data;
  }
}
