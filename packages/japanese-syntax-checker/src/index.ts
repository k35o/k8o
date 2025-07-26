import { Response } from './types';

export const checkJapaneseSyntax = (text: string): Response => {
  return {
    text,
    msgs: [],
  };
};
