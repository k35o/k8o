import type { FC } from 'react';

export const Radius: FC = () => {
  return (
    <section className="grid grid-cols-auto-fill-48 justify-between gap-8">
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-border-base p-2">
        <p className="font-bold text-xl md:text-2xl">none:&nbsp;0px</p>
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-none border border-border-base bg-bg-mute" />
          <div className="h-24 w-16 rounded-none border border-border-base bg-bg-mute" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-border-base p-2">
        <p className="font-bold text-xl md:text-2xl">sm:&nbsp;0.375rem</p>
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-sm border border-border-base bg-bg-mute" />
          <div className="h-24 w-16 rounded-sm border border-border-base bg-bg-mute" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-border-base p-2">
        <p className="font-bold text-xl md:text-2xl">md:&nbsp;0.5rem</p>
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-md border border-border-base bg-bg-mute" />
          <div className="h-24 w-16 rounded-md border border-border-base bg-bg-mute" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-border-base p-2">
        <p className="font-bold text-xl md:text-2xl">lg:&nbsp;0.75rem</p>
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-lg border border-border-base bg-bg-mute" />
          <div className="h-24 w-16 rounded-lg border border-border-base bg-bg-mute" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-border-base p-2">
        <p className="font-bold text-xl md:text-2xl">full:&nbsp;∞px</p>
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-full border border-border-base bg-bg-mute" />
          <div className="h-24 w-16 rounded-full border border-border-base bg-bg-mute" />
        </div>
      </div>
    </section>
  );
};
