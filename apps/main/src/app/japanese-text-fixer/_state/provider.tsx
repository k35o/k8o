'use client';

import { createSafeContext } from '@k8o/arte-odyssey';
import {
  type Dispatch,
  type FC,
  type PropsWithChildren,
  useReducer,
} from 'react';

import { initialState, reducer } from './reducer';
import type { Action, State } from './types';

const [StateContext, useProofreadState] = createSafeContext<State>(
  'useProofreadState must be used within a ProofreadProvider',
);
const [DispatchContext, useProofreadDispatch] = createSafeContext<
  Dispatch<Action>
>('useProofreadDispatch must be used within a ProofreadProvider');

export { useProofreadState, useProofreadDispatch };

type ProofreadProviderProps = PropsWithChildren<{
  initialState?: State;
}>;

export const ProofreadProvider: FC<ProofreadProviderProps> = ({
  children,
  initialState: initialStateProp,
}) => {
  const [state, dispatch] = useReducer(
    reducer,
    initialStateProp ?? initialState,
  );

  return (
    <StateContext value={state}>
      <DispatchContext value={dispatch}>{children}</DispatchContext>
    </StateContext>
  );
};
