import { FC } from 'react';

export const RoundedIcon: FC = () => {
  return (
    <div
      className="h-24 w-24 bg-textHighlight"
      style={{
        borderBottomLeftRadius: '63% 57%',
        borderBottomRightRadius: '37% 63%',
        borderTopLeftRadius: '63% 43%',
        borderTopRightRadius: '37%',
      }}
    />
  );
};
