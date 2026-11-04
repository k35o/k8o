import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import compositionSidebar from '@/content/blog/chromatic-storybook-publish/_images/composition-sidebar.avif';
import certificate from '@/content/blog/color-certification-uc/_images/certificate.avif';
import react18vsreact19 from '@/content/blog/react19-usereducer-ts-type-inference/_images/react18vsreact19.avif';

import { Image } from './image';

const imgOf = (element: ReactElement): Record<string, string> => {
  const [, attributes = ''] =
    /<img([^>]*)\/>/u.exec(renderToStaticMarkup(element)) ?? [];
  return Object.fromEntries(
    [...attributes.matchAll(/([\w-]+)="([^"]*)"/gu)].map(
      ([, name = '', value = '']) => [name, value],
    ),
  );
};

// URL の形は dev とビルドで違うので、ファイル名と幅だけを比べる
const candidatesOf = (srcSet: string | undefined): string[] =>
  (srcSet ?? '').split(', ').map((candidate) => {
    const [url = '', width = ''] = candidate.split(' ');
    const file = new URL(url, 'https://k8o.me').pathname.split('/').at(-1);
    return `${String(file)} ${width}`;
  });

describe('Image', () => {
  describe('正常系', () => {
    it('版のある画像は、版と元の画像を幅つきで srcset に挙げる', () => {
      const img = imgOf(
        <Image alt="" height={628} src={react18vsreact19} width={1794} />,
      );

      expect(candidatesOf(img['srcSet'])).toStrictEqual([
        'react18vsreact19.640w.avif 640w',
        'react18vsreact19.960w.avif 960w',
        'react18vsreact19.1280w.avif 1280w',
        'react18vsreact19.avif 1794w',
      ]);
      expect(img['src']).toBe(react18vsreact19);
    });

    it('lazy の画像は、描いた幅で版を選ばせる', () => {
      const img = imgOf(
        <Image alt="" height={628} src={react18vsreact19} width={1794} />,
      );

      expect(img['loading']).toBe('lazy');
      expect(img['sizes']).toMatch(/^auto, /u);
    });

    it('lazy でない画像は、列の幅で版を選ばせる', () => {
      const img = imgOf(
        <Image
          alt=""
          height={2933}
          loading="eager"
          src={certificate}
          width={1920}
        />,
      );

      expect(candidatesOf(img['srcSet'])).toStrictEqual([
        'certificate.640w.avif 640w',
        'certificate.960w.avif 960w',
        'certificate.1280w.avif 1280w',
        'certificate.avif 1920w',
      ]);
      expect(img['sizes']).not.toMatch(/auto/u);
    });
  });

  describe('エッジケース', () => {
    it('版の無い画像は、srcset と sizes を書かない', () => {
      const img = imgOf(
        <Image alt="" height={1594} src={compositionSidebar} width={586} />,
      );

      expect(img['srcSet']).toBeUndefined();
      expect(img['sizes']).toBeUndefined();
    });

    it('width より広い版は挙げず、元の画像を width の幅として挙げる', () => {
      const img = imgOf(
        <Image alt="" height={314} src={react18vsreact19} width={897} />,
      );

      expect(candidatesOf(img['srcSet'])).toStrictEqual([
        'react18vsreact19.640w.avif 640w',
        'react18vsreact19.avif 897w',
      ]);
    });

    it('どの版も width 以上なら、srcset を書かない', () => {
      const img = imgOf(
        <Image alt="" height={210} src={react18vsreact19} width={600} />,
      );

      expect(img['srcSet']).toBeUndefined();
    });
  });
});

const imagesDir = (slug: string): string =>
  join(cwd(), 'src/content/blog', slug, '_images');

const variantFiles = readdirSync(join(cwd(), 'src/content/blog'))
  .map((slug) => imagesDir(slug))
  .filter((dir) => existsSync(dir))
  .flatMap((dir) =>
    readdirSync(dir)
      .filter((file) => /\.\d+w\.avif$/u.test(file))
      .map((file) => join(dir, file)),
  );

describe('記事の画像の版', () => {
  describe('正常系', () => {
    it.each(variantFiles)(
      '%s は、隣にある元の画像と縦横比が同じで、名前の幅を持つ',
      async (variant) => {
        const width = Number(/\.(\d+)w\.avif$/u.exec(variant)?.[1]);
        const original = await sharp(
          variant.replace(/\.\d+w\.avif$/u, '.avif'),
        ).metadata();
        const actual = await sharp(variant).metadata();

        expect(actual.width).toBe(width);
        expect(
          Math.abs(width * original.height - actual.height * original.width),
        ).toBeLessThanOrEqual(original.width / 2);
      },
    );
  });
});
