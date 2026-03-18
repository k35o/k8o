export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex animate-pulse flex-col gap-4 sm:flex-row">
        <div className="h-16 flex-1 rounded-md bg-bg-mute" />
        <div className="h-16 w-full rounded-md bg-bg-mute sm:w-56" />
        <div className="h-10 w-24 self-end rounded-md bg-bg-mute" />
      </div>
      <div className="grid grid-cols-auto-fill-80 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div className="h-64 animate-pulse rounded-md bg-bg-mute" key={i} />
        ))}
      </div>
    </div>
  );
}
