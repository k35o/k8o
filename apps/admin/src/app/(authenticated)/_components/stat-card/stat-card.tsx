import { Card } from '@k8o/arte-odyssey';
export const StatCard = ({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) => (
  <Card>
    <div className="flex flex-col gap-1 p-4">
      <p className="text-fg-mute text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {description !== undefined && (
        <p className="text-fg-mute text-xs">{description}</p>
      )}
    </div>
  </Card>
);
