import { FormControl } from '@/components/form/form-control';
import { cn } from '@/utils/cn';
import { ChangeEventHandler, FC } from 'react';

type Props = {
  label: string;
  color: string;
  setColor: (color: string) => void;
};

export const ColorPallet: FC<Props> = ({
  label,
  color,
  setColor,
}) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setColor(e.target.value);
  };

  return (
    <FormControl
      label={label}
      renderInput={({ id }) => (
        <div className="flex gap-2">
          <input
            id={id}
            className={cn(
              'w-16 grow rounded-lg border border-border',
              'focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focusRing',
            )}
            type="color"
            value={color}
            onChange={handleChange}
          />
          <p>{color}</p>
        </div>
      )}
    />
  );
};
