export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-40 animate-pulse rounded-md bg-bg-mute" />
        <div className="h-5 w-64 animate-pulse rounded-md bg-bg-mute" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            className="flex flex-col gap-2 rounded-md bg-bg-mute p-4"
            key={i}
          >
            <div className="h-4 w-16 animate-pulse rounded bg-bg-base" />
            <div className="h-8 w-24 animate-pulse rounded bg-bg-base" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div className="h-12 animate-pulse rounded-md bg-bg-mute" key={i} />
        ))}
      </div>
    </div>
  );
}
