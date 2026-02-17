'use client';

import { CompletePhase } from './_components/complete-phase';
import { InputPhase } from './_components/input-phase';
import { ReviewPhase } from './_components/review-phase';
import { useProofreadState } from './_state/provider';

export default function JapaneseTextFixer() {
  const { phase } = useProofreadState();

  return (
    <div className="h-full">
      {phase === 'input' && <InputPhase />}
      {phase === 'review' && <ReviewPhase />}
      {phase === 'complete' && <CompletePhase />}
    </div>
  );
}
