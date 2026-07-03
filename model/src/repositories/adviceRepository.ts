import supabase from '../config/supabase';

const CONTEXT_TABLE = 'conversation_contexts';
const ADVICE_CONTEXT = 'advice';
const CONTEXT_TTL_MS = 30 * 60 * 1000;

export type AdviceContext = {
  context_summary: string;
  expires_at: string;
};

export class AdviceRepository {
  async set_context_advice(userId: string, contextSummary: string): Promise<AdviceContext> {
    const expiresAt = new Date(Date.now() + CONTEXT_TTL_MS).toISOString();

    const { data, error } = await supabase
      .from(CONTEXT_TABLE)
      .upsert(
        {
          user_id: userId,
          context_type: ADVICE_CONTEXT,
          context_summary: contextSummary,
          expires_at: expiresAt,
        },
        { onConflict: 'user_id,context_type' },
      )
      .select('context_summary, expires_at')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async get_context_advice(userId: string): Promise<AdviceContext | null> {
    const { data, error } = await supabase
      .from(CONTEXT_TABLE)
      .select('context_summary, expires_at')
      .eq('user_id', userId)
      .eq('context_type', ADVICE_CONTEXT)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    if (new Date(data.expires_at).getTime() <= Date.now()) {
      await this.delete_context_advice(userId);
      return null;
    }

    return data;
  }

  async delete_context_advice(userId: string): Promise<void> {
    const { error } = await supabase
      .from(CONTEXT_TABLE)
      .delete()
      .eq('user_id', userId)
      .eq('context_type', ADVICE_CONTEXT);

    if (error) {
      throw error;
    }
  }
}
