'use client';

import { useRecoilValue } from 'recoil';
import { textLengthState } from '../../state/text';

export const TextLength = () => {
  const length = useRecoilValue(textLengthState);

  return <>{length}</>;
};
