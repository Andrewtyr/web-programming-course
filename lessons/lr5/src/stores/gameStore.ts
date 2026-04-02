import { makeAutoObservable, runInAction, action } from 'mobx';
import type { Question, Answer } from '../types/quiz';

/** Фрагмент превью вопроса с сервера (без generated-клиента). */
type QuestionPreviewLike = {
  id: string;
  question: string;
  options?: string[];
  type: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

function apiBase(): string {
  return (
    (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
    'http://localhost:3001'
  );
}

/**
 * Игра с бэкендом (LR8 quiz-backend + OpenAPI LR5).
 * Ответ на вопрос: POST /api/sessions/:id/answers — не путать с POST .../submit (завершение теста).
 */
class GameStore {
  gameStatus: 'idle' | 'playing' | 'finished' = 'idle';
  questions: Question[] = [];
  currentQuestionIndex = 0;
  score = 0;
  correctAnswersCount = 0;
  selectedAnswers: number[] = [];
  essayAnswer = '';
  answeredQuestions: Answer[] = [];
  timeLeft = 30;
  timer: ReturnType<typeof setInterval> | null = null;
  sessionId: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  /** Создать сессию на сервере и загрузить вопросы (SessionResponse). */
  async createSession(questionCount = 5, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('Нет токена (auth_token) — сначала войдите');
      return;
    }

    try {
      const res = await fetch(`${apiBase()}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questionCount, difficulty }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Создание сессии: ${res.status} ${t}`);
      }

      const data = (await res.json()) as {
        sessionId: string;
        questions?: Array<{
          id: string;
          question: string;
          options?: string[];
          type: string;
          difficulty?: string;
          maxPoints?: number;
        }>;
      };

      runInAction(() => {
        this.sessionId = data.sessionId;
        this.questions = (data.questions ?? []).map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options ?? [],
          type: q.type,
          difficulty: (q.difficulty as Question['difficulty']) ?? 'medium',
          correctAnswer: -1,
          maxPoints: q.maxPoints,
        }));
        this.currentQuestionIndex = 0;
      });
    } catch (e) {
      console.error('createSession:', e);
    }
  }

  /** Старт игры после createSession (вопросы уже в store). */
  startGame() {
    if (!this.questions.length) return;

    runInAction(() => {
      this.gameStatus = 'playing';
      this.score = 0;
      this.correctAnswersCount = 0;
      this.currentQuestionIndex = 0;
      this.selectedAnswers = [];
      this.essayAnswer = '';
      this.answeredQuestions = [];
      this.startTimer();
    });
  }

  /** Локальный режим / тесты: передать вопросы без API. */
  startGameWithQuestions(items: QuestionPreviewLike[]) {
    runInAction(() => {
      this.sessionId = null;
      this.questions = items.map((item) => ({
        ...item,
        correctAnswer: -1,
        options: item.options ?? [],
        question: item.question,
        type: item.type,
        difficulty: item.difficulty ?? 'medium',
      })) as Question[];
      this.gameStatus = 'playing';
      this.score = 0;
      this.correctAnswersCount = 0;
      this.currentQuestionIndex = 0;
      this.selectedAnswers = [];
      this.essayAnswer = '';
      this.answeredQuestions = [];
    });
  }

  startTimer() {
    this.stopTimer();
    runInAction(() => {
      this.timeLeft = 30;
    });
    this.timer = setInterval(
      action(() => {
        runInAction(() => {
          this.timeLeft--;
          if (this.timeLeft <= 0) {
            this.stopTimer();
            void this.nextQuestion();
          }
        });
      }),
      1000
    );
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Переключение варианта (multiple-select). */
  toggleAnswer(index: number) {
    if (this.selectedAnswers.includes(index)) {
      this.selectedAnswers = this.selectedAnswers.filter((i) => i !== index);
    } else {
      this.selectedAnswers = [...this.selectedAnswers, index];
    }
  }

  /** Совместимость с Game.tsx / тестами — то же, что toggleAnswer. */
  selectAnswer(answerIndex: number) {
    if (!this.sessionId) {
      this.legacyLocalSelect(answerIndex);
      return;
    }
    this.toggleAnswer(answerIndex);
  }

  /** Локальная логика, если сессии нет (старые задания). */
  private legacyLocalSelect(answerIndex: number) {
    if (this.gameStatus !== 'playing') return;
    if (this.selectedAnswers.includes(answerIndex)) {
      this.selectedAnswers = this.selectedAnswers.filter((i) => i !== answerIndex);
    } else {
      this.selectedAnswers.push(answerIndex);
    }
    const currentQuestion = this.currentQuestion;
    if (!currentQuestion) return;
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    if (isCorrect) {
      this.score += this.getPointsForDifficulty(currentQuestion.difficulty);
    }
    this.answeredQuestions.push({
      questionId: currentQuestion.id,
      selectedAnswers: [...this.selectedAnswers],
      isCorrect,
    });
  }

  setEssayAnswer(text: string) {
    this.essayAnswer = text;
  }

  /** Отправка ответа на текущий вопрос — только POST .../answers */
  async submitCurrentAnswer() {
    if (!this.currentQuestion || !this.sessionId) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const q = this.currentQuestion;
    const payload: Record<string, unknown> = { questionId: q.id };
    if (q.type === 'essay') {
      payload.text = this.essayAnswer.trim();
    } else {
      payload.selectedOptions = [...this.selectedAnswers];
    }

    const url = `${apiBase()}/api/sessions/${this.sessionId}/answers`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      type AnswerResultJson = {
        pointsEarned?: number;
        status?: string;
        maxPoints?: number;
      }
      let result: AnswerResultJson | null = null;
      try {
        result = JSON.parse(text) as AnswerResultJson;
      } catch {
        /* не JSON */
      }

      if (!res.ok) {
        console.error('answers:', res.status, text);
        return;
      }

      runInAction(() => {
        if (result?.pointsEarned != null) {
          this.score += result.pointsEarned;
        }
        if (result?.status === 'correct') {
          this.correctAnswersCount++;
        }
      });
    } catch (e) {
      console.error('submitCurrentAnswer:', e);
    }
  }

  async nextQuestion() {
    await this.submitCurrentAnswer();

    runInAction(() => {
      this.selectedAnswers = [];
      this.essayAnswer = '';
    });

    if (this.isLastQuestion) {
      await this.finishGame();
      return;
    }

    runInAction(() => {
      this.currentQuestionIndex++;
      this.startTimer();
    });
  }

  /** Завершение сессии — только POST .../submit (пустое тело). */
  async finishGame() {
    const sid = this.sessionId;
    const token = localStorage.getItem('auth_token');

    this.stopTimer();

    if (sid && token) {
      try {
        const res = await fetch(`${apiBase()}/api/sessions/${sid}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });

        if (res.ok) {
          const result = (await res.json()) as {
            score?: { earned?: number };
          };
          runInAction(() => {
            if (result.score?.earned != null) {
              this.score = result.score.earned;
            }
          });
        } else {
          console.error('submit session:', await res.text());
        }
      } catch (e) {
        console.error('finishGame:', e);
      }
    }

    runInAction(() => {
      this.gameStatus = 'finished';
      this.sessionId = null;
    });
  }

  resetGame() {
    this.stopTimer();
    runInAction(() => {
      this.gameStatus = 'idle';
      this.questions = [];
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.correctAnswersCount = 0;
      this.selectedAnswers = [];
      this.essayAnswer = '';
      this.answeredQuestions = [];
      this.sessionId = null;
      this.timeLeft = 30;
    });
  }

  private getPointsForDifficulty(difficulty: string): number {
    switch (difficulty) {
      case 'easy':
        return 10;
      case 'medium':
        return 20;
      case 'hard':
        return 30;
      default:
        return 10;
    }
  }

  get currentQuestion(): Question | null {
    return this.questions[this.currentQuestionIndex] ?? null;
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }
}

export const gameStore = new GameStore();
