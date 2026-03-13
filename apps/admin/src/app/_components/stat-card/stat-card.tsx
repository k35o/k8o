import { Card } from '@k8o/arte-odyssey/card';

export const StatCard = ({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) => {
  return (
    <Card variant="secondary">
      <div className="flex flex-col gap-1 p-4">
        <p className="text-fg-mute text-sm">{label}</p>
        <p className="font-bold text-2xl">{value}</p>
        {description && <p className="text-fg-mute text-xs">{description}</p>}
      </div>
    </Card>
  );
};
