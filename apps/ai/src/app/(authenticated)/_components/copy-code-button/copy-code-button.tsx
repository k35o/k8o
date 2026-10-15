import { CopyButton } from '@k8ordo/ui';
import type { FC } from 'react';

type CopyCodeButtonProps = {
  code: string | null;
};

// コピー対象はハイライト済み DOM ではなく生の code 文字列（span 分割や空行の \n の影響を避ける）。
export const CopyCodeButton: FC<CopyCodeButtonProps> = ({ code }) => (
  <CopyButton
    disabled={code === null}
    iconOnly
    label="コードをコピー"
    size="sm"
    value={code ?? ''}
  />
);
