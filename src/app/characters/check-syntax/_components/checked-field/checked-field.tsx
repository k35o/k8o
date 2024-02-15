'use client';

import { useStatus } from '../../_state/text';
import { SyntaxFixer } from '../syntax-fixer';
import { VerifiedSyntax } from '../verified-syntax';

export const CheckedField = () => {
  const status = useStatus();

  if (!status.isExecuted) {
    return <></>;
  }

  return (
    <>{status.hasError ? <SyntaxFixer /> : <VerifiedSyntax />}</>
  );
};
