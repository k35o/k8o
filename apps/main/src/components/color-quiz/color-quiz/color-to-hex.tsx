'use client';

import { Badge, Stack } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import { QuizActions, QuizAnnouncement, quizOptionState } from './quiz-parts';
import { useColorQuiz } from './use-color-quiz';
import { useQuizRadioGroup } from './use-quiz-radio-group';

import styles from './color-to-hex.module.css';

export const ColorToHex: FC = () => {
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
      <div
        className={styles.target}
        style={{ backgroundColor: `#${targetHex}` }}
      >
        {phase === 'result' && (
          <p
            className={styles.targetHex}
            style={{ color: `contrast-color(#${targetHex})` }}
          >
            #{targetHex}
          </p>
        )}
      </div>
      {phase === 'result' && (
        <div className={styles.result}>
          <p className={styles.verdict}>{isCorrect ? '正解！' : '不正解...'}</p>
          {selectedHex !== null && !isCorrect && (
            <div className={styles.comparison}>
              <div className={styles.comparisonItem}>
                <p className={styles.comparisonLabel}>あなたの回答</p>
                <div
                  className={styles.swatch}
                  style={{ backgroundColor: `#${selectedHex}` }}
                >
                  <p
                    className={styles.swatchHex}
                    style={{
                      color: `contrast-color(#${selectedHex})`,
                    }}
                  >
                    #{selectedHex}
                  </p>
                </div>
              </div>
              <div className={styles.comparisonItem}>
                <p className={styles.comparisonLabel}>正解</p>
                <div
                  className={styles.swatch}
                  style={{ backgroundColor: `#${targetHex}` }}
                >
                  <p
                    className={styles.swatchHex}
                    style={{
                      color: `contrast-color(#${targetHex})`,
                    }}
                  >
                    #{targetHex}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div
        aria-label="Hexの選択肢"
        className={styles.options}
        role="radiogroup"
      >
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
              type="button"
            >
              #{hex}
              {state.correct && (
                <span className={styles.badge}>
                  <Badge size="sm" label="正解" tone="success" />
                </span>
              )}
              {state.wrong && (
                <span className={styles.badge}>
                  <Badge size="sm" label="あなたの回答" tone="error" />
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
