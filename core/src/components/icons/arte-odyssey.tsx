import { BaseIcon, BaseIconProps } from './base';
import arteodyssey from '@/app/_images/arteodyssey.png';
import Image from 'next/image';
import { FC } from 'react';

// 仮のアイコン
export const ArteOdyssey: FC<Partial<BaseIconProps>> = ({
  size = 'md',
}) => {
  return (
    <BaseIcon
      size={size}
      renderItem={(props) => (
        <Image {...props} src={arteodyssey} alt="" />
      )}
    />
  );
};
