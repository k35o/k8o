import type { FC } from 'react';

export const Background: FC = () => (
  <div
    aria-hidden="true"
    className="fixed top-0 left-0 -z-10 size-full overflow-hidden bg-linear-65 from-(--cyan-100) to-(--teal-100) dark:bg-(--gray-950) dark:bg-none"
  >
    <div className="absolute -top-24 -left-24 size-96 bg-linear-65 from-(--blue-400) to-(--cyan-400) opacity-60 blur-3xl dark:from-(--blue-900) dark:to-(--cyan-900)" />
    <div className="absolute -right-24 -bottom-24 size-96 bg-linear-65 from-(--teal-400) to-(--green-400) opacity-60 blur-3xl dark:from-(--teal-900) dark:to-(--green-900)" />
  </div>
);
