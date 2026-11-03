'use client';

import { Badge, Button } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

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
    <div className={styles.root}>
      {/* 正誤と正解の hex をスクリーンリーダーに通知する永続ライブリージョン */}
      <output className={styles.srOnly}>
        {phase === 'result'
          ? `${isCorrect ? '正解' : '不正解'}。正解は #${targetHex} です`
          : ''}
      </output>
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
              type="button"
            >
              #{hex}
              {showCorrectBadge && (
                <span className={styles.badge}>
                  <Badge size="sm" label="正解" tone="success" />
                </span>
              )}
              {showWrongBadge && (
                <span className={styles.badge}>
                  <Badge size="sm" label="あなたの回答" tone="error" />
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
