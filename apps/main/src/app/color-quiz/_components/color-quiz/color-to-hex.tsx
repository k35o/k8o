'use client';

import { Badge, Button } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import { getContrastTextColor } from '../../_utils/color-quiz';
import { useColorQuiz } from './use-color-quiz';

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

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex h-48 w-full items-center justify-center rounded-xl"
        style={{ backgroundColor: `#${targetHex}` }}
      >
        {phase === 'result' && (
          <p
            className="text-lg font-bold tracking-wider"
            style={{ color: getContrastTextColor(targetHex) }}
          >
            #{targetHex}
          </p>
        )}
      </div>
      {phase === 'result' && (
        <div className="text-center">
          <p className="text-lg font-bold">
            {isCorrect ? '正解！' : '不正解...'}
          </p>
          {selectedHex !== null && !isCorrect && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-fg-mute text-center text-sm">あなたの回答</p>
                <div
                  className="flex h-24 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `#${selectedHex}` }}
                >
                  <p
                    className="text-sm font-bold tracking-wider"
                    style={{
                      color: getContrastTextColor(selectedHex),
                    }}
                  >
                    #{selectedHex}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-fg-mute text-center text-sm">正解</p>
                <div
                  className="flex h-24 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `#${targetHex}` }}
                >
                  <p
                    className="text-sm font-bold tracking-wider"
                    style={{
                      color: getContrastTextColor(targetHex),
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
      <div className="grid grid-cols-2 gap-4">
        {options.map((hex) => {
          const isSelected = selectedHex === hex;
          const isAnswer = hex === targetHex;
          const showCorrectBadge = phase === 'result' && isAnswer;
          const showWrongBadge = phase === 'result' && isSelected && !isAnswer;

          return (
            <button
              aria-label={`Hexの選択肢: #${hex}`}
              className={[
                'relative flex h-14 items-center justify-center rounded-xl border border-border-base font-mono text-sm tracking-wider transition-all',
                'bg-bg-base',
                isSelected && phase === 'question'
                  ? 'ring-2 ring-primary-border'
                  : '',
                showCorrectBadge ? 'ring-2 ring-border-success' : '',
                showWrongBadge ? 'ring-2 ring-border-error' : '',
                phase === 'question' ? 'cursor-pointer hover:bg-bg-mute' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={phase === 'result'}
              key={hex}
              onClick={() => {
                setSelectedHex(hex);
              }}
              type="button"
            >
              #{hex}
              {showCorrectBadge && (
                <span className="absolute top-1 right-1">
                  <Badge size="sm" text="正解" tone="success" />
                </span>
              )}
              {showWrongBadge && (
                <span className="absolute top-1 right-1">
                  <Badge size="sm" text="あなたの回答" tone="error" />
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
        <Button fullWidth onClick={handleNext} size="lg">
          次の問題へ
        </Button>
      )}
    </div>
  );
};
