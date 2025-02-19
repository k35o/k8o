import { FC } from 'react';

export const Radius: FC = () => {
  return (
    <section className="bg-bg-base grid-cols-auto-fill-68 grid justify-between gap-8 rounded-lg p-3">
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-2xl font-bold">none:&nbsp;0</p>
        <div className="flex items-center gap-4">
          <div className="border-border-base h-16 w-24 rounded-none border" />
          <div className="border-border-base h-24 w-24 rounded-none border" />
          <div className="border-border-base h-24 w-16 rounded-none border" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-2xl font-bold">sm:&nbsp;0.375rem</p>
        <div className="flex items-center gap-4">
          <div className="border-border-base h-16 w-24 rounded-sm border" />
          <div className="border-border-base h-24 w-24 rounded-sm border" />
          <div className="border-border-base h-24 w-16 rounded-sm border" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-2xl font-bold">md:&nbsp;0.5rem</p>
        <div className="flex items-center gap-4">
          <div className="border-border-base h-16 w-24 rounded-md border" />
          <div className="border-border-base h-24 w-24 rounded-md border" />
          <div className="border-border-base h-24 w-16 rounded-md border" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-2xl font-bold">lg:&nbsp;0.75rem</p>
        <div className="flex items-center gap-4">
          <div className="border-border-base h-16 w-24 rounded-lg border" />
          <div className="border-border-base h-24 w-24 rounded-lg border" />
          <div className="border-border-base h-24 w-16 rounded-lg border" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-2xl font-bold">full:&nbsp;∞px</p>
        <div className="flex items-center gap-4">
          <div className="border-border-base h-16 w-24 rounded-full border" />
          <div className="border-border-base h-24 w-24 rounded-full border" />
          <div className="border-border-base h-24 w-16 rounded-full border" />
        </div>
      </div>
    </section>
  );
};
