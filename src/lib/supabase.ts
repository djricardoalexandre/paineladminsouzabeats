import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for the database tables
export interface RadioCadastrada {
  id: string;
  nome_radio: string;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  frequencia: string | null;
  site: string | null;
  responsavel: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SolicitacaoOrcamento {
  id: string;
  nome_cliente: string;
  email: string;
  telefone: string | null;
  empresa: string | null;
  servico_solicitado: string;
  descricao: string | null;
  valor_estimado: number | null;
  status: string;
  data_solicitacao: string;
  data_resposta: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}
