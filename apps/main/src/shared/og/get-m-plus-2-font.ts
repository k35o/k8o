import { getGoogleFont } from './get-google-font';

export function getMPlus2Font({
  text,
}: {
  text: string;
}): Promise<ArrayBuffer> {
  return getGoogleFont({ family: 'M PLUS 2', weight: 450, text });
}
