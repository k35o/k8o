export function DialogDemo() {
  return (
    <div className="space-y-4">
      <button
        className="rounded-md bg-primary-base px-4 py-2 text-primary-fg"
        // @ts-expect-error -- commandfor is not yet in TypeScript types
        // biome-ignore lint/nursery/noUnknownAttribute: Baseline 2025
        command="show-modal"
        // biome-ignore lint/nursery/noUnknownAttribute: Baseline 2025
        commandfor="demo-dialog"
        type="button"
      >
        Dialogを開く
      </button>

      <dialog
        aria-label="デモダイアログ"
        className="m-auto rounded-lg border border-border-base bg-bg-base p-6 backdrop:bg-black/50"
        id="demo-dialog"
      >
        <div className="space-y-4">
          <p className="text-fg-base">
            このDialogはInvoker Commands APIで開かれました。
          </p>
          <p className="text-fg-mute text-sm">
            JavaScriptを使わず、HTML属性だけで操作しています。
          </p>
          <button
            className="rounded-md bg-bg-mute px-4 py-2 text-fg-base hover:bg-bg-subtle"
            // @ts-expect-error -- commandfor is not yet in TypeScript types
            // biome-ignore lint/nursery/noUnknownAttribute: Baseline 2025
            command="close"
            // biome-ignore lint/nursery/noUnknownAttribute: Baseline 2025
            commandfor="demo-dialog"
            type="button"
          >
            閉じる
          </button>
        </div>
      </dialog>
    </div>
  );
}
