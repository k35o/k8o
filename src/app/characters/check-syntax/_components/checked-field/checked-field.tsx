'use client';

import { useStatus } from '../../_state/text';
import { VerifiedSyntax } from '../verified-syntax';

export const CheckedField = () => {
  const status = useStatus();

  if (!status.isExecuted) {
    return <></>;
  }

  return (
    <>
      {status.hasError ? (
        <div className="text-red-500">エラーがあります</div>
      ) : (
        <VerifiedSyntax />
      )}
    </>
  );
};
