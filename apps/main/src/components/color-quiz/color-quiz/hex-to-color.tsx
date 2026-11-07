'use client';

import { Badge, Button } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

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
    <div className={styles.root}>
      {/* 正誤と正解の hex をスクリーンリーダーに通知する永続ライブリージョン */}
      <output className={styles.srOnly}>
        {phase === 'result'
          ? `${isCorrect ? '正解' : '不正解'}。正解は #${targetHex} です`
          : ''}
      </output>
      <div className={styles.question}>
        <p className={styles.targetHex}>#{targetHex}</p>
        {phase === 'result' && (
          <p className={styles.verdict}>{isCorrect ? '正解！' : '不正解...'}</p>
        )}
      </div>
      <div aria-label="色の選択肢" className={styles.options} role="radiogroup">
        {options.map((hex, index) => {
          const isSelected = selectedHex === hex;
          const isAnswer = hex === targetHex;
          const showCorrectBadge = phase === 'result' && isAnswer;
          const showWrongBadge = phase === 'result' && isSelected && !isAnswer;
          // result 時は各選択肢の正誤も読み上げに含める（視覚バッジの内容は
          // 親の aria-label に上書きされ SR に届かないため）
          const optionLabel = showCorrectBadge
            ? `#${hex}（正解）`
            : showWrongBadge
              ? `#${hex}（あなたの回答・不正解）`
              : `#${hex}`;

          return (
            <button
              key={hex}
              {...getRadioProps(hex, index)}
              aria-label={optionLabel}
              className={cn(
                styles.option,
                phase === 'question' && styles.selectable,
                isSelected && phase === 'question' && styles.selected,
                showCorrectBadge && styles.correct,
                showWrongBadge && styles.wrong,
              )}
              disabled={phase === 'result'}
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
              {showCorrectBadge && (
                <span className={styles.badge}>
                  <Badge label="正解" tone="success" />
                </span>
              )}
              {showWrongBadge && (
                <span className={styles.badge}>
                  <Badge label="あなたの回答" tone="error" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {phase === 'question' ? (
        <Button
          disabled={selectedHex === null}
          fullWidth
          onClick={handleSubmit}
          size="lg"
        >
          回答する
        </Button>
      ) : (
        <Button
          fullWidth
          onClick={() => {
            focusFirstOptionAfter(handleNext);
          }}
          size="lg"
        >
          次の問題へ
        </Button>
      )}
    </div>
  );
};
