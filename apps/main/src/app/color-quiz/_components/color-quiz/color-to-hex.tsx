'use client';

import { Button, Card, FormControl, TextField } from '@k8o/arte-odyssey';
import { type ChangeEventHandler, type FC, useCallback, useState } from 'react';
import {
  accuracyScore,
  generateRandomHex,
  getContrastTextColor,
  getScoreMessage,
  isValidHex,
} from '../../_utils/color-quiz';

type Phase = 'question' | 'result';

export const ColorToHex: FC = () => {
  const [targetHex, setTargetHex] = useState(() => generateRandomHex());
  const [userInput, setUserInput] = useState('');
  const [phase, setPhase] = useState<Phase>('question');

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const value = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
      setUserInput(value);
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (!isValidHex(userInput)) return;
    setPhase('result');
  }, [userInput]);

  const handleNext = useCallback(() => {
    setTargetHex(generateRandomHex());
    setUserInput('');
    setPhase('question');
  }, []);

  if (phase === 'result') {
    const score = accuracyScore(userInput, targetHex);
    const message = getScoreMessage(score);

    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <p className="font-bold text-4xl">{score}%</p>
          <p className="mt-1 text-fg-mute text-lg">{message}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-center text-fg-mute text-sm">あなたの回答</p>
            <div
              className="flex h-32 items-center justify-center rounded-xl"
              style={{ backgroundColor: `#${userInput}` }}
            >
              <p
                className="font-bold text-lg tracking-wider"
                style={{ color: getContrastTextColor(userInput) }}
              >
                #{userInput}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-center text-fg-mute text-sm">正解</p>
            <div
              className="flex h-32 items-center justify-center rounded-xl"
              style={{ backgroundColor: `#${targetHex}` }}
            >
              <p
                className="font-bold text-lg tracking-wider"
                style={{ color: getContrastTextColor(targetHex) }}
              >
                #{targetHex}
              </p>
            </div>
          </div>
        </div>
        <Button fullWidth onClick={handleNext} size="lg">
          次の問題へ
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex h-48 w-full items-center justify-center rounded-xl"
        style={{ backgroundColor: `#${targetHex}` }}
      >
        <p
          className="font-bold text-2xl tracking-wider"
          style={{ color: getContrastTextColor(targetHex) }}
        >
          ?
        </p>
      </div>
      <Card>
        <div className="p-5">
          <FormControl
            label="この色のHexコードは？"
            renderInput={({ labelId: _, ...props }) => (
              <div className="flex w-full items-center gap-2">
                <span className="text-fg-mute">#</span>
                <TextField
                  {...props}
                  onChange={handleChange}
                  placeholder="例: ff5733"
                  value={userInput}
                />
              </div>
            )}
          />
        </div>
      </Card>
      <Button
        disabled={!isValidHex(userInput)}
        fullWidth
        onClick={handleSubmit}
        size="lg"
      >
        回答する
      </Button>
    </div>
  );
};
