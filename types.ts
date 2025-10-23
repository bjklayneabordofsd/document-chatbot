
export type Role = 'home' | 'admin' | 'user';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface QuestionStats {
  [key: string]: number;
}
