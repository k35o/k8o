import { useCallback, useMemo, useState } from 'react';

import {
  generateDistractors,
  generateRandomHex,
  shuffleArray,
} from '../../_utils/color-quiz';

type Phase = 'question' | 'result';

const OPTION_COUNT = 4;

export const useColorQuiz = () => {
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

  return {
    targetHex,
    selectedHex,
    setSelectedHex,
    phase,
    options,
    isCorrect,
    handleSubmit,
    handleNext,
  };
};
