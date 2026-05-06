import supabase from '../config/supabase';
import { ExpenseRepository }    from './expenseRepository';

export type User = {
  id: string;
  phone_number: string;
  email: string;
  name: string;
  number_id: string;
  timestamp: string;
};

export type UserPayload = {
  phoneNumber: string;
  email?: string;
  name: string;
  number_id: string;
  timestamp: string;
};

export class UserRepository {

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  async create(payload: UserPayload): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        phone_number: payload.phoneNumber,
        email: payload.email || '',
        name: payload.name,
        number_id: payload.number_id,
        timestamp: payload.timestamp,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async findOrCreate(payload: UserPayload): Promise<User> {
    let user = await this.findByPhoneNumber(payload.phoneNumber);
    if (!user) {
      user = await this.create(payload);
    }
    return user;
  }
}
