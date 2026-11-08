import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const iconDataUrl = `data:image/png;base64,${readFileSync(
  join(process.cwd(), 'public/icon.png'),
).toString('base64')}`;

export function getIconDataUrl(): string {
  return iconDataUrl;
}
