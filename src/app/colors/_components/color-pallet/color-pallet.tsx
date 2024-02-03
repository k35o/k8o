'use client';
import { ChangeEventHandler, FC, useId } from "react";

type Props = {
  label: string;
  color: string;
  setColor: (color: string) => void;
}

export const ColorPallet: FC<Props> = ({ label, color, setColor }) => {
  const id = useId();
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setColor(e.target.value);
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-bold">{label}</label>
      <div className="flex gap-2">
        <input id={id} className="w-16 flex-grow" type="color" value={color} onChange={handleChange} />
        <p>{color}</p>
      </div>
    </div>
  );
}
