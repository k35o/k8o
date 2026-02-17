import type { Decorator } from '@storybook/nextjs-vite';
import { ProofreadProvider } from './provider';
import { initialState } from './reducer';
import type { State } from './types';

export const withProofreadState =
  (state: Partial<State>): Decorator =>
  (Story) => {
    return (
      <ProofreadProvider initialState={{ ...initialState, ...state }}>
        <Story />
      </ProofreadProvider>
    );
  };
