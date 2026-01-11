
export type CategoryType = 
  | 'Auto' 
  | 'Compras' 
  | 'Assistência médica' 
  | 'Cursos' 
  | 'Assinaturas' 
  | 'Alimentação' 
  | 'Faxina' 
  | 'Contas' 
  | 'Transporte' 
  | 'Serviços' 
  | 'Farmácia' 
  | 'Supermercados' 
  | 'Pet' 
  | 'Tabacaria' 
  | 'Psicólogo' 
  | 'Viagens' 
  | 'Outros' 
  | 'Fotografia';

export interface Transaction {
  id: string;
  amount: number;
  category: CategoryType;
  description: string;
  date: string;
  type: 'expense';
}

export interface BudgetGoal {
  category: CategoryType;
  limit: number;
}

export interface AppState {
  transactions: Transaction[];
  budgets: BudgetGoal[];
}

export enum View {
  DASHBOARD = 'dashboard',
  TRANSACTIONS = 'transactions',
  STATS = 'stats',
  AI_ADVISOR = 'ai_advisor'
}
