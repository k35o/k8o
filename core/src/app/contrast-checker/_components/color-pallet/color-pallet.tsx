import { FormControl } from '@/components/form/form-control';
import { cn } from '@k8o/helpers/cn';
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
              'border-border-base w-16 grow rounded-md border',
              'focus-visible:ring-border-info focus-visible:outline-hidden focus-visible:border-transparent focus-visible:ring-2',
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
