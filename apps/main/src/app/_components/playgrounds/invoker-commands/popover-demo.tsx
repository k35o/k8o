export function PopoverDemo() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="space-y-2">
          <p className="text-fg-mute text-sm">Invoker Commands API</p>
          <button
            className="rounded-md bg-primary-base px-4 py-2 text-primary-fg"
            // @ts-expect-error -- commandfor is not yet in TypeScript types
            // biome-ignore lint/nursery/noUnknownAttribute: Baseline 2025
            command="toggle-popover"
            // biome-ignore lint/nursery/noUnknownAttribute: Baseline 2025
            commandfor="demo-popover"
            type="button"
          >
            メニュー
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-fg-mute text-sm">Popover API</p>
          <button
            className="rounded-md bg-primary-base px-4 py-2 text-primary-fg"
            popoverTarget="demo-popover"
            type="button"
          >
            メニュー
          </button>
        </div>
      </div>

      <div
        className="inset-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border-base bg-bg-base p-4 shadow-lg"
        id="demo-popover"
        popover=""
      >
        <p className="text-fg-base">Popoverの内容</p>
        <p className="text-fg-mute text-sm">
          どちらのボタンでも同じPopoverを操作できます。
        </p>
      </div>
    </div>
  );
}
