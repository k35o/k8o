// @ts-expect-error: next16まではunsableなViewTransitinoのみが使える
import { unstable_SuspenseList, unstable_ViewTransition } from 'react';

export const ViewTransition = unstable_ViewTransition;

export const SuspenseList = unstable_SuspenseList;
