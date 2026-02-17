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

export const StateContext = createContext<State | undefined>(undefined);
export const DispatchContext = createContext<Dispatch<Action> | undefined>(
  undefined,
);

export const ProofreadProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

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
