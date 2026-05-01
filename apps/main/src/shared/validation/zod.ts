import * as z from 'zod/mini';

let configured = false;

export const configureZod = (): void => {
  if (configured) {
    return;
  }

  z.config(z.locales.ja());
  configured = true;
};
