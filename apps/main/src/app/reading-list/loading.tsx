export default function Loading() {
  return (
    <div className="flex flex-col gap-6 rounded-md bg-bg-base p-6 lg:flex-row xl:-mx-36">
      <aside className="hidden w-60 shrink-0 animate-pulse lg:flex lg:flex-col lg:gap-6">
        <div className="h-16 rounded-md bg-bg-mute" />
        <div className="h-16 rounded-md bg-bg-mute" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div className="h-6 rounded-md bg-bg-mute" key={i} />
          ))}
        </div>
      </aside>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="h-5 w-12 animate-pulse rounded-md bg-bg-mute" />
          <div className="h-9 w-24 animate-pulse rounded-md bg-bg-mute lg:hidden" />
        </div>
        <div className="grid grid-cols-auto-fill-60 gap-3">
          {Array.from({ length: 12 }, (_, i) => (
            <div className="h-64 animate-pulse rounded-md bg-bg-mute" key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
