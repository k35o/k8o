'use client';

import { Badge, Button } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import { useColorQuiz } from './use-color-quiz';
import { useQuizRadioGroup } from './use-quiz-radio-group';

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
    <div className="flex flex-col gap-6">
      {/* 正誤と正解の hex をスクリーンリーダーに通知する永続ライブリージョン */}
      <output className="sr-only">
        {phase === 'result'
          ? `${isCorrect ? '正解' : '不正解'}。正解は #${targetHex} です`
          : ''}
      </output>
      <div className="text-center">
        <p className="font-mono text-3xl font-bold tracking-normal">
          #{targetHex}
        </p>
        {phase === 'result' && (
          <p className="mt-2 text-lg font-bold">
            {isCorrect ? '正解！' : '不正解...'}
          </p>
        )}
      </div>
      <div
        aria-label="色の選択肢"
        className="grid grid-cols-2 gap-4"
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
              className={[
                'relative flex h-28 items-center justify-center rounded-xl transition-all',
                isSelected && phase === 'question'
                  ? 'ring-4 ring-primary-border'
                  : '',
                showCorrectBadge ? 'ring-4 ring-border-success' : '',
                showWrongBadge ? 'ring-4 ring-border-error' : '',
                phase === 'question' ? 'cursor-pointer hover:opacity-80' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={phase === 'result'}
              onClick={() => {
                setSelectedHex(hex);
              }}
              style={{ backgroundColor: `#${hex}` }}
              type="button"
            >
              {phase === 'result' && (
                <p
                  className="text-sm font-bold tracking-normal"
                  style={{
                    color: `contrast-color(#${hex})`,
                  }}
                >
                  #{hex}
                </p>
              )}
              {showCorrectBadge && (
                <span className="absolute top-2 right-2">
                  <Badge text="正解" tone="success" />
                </span>
              )}
              {showWrongBadge && (
                <span className="absolute top-2 right-2">
                  <Badge text="あなたの回答" tone="error" />
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
