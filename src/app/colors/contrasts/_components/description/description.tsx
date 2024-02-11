import { FC } from 'react';

export const Description: FC = () => {
  return (
    <div className="w-full rounded-md border-2 border-gray-700 p-4">
      <p>
        WCAG
        2.1によると、AA基準における大文字のテキストの最小コントラスト比は4.5:1、小文字のテキストの最小コントラスト比は3:1です。
      </p>
      <p>
        AAA基準においては、大文字のテキストの最小コントラスト比は7:1、小文字のテキストの最小コントラスト比は4.5:1です。
      </p>
      <p className="mt-2">
        大文字のテキストは、18pt（24px）以上、または太字の場合は14pt（18.66px）以上である場合に適用されます。小文字のテキストは、14pt（18.66px）以上、または太字の場合は12pt（16px）以上である場合に適用されます。
      </p>
    </div>
  );
};
