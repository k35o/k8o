import type { FC } from 'react';
import { BaseIcon, type BaseIconProps } from './base';

export const Zenn: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 98 96"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#3EA8FF">
        <path
          d="M3.9,83.3h17c0.9,0,1.7-0.5,2.2-1.2L69.9,5.2c0.6-1-0.1-2.2-1.3-2.2H52.5c-0.8,0-1.5,0.4-1.9,1.1L3.1,81.9
		C2.8,82.5,3.2,83.3,3.9,83.3z"
        />
        <path
          d="M62.5,82.1l22.1-35.5c0.7-1.1-0.1-2.5-1.4-2.5h-16c-0.6,0-1.2,0.3-1.5,0.8L43,81.2c-0.6,0.9,0.1,2.1,1.2,2.1
		h16.3C61.3,83.3,62.1,82.9,62.5,82.1z"
        />
      </g>
    </svg>
  );
};

export const ZennIcon: FC<Partial<BaseIconProps>> = ({ size = 'md' }) => {
  return (
    <BaseIcon
      renderItem={(props) => {
        return <Zenn {...props} />;
      }}
      size={size}
    />
  );
};
