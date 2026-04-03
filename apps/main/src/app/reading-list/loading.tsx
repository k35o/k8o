import { LinkCardLoading } from '../_components/link-card';

export default function Loading() {
  return (
    <div className="grid gap-8 xl:-mx-16 xl:grid-cols-[16rem_minmax(0,1fr)] xl:items-start">
      <aside className="hidden xl:sticky xl:top-6 xl:block">
        <div className="animate-pulse rounded-xl bg-bg-base p-4 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="h-6 w-20 rounded-md bg-bg-mute" />
            <div className="h-10 rounded-md bg-bg-mute" />
            <div className="h-10 rounded-md bg-bg-mute" />
            <div className="h-10 rounded-md bg-bg-mute" />
            <div className="h-px w-full bg-border-subtle" />
            {Array.from({ length: 5 }, (_, i) => (
              <div className="h-5 rounded-md bg-bg-mute" key={i} />
            ))}
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex animate-pulse items-center justify-between">
          <div className="h-4 w-24 rounded-md bg-bg-mute" />
          <div className="h-9 w-24 rounded-md bg-bg-mute xl:hidden" />
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <LinkCardLoading href="#" key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
