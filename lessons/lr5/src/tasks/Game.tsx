import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { gameStore } from '../stores/gameStore';

interface GameScreenProps {
  theme: string;
  toggleTheme: () => void;
  onNext: () => void;
}

export const GameScreen = observer(
  ({ theme, toggleTheme, onNext }: GameScreenProps) => {
    const {
      currentQuestion,
      selectedAnswers,
      essayAnswer,
      setEssayAnswer,
      selectAnswer,
      score,
      progress,
      currentQuestionIndex,
      questions,
      isLastQuestion,
    } = gameStore;

    if (!currentQuestion) return null;

    const canProceed = () => {
      if (currentQuestion.type === 'essay') {
        return essayAnswer?.trim().length > 0;
      }
      return selectedAnswers.length > 0;
    };

    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            Вопрос {currentQuestionIndex + 1} из {questions.length}
          </div>

          <h2 className="text-2xl font-bold mb-6">
            {currentQuestion.question}
          </h2>

          {currentQuestion.type === 'essay' ? (
            <textarea
              value={essayAnswer || ''}
              onChange={(e) => setEssayAnswer(e.target.value)}
              className="w-full p-4 border rounded-lg"
            />
          ) : (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  className="w-full p-4 border rounded-lg"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {canProceed() && (
            <button
              onClick={onNext}
              className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg"
            >
              {isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
            </button>
          )}
        </div>
      </div>
    );
  }
);