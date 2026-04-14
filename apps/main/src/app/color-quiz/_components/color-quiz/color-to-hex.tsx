'use client';

import { Badge, Button } from '@k8o/arte-odyssey';
import { type FC, useCallback, useMemo, useState } from 'react';
import {
  generateDistractors,
  generateRandomHex,
  getContrastTextColor,
  shuffleArray,
} from '../../_utils/color-quiz';

type Phase = 'question' | 'result';

const OPTION_COUNT = 4;

export const ColorToHex: FC = () => {
  const [targetHex, setTargetHex] = useState(() => generateRandomHex());
  const [selectedHex, setSelectedHex] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('question');

  const options = useMemo(() => {
    const distractors = generateDistractors(targetHex, OPTION_COUNT - 1);
    return shuffleArray([targetHex, ...distractors]);
  }, [targetHex]);

  const handleSubmit = useCallback(() => {
    if (selectedHex === null) return;
    setPhase('result');
  }, [selectedHex]);

  const handleNext = useCallback(() => {
    setTargetHex(generateRandomHex());
    setSelectedHex(null);
    setPhase('question');
  }, []);

  const isCorrect = selectedHex === targetHex;

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex h-48 w-full items-center justify-center rounded-xl"
        style={{ backgroundColor: `#${targetHex}` }}
      >
        {phase === 'result' && (
          <p
            className="font-bold text-lg tracking-wider"
            style={{ color: getContrastTextColor(targetHex) }}
          >
            #{targetHex}
          </p>
        )}
      </div>
      {phase === 'result' && (
        <div className="text-center">
          <p className="font-bold text-lg">
            {isCorrect ? '正解！' : '不正解...'}
          </p>
          {selectedHex !== null && !isCorrect && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-center text-fg-mute text-sm">あなたの回答</p>
                <div
                  className="flex h-24 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `#${selectedHex}` }}
                >
                  <p
                    className="font-bold text-sm tracking-wider"
                    style={{
                      color: getContrastTextColor(selectedHex),
                    }}
                  >
                    #{selectedHex}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-center text-fg-mute text-sm">正解</p>
                <div
                  className="flex h-24 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `#${targetHex}` }}
                >
                  <p
                    className="font-bold text-sm tracking-wider"
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
              className={[
                'relative flex h-14 items-center justify-center rounded-xl border border-border-base font-mono text-sm tracking-wider transition-all',
                isSelected && phase === 'question'
                  ? 'bg-primary-bg-subtle ring-2 ring-primary-border'
                  : 'bg-bg-base',
                showCorrectBadge
                  ? 'bg-bg-success ring-2 ring-border-success'
                  : '',
                showWrongBadge ? 'bg-bg-error ring-2 ring-border-error' : '',
                phase === 'question' ? 'cursor-pointer hover:bg-bg-mute' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={phase === 'result'}
              key={hex}
              onClick={() => setSelectedHex(hex)}
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
