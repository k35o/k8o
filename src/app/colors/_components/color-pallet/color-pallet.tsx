import { ChangeEventHandler, FC } from "react";

type Props = {
  color: string;
  setColor: (color: string) => void;
}

export const ColorPallet: FC<Props> = ({ color, setColor }) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setColor(e.target.value);
  }

  return (
    <div className="flex gap-2">
      <input className="w-16 flex-grow" type="color" value={color} onChange={handleChange} />
      <p>{color}</p>
    </div>
  );
}
