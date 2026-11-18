export const isReadMethod = (method: string): boolean =>
  method === 'GET' || method === 'HEAD';

export const hasQuery = (url: string): boolean => url.includes('?');
