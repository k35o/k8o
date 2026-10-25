import styles from './dialog-demo.module.css';

export function DialogDemo() {
  return (
    <div>
      <button
        className={styles.trigger}
        command="show-modal"
        commandfor="demo-dialog"
        type="button"
      >
        Dialogを開く
      </button>

      <dialog
        aria-label="デモダイアログ"
        className={styles.dialog}
        id="demo-dialog"
      >
        <div className={styles.content}>
          <p className={styles.message}>
            このDialogはInvoker Commands APIで開かれました。
          </p>
          <p className={styles.note}>
            JavaScriptを使わず、HTML属性だけで操作しています。
          </p>
          <button
            className={styles.closeButton}
            command="close"
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
