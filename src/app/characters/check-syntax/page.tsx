import { CheckedField } from './_components/checked-field';
import { EditField } from './_components/edit-field';

export default function CheckSyntax() {
  return (
    <div className="flex flex-col gap-4">
      <EditField />
      <CheckedField />
    </div>
  );
}
