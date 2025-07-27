'use server';

import type { Response } from './types';
import { getDescriptor } from './descriptor';
import { TextlintKernel } from '@textlint/kernel';

export const checkJapaneseSyntax = async (
  text: string,
): Promise<Response> => {
  const descriptor = await getDescriptor();

  const kernel = new TextlintKernel();
  const result = await kernel.lintText(text, {
    ext: '.md',
    ...descriptor.toKernelOptions(),
  });
  console.log(result);

  return {
    text,
    msgs: result.messages,
  };
};
