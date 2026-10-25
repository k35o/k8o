import styles from './popover-demo.module.css';

export function PopoverDemo() {
  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.control}>
          <p className={styles.label}>Invoker Commands API</p>
          <button
            className={styles.button}
            command="toggle-popover"
            commandfor="demo-popover"
            type="button"
          >
            メニュー
          </button>
        </div>
        <div className={styles.control}>
          <p className={styles.label}>Popover API</p>
          <button
            className={styles.button}
            popoverTarget="demo-popover"
            popoverTargetAction="toggle"
            type="button"
          >
            メニュー
          </button>
        </div>
      </div>

      <div className={styles.popover} id="demo-popover" popover="">
        <p className={styles.title}>Popoverの内容</p>
        <p className={styles.description}>
          どちらのボタンでも同じPopoverを操作できます。
        </p>
      </div>
    </div>
  );
}
