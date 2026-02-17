'use client';

import {
  createContext,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  use,
  useReducer,
} from 'react';
import { initialState, reducer } from './reducer';
import type { Action, State } from './types';

const StateContext = createContext<State | undefined>(undefined);
const DispatchContext = createContext<Dispatch<Action> | undefined>(undefined);

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

export const useProofreadState = (): State => {
  const state = use(StateContext);
  if (state === undefined) {
    throw new Error(
      'useProofreadState must be used within a ProofreadProvider',
    );
  }
  return state;
};

export const useProofreadDispatch = (): Dispatch<Action> => {
  const dispatch = use(DispatchContext);
  if (dispatch === undefined) {
    throw new Error(
      'useProofreadDispatch must be used within a ProofreadProvider',
    );
  }
  return dispatch;
};
