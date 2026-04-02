import type { FC } from 'react';

export const Background: FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 -z-10 h-full w-full overflow-hidden bg-linear-65 from-(--cyan-100) to-(--blue-100) dark:from-(--gray-950) dark:to-(--gray-950)"
    >
      <div className="absolute -top-24 -left-24 h-96 w-96 bg-linear-65 from-(--cyan-400) to-(--teal-300) opacity-40 blur-3xl dark:from-teal-900 dark:to-sky-900 dark:opacity-40" />
      <div className="absolute -right-24 -bottom-24 h-96 w-96 bg-linear-65 from-(--blue-400) to-(--teal-400) opacity-40 blur-3xl dark:from-sky-900 dark:to-teal-900 dark:opacity-40" />
    </div>
  );
};
