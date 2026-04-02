import { observer } from 'mobx-react-lite';
import { gameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import * as React from 'react';

import { StartScreen } from '../tasks/StartScreen';
import { FinishScreen } from '../tasks/FinishScreen';
import { GameScreen } from '../tasks/Game';

const Task4 = observer(() => {
  const { gameStatus, score, correctAnswersCount, questions } =
    gameStore;

  const theme = useUIStore((s) => s.theme);
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const handleStart = () => {
    // логика старта (API + startGame)
  };

  const handleNext = () => {
    // логика отправки ответа
  };

  if (gameStatus === 'idle') {
    return (
      <StartScreen
        theme={theme}
        soundEnabled={soundEnabled}
        toggleTheme={toggleTheme}
        onStart={handleStart}
      />
    );
  }

  if (gameStatus === 'finished') {
    return (
      <FinishScreen
        theme={theme}
        score={score}
        correctAnswers={correctAnswersCount}
        totalQuestions={questions.length}
        onRestart={() => gameStore.resetGame()}
      />
    );
  }

  return (
    <GameScreen
      theme={theme}
      toggleTheme={toggleTheme}
      onNext={handleNext}
    />
  );
});

export default Task4;