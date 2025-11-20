import type { FC } from 'react';

export const Background: FC = () => {
  return (
    <div
      aria-hidden="true"
      className="-z-10 fixed top-0 left-0 h-full w-full overflow-hidden bg-linear-65 from-(--cyan-100) to-(--blue-100) dark:from-(--cyan-950) dark:to-(--blue-950)"
    >
      <div className="-top-24 -left-24 absolute h-96 w-96 bg-linear-65 from-(--cyan-400) to-(--teal-300) opacity-40 blur-3xl dark:from-(--cyan-700) dark:to-(--teal-600) dark:opacity-30" />
      <div className="-bottom-24 -right-24 absolute h-96 w-96 bg-linear-65 from-(--blue-400) to-(--teal-400) opacity-40 blur-3xl dark:from-(--blue-700) dark:to-(--teal-700) dark:opacity-30" />
    </div>
  );
};
