'use client';

import { Badge, Stack } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import { QuizActions, QuizAnnouncement, quizOptionState } from './quiz-parts';
import { useColorQuiz } from './use-color-quiz';
import { useQuizRadioGroup } from './use-quiz-radio-group';

import styles from './hex-to-color.module.css';

export const HexToColor: FC = () => {
  const {
    targetHex,
    selectedHex,
    setSelectedHex,
    phase,
    options,
    isCorrect,
    handleSubmit,
    handleNext,
  } = useColorQuiz();
  const { getRadioProps, focusFirstOptionAfter } = useQuizRadioGroup({
    options,
    selectedHex,
    onSelect: setSelectedHex,
  });

  return (
    <Stack gap="lg">
      <QuizAnnouncement
        isCorrect={isCorrect}
        phase={phase}
        targetHex={targetHex}
      />
      <div className={styles.question}>
        <p className={styles.targetHex}>#{targetHex}</p>
        {phase === 'result' && (
          <p className={styles.verdict}>{isCorrect ? '正解！' : '不正解...'}</p>
        )}
      </div>
      <div aria-label="色の選択肢" className={styles.options} role="radiogroup">
        {options.map((hex, index) => {
          const state = quizOptionState(hex, {
            targetHex,
            selectedHex,
            phase,
          });

          return (
            <button
              key={hex}
              {...getRadioProps(hex, index)}
              aria-label={state.label}
              className={cn(
                styles.option,
                state.selectable && styles.selectable,
                state.selected && styles.selected,
                state.correct && styles.correct,
                state.wrong && styles.wrong,
              )}
              disabled={!state.selectable}
              onClick={() => {
                setSelectedHex(hex);
              }}
              style={{ backgroundColor: `#${hex}` }}
              type="button"
            >
              {phase === 'result' && (
                <p
                  className={styles.optionHex}
                  style={{
                    color: `contrast-color(#${hex})`,
                  }}
                >
                  #{hex}
                </p>
              )}
              {state.correct && (
                <span className={styles.badge}>
                  <Badge label="正解" tone="success" />
                </span>
              )}
              {state.wrong && (
                <span className={styles.badge}>
                  <Badge label="あなたの回答" tone="error" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <QuizActions
        canSubmit={selectedHex !== null}
        onNext={() => {
          focusFirstOptionAfter(handleNext);
        }}
        onSubmit={handleSubmit}
        phase={phase}
      />
    </Stack>
  );
};
