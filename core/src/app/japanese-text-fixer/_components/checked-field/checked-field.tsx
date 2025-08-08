'use client';

import { useStatus } from '../../_state/text';
import { Result } from '../result';
import { SyntaxFixer } from '../syntax-fixer';
import { VerifiedSyntax } from '../verified-syntax';

export const CheckedField = () => {
  const status = useStatus();

  if (!status.isExecuted) {
    return null;
  }

  return (
    <>
      {status.hasError ? (
        status.isComplete ? (
          <Result />
        ) : (
          <SyntaxFixer />
        )
      ) : (
        <VerifiedSyntax />
      )}
    </>
  );
};
