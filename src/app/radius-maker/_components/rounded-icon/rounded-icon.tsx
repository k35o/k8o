import { FC } from 'react';

export const RoundedIcon: FC = () => {
  return (
    <div
      className="h-16 w-16 bg-textHighlight"
      style={{
        borderBottomLeftRadius: '63% 57%',
        borderBottomRightRadius: '37% 63%',
        borderTopLeftRadius: '63% 43%',
        borderTopRightRadius: '37%',
      }}
    />
  );
};
