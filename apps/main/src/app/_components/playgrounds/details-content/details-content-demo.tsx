import type { FC } from 'react';

export const DetailsContentDemo: FC = () => (
  <div>
    <details className="*:not-[summary]:border-primary-border p-4 *:not-[summary]:border-4 *:not-[summary]:border-dashed">
      <summary>detailsの子要素全てにスタイルを割り当て</summary>
      <p>p要素1</p>
      <p>p要素2</p>
      <p>p要素3</p>
    </details>
    <details className="details-content:border-primary-border p-4 details-content:border-4 details-content:border-dashed">
      <summary>::details-contentを用いてslot要素に割り当て</summary>
      <p>p要素1</p>
      <p>p要素2</p>
      <p>p要素3</p>
    </details>
  </div>
);
