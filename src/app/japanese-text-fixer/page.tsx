'use client';

import { CheckedField } from './_components/checked-field';
import { EditField } from './_components/edit-field';
import { useStatus } from './_state/text';

export default function CheckSyntax() {
  const status = useStatus();
  return (
    <div className="bg-bg-base/55 h-full rounded-lg p-10">
      {status.isExecuted ? <CheckedField /> : <EditField />}
    </div>
  );
}
