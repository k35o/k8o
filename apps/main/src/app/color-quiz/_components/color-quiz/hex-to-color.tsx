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

export const HexToColor: FC = () => {
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
      <div className="text-center">
        <p className="font-bold font-mono text-3xl tracking-widest">
          #{targetHex}
        </p>
        {phase === 'result' && (
          <p className="mt-2 font-bold text-lg">
            {isCorrect ? '正解！' : '不正解...'}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {options.map((hex) => {
          const isSelected = selectedHex === hex;
          const isAnswer = hex === targetHex;
          const showCorrectBadge = phase === 'result' && isAnswer;
          const showWrongBadge = phase === 'result' && isSelected && !isAnswer;

          return (
            <button
              aria-label={`色の選択肢: #${hex}`}
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
              key={hex}
              onClick={() => setSelectedHex(hex)}
              style={{ backgroundColor: `#${hex}` }}
              type="button"
            >
              {phase === 'result' && (
                <p
                  className="font-bold text-sm tracking-wider"
                  style={{
                    color: getContrastTextColor(hex),
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
        <Button fullWidth onClick={handleNext} size="lg">
          次の問題へ
        </Button>
      )}
    </div>
  );
};
