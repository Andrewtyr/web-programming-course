export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: string;
  /** с сервера (SessionResponse), для локальной игры не обязательно */
  maxPoints?: number;
}

export interface Answer {
  questionId: string;
  selectedAnswers: number[];
  isCorrect: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

export type Theme = 'light' | 'dark';