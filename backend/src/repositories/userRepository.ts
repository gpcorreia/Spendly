import supabase from '../config/supabase';
import crypto from 'crypto';

export type User = {
  id: string;
  phone_number: string;
  email: string;
  name: string;
  number_id: string;
  timestamp: string;
  payment: boolean;
  access_token: string;
};

export type CreateUserPayload = {
  email: string;
  name: string;
  phone_number: string;
  payment: boolean;
};

export class UserRepository {
  async create(user: CreateUserPayload): Promise<User> {
    const accessToken = crypto.randomUUID();
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: user.email || '',
        name: user.name,
        phone_number: user.phone_number,
        payment: user.payment,
        timestamp: Date.now().toString(),
        access_token: accessToken,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return data;
  }
}
