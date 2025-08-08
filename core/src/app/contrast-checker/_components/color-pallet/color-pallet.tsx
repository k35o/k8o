import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { cn } from '@k8o/helpers/cn';
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
        <div className="flex gap-2">
          <input
            className={cn(
              'w-16 grow rounded-md border border-border-base',
              'focus-visible:border-transparent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border-info',
            )}
            id={id}
            onChange={handleChange}
            type="color"
            value={color}
          />
          <p>{color}</p>
        </div>
      )}
    />
  );
};
