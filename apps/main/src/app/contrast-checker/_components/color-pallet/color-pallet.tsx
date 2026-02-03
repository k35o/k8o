import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { cn } from '@repo/helpers/cn';
import type { ChangeEventHandler, FC } from 'react';

type Props = {
  label: string;
  color: string;
  setColor: (color: string) => void;
};

export const ColorPallet: FC<Props> = ({ label, color, setColor }) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setColor(e.target.value);
  };

  return (
    <FormControl
      label={label}
      renderInput={({ id }) => (
        <div className="flex flex-col gap-2">
          <input
            className={cn(
              'h-24 w-full cursor-pointer rounded-lg border border-border-base p-1',
              'focus-visible:border-transparent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border-info',
            )}
            id={id}
            onChange={handleChange}
            type="color"
            value={color}
          />
          <p className="text-center font-mono text-sm">{color}</p>
        </div>
      )}
    />
  );
};
