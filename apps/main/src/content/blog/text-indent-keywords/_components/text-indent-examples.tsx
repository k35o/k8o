import styles from './text-indent-examples.module.css';

const inquiry = [
  '先日購入したキーボードについてお問い合わせします。届いた日から、一部のキーが押しても反応しないことがあります。',
  '右側のEnterキーとBackspaceキーで起こりやすく、強く押し直すと反応します。',
  '交換か修理の方法を教えてください。',
].join('\n');

const priceNote =
  '※表示している料金には消費税が含まれます。配送料は地域によって異なるため、注文の確認画面で表示します。';

const notes = [
  priceNote,
  '※キャンセルは発送の前日まで受け付けます。発送した後は、商品が届いてから7日以内に返品の手続きをしてください。',
  '※在庫の数はおよそ5分ごとに更新します。',
].join('\n');

export const EachLineExample = () => (
  <div className={styles.root}>
    <p className={styles.comment}>{inquiry}</p>
  </div>
);

export const HangingExample = () => (
  <div className={styles.root}>
    <p className={styles.note}>{priceNote}</p>
  </div>
);

export const HangingEachLineExample = () => (
  <div className={styles.root}>
    <p className={styles.notes}>{notes}</p>
  </div>
);
