import { ErrorBoundary } from '@k8o/arte-odyssey/error-boundary';
// @ts-expect-error
import {
  type FC,
  type PropsWithChildren,
  SuspenseList as StableSuspenseList,
  type SuspenseListProps,
  unstable_SuspenseList as UnstableSuspenseList,
} from 'react';

export { ViewTransition } from 'react';

const Fallback: FC<PropsWithChildren> = ({ children }) => <>{children}</>;

export const SuspenseList: FC<SuspenseListProps> = (props) => {
  return (
    <ErrorBoundary fallback={<Fallback />}>
      <ErrorBoundary fallback={<StableSuspenseList {...props} />}>
        <UnstableSuspenseList {...props} />
      </ErrorBoundary>
    </ErrorBoundary>
  );
};
