import type { Decorator } from '@storybook/nextjs-vite';
import { useReducer } from 'react';
import { DispatchContext, StateContext } from './provider';
import { initialState, reducer } from './reducer';
import type { State } from './types';

export const withProofreadState =
  (state: Partial<State>): Decorator =>
  (Story) => {
    const [s, dispatch] = useReducer(reducer, {
      ...initialState,
      ...state,
    });

    return (
      <StateContext value={s}>
        <DispatchContext value={dispatch}>
          <Story />
        </DispatchContext>
      </StateContext>
    );
  };
