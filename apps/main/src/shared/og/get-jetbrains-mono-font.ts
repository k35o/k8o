import { getGoogleFont } from './get-google-font';

export function getJetBrainsMonoFont({
  text,
}: {
  text: string;
}): Promise<ArrayBuffer> {
  return getGoogleFont({ family: 'JetBrains Mono', weight: 400, text });
}
