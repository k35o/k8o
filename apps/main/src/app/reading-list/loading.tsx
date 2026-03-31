export default function Loading() {
  return (
    <div className="grid gap-8 xl:-mx-16 xl:grid-cols-[16rem_minmax(0,1fr)] xl:items-start">
      <aside className="hidden xl:sticky xl:top-6 xl:block">
        <div className="animate-pulse rounded-lg border border-border-mute p-4">
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
            <div
              className="animate-pulse overflow-hidden rounded-lg bg-bg-base shadow-sm"
              key={i}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="aspect-video w-full rounded-t-lg bg-bg-mute sm:aspect-auto sm:w-48 sm:shrink-0 sm:self-stretch sm:rounded-t-none sm:rounded-l-lg" />
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="h-5 w-3/4 rounded-md bg-bg-mute" />
                  <div className="h-4 w-full rounded-md bg-bg-mute" />
                  <div className="mt-auto h-3 w-1/3 rounded-md bg-bg-mute" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
