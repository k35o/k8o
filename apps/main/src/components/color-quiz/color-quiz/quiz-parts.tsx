import { Button } from '@k8ordo/ui';
import type { FC } from 'react';

import type { QuizPhase } from './use-color-quiz';

import styles from './quiz-parts.module.css';

type QuizOptionState = {
  selectable: boolean;
  selected: boolean;
  correct: boolean;
  wrong: boolean;
  label: string;
};

export const quizOptionState = (
  hex: string,
  {
    targetHex,
    selectedHex,
    phase,
  }: { targetHex: string; selectedHex: string | null; phase: QuizPhase },
): QuizOptionState => {
  const isSelected = selectedHex === hex;
  const isAnswer = hex === targetHex;
  const correct = phase === 'result' && isAnswer;
  const wrong = phase === 'result' && isSelected && !isAnswer;
  return {
    selectable: phase === 'question',
    selected: phase === 'question' && isSelected,
    correct,
    wrong,
    // 視覚バッジの内容は親の aria-label に上書きされ SR に届かないので、正誤をラベルに含める
    label: correct
      ? `#${hex}（正解）`
      : wrong
        ? `#${hex}（あなたの回答・不正解）`
        : `#${hex}`,
  };
};

// 正誤と正解の hex をスクリーンリーダーに通知する永続ライブリージョン
export const QuizAnnouncement: FC<{
  phase: QuizPhase;
  isCorrect: boolean;
  targetHex: string;
}> = ({ phase, isCorrect, targetHex }) => (
  <output className={styles.srOnly}>
    {phase === 'result'
      ? `${isCorrect ? '正解' : '不正解'}。正解は #${targetHex} です`
      : ''}
  </output>
);

export const QuizActions: FC<{
  phase: QuizPhase;
  canSubmit: boolean;
  onSubmit: () => void;
  onNext: () => void;
}> = ({ phase, canSubmit, onSubmit, onNext }) =>
  phase === 'question' ? (
    <Button disabled={!canSubmit} fullWidth onClick={onSubmit} size="lg">
      回答する
    </Button>
  ) : (
    <Button fullWidth onClick={onNext} size="lg">
      次の問題へ
    </Button>
  );
