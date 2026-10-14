const THREAD_PATH_PREFIX = '/chat/';

export const threadIdFromPathname = (pathname: string): string | null => {
  if (!pathname.startsWith(THREAD_PATH_PREFIX)) {
    return null;
  }
  const id = pathname.slice(THREAD_PATH_PREFIX.length);
  return id === '' || id.includes('/') ? null : id;
};
