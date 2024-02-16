'use client';

import { CheckedField } from './_components/checked-field';
import { EditField } from './_components/edit-field';
import { useStatus } from './_state/text';

export default function CheckSyntax() {
  const status = useStatus();
  return <>{status.isExecuted ? <CheckedField /> : <EditField />}</>;
}
