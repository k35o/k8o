// export { ViewTransition } from 'react';

import type { FC, ViewTransitionProps } from 'react';

// FIXME: Cache Componentsを利用していると、遷移先にView Transitionが効かない問題があるため、一旦ダミー実装にする
export const ViewTransition: FC<ViewTransitionProps> = ({ children }) => {
  return children;
};
