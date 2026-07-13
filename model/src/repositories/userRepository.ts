import supabase from '../config/supabase';
import type { User, UserPayload } from '../types';

export type { User, UserPayload };

export class UserRepository {

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('payment', true || 'true')
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
      console.error('Error creating user:', error);
      throw error;
    }

    return data;
  }

  async findUser(payload: UserPayload): Promise<  User | null> {
    let user = await this.findByPhoneNumber(payload.phoneNumber);
    if (!user) {
      return null;
    }
    return user;
  }
  
  async findIfActivate(user_id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single();

    console.log('findIfActivate result:', { data, error });
    if (error) {
      console.error('Error finding user:', error);
      throw error;
    }

    if (!data || !data.access_token) {
      throw new Error('User not activated');
      
    }
  
    return data as User;
  }
}
