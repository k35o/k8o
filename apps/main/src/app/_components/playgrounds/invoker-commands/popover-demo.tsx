export function PopoverDemo() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="space-y-2">
          <p className="text-fg-mute text-sm">Invoker Commands API</p>
          <button
            className="bg-primary-base text-primary-fg rounded-md px-4 py-2"
            // @ts-expect-error -- commandfor is not yet in TypeScript types
            // Baseline 2025
            command="toggle-popover"
            // Baseline 2025
            commandfor="demo-popover"
            type="button"
          >
            メニュー
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-fg-mute text-sm">Popover API</p>
          <button
            className="bg-primary-base text-primary-fg rounded-md px-4 py-2"
            // not unknown
            popoverTarget="demo-popover"
            // not unknown
            popoverTargetAction="toggle"
            type="button"
          >
            メニュー
          </button>
        </div>
      </div>

      <div
        aria-label="メニュー"
        className="bg-bg-base inset-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg p-4 shadow-md"
        id="demo-popover"
        popover=""
        role="menu"
      >
        <p className="text-fg-base">Popoverの内容</p>
        <p className="text-fg-mute text-sm">
          どちらのボタンでも同じPopoverを操作できます。
        </p>
      </div>
    </div>
  );
}
