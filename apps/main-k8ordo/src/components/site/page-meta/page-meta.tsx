import type { FC } from 'react';

const SITE_URL = 'https://k8o.me';
const SITE_NAME = 'k8o';
const SITE_DESCRIPTION = 'k8oの活動や制作物をまとめた個人サイト';

// OG の画像はどれも shared/og が 1200×630 の PNG で書く
const OG_IMAGE = { type: 'image/png', width: '1200', height: '630' } as const;

const absoluteUrl = (path: string): string =>
  path === '/' ? SITE_URL : `${SITE_URL}${path}`;

export const SITE_OG_IMAGE = { path: '/og.png', alt: SITE_NAME } as const;

type PageMetaProps = {
  title?: string;
  description?: string;
  path: string;
  canonical?: boolean;
  image?: { path: string; alt: string };
  rssFeedPath?: string;
  noindex?: boolean;
};

export const PageMeta: FC<PageMetaProps> = ({
  title,
  description = SITE_DESCRIPTION,
  path,
  canonical = false,
  image,
  rssFeedPath,
  noindex = false,
}) => {
  const pageTitle = title ?? SITE_NAME;
  const url = absoluteUrl(path);
  const imageUrl = image === undefined ? undefined : absoluteUrl(image.path);

  return (
    <>
      <title>
        {title === undefined ? SITE_NAME : `${title} | ${SITE_NAME}`}
      </title>
      <meta content={description} name="description" />
      {noindex && <meta content="noindex" name="robots" />}
      {canonical && <link href={url} rel="canonical" />}
      {rssFeedPath !== undefined && (
        <link
          href={absoluteUrl(rssFeedPath)}
          rel="alternate"
          type="application/rss+xml"
        />
      )}
      <meta content={pageTitle} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content={url} property="og:url" />
      <meta content={SITE_NAME} property="og:site_name" />
      <meta content="ja" property="og:locale" />
      {image !== undefined && (
        <>
          <meta content={imageUrl} property="og:image" />
          <meta content={OG_IMAGE.type} property="og:image:type" />
          <meta content={OG_IMAGE.width} property="og:image:width" />
          <meta content={OG_IMAGE.height} property="og:image:height" />
          <meta content={image.alt} property="og:image:alt" />
        </>
      )}
      <meta content="website" property="og:type" />
      <meta content="summary" name="twitter:card" />
      <meta content={pageTitle} name="twitter:title" />
      <meta content={description} name="twitter:description" />
      {image !== undefined && (
        <>
          <meta content={imageUrl} name="twitter:image" />
          <meta content={image.alt} name="twitter:image:alt" />
          <meta content={OG_IMAGE.type} name="twitter:image:type" />
          <meta content={OG_IMAGE.width} name="twitter:image:width" />
          <meta content={OG_IMAGE.height} name="twitter:image:height" />
        </>
      )}
    </>
  );
};
