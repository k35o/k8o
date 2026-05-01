export function DialogDemo() {
  return (
    <div className="space-y-4">
      <button
        className="bg-primary-base text-primary-fg rounded-md px-4 py-2"
        // @ts-expect-error -- commandfor is not yet in TypeScript types
        // Baseline 2025
        command="show-modal"
        // Baseline 2025
        commandfor="demo-dialog"
        type="button"
      >
        Dialogを開く
      </button>

      <dialog
        aria-label="デモダイアログ"
        className="bg-bg-base m-auto rounded-lg p-6 shadow-md backdrop:bg-black/50"
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
            className="bg-bg-mute text-fg-base hover:bg-bg-subtle rounded-md px-4 py-2"
            // @ts-expect-error -- commandfor is not yet in TypeScript types
            // Baseline 2025
            command="close"
            // Baseline 2025
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
