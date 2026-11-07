import { PageMeta } from '@/components/site/page-meta/page-meta';
import { TagsFrame } from '@/components/tags/tags-frame/tags-frame';
import { TagsIndex } from '@/components/tags/tags-index/tags-index';
import { getTagSummaries } from '@/shared/site/tag-contents';

export default async function TagsPage() {
  const tags = await getTagSummaries();

  return (
    <>
      <PageMeta
        description="k8oで提供するサービスやブログのタグ一覧をまとめたページです。各タグの関連するコンテンツへのリンクを掲載しています。"
        path="/tags"
        title="Tags"
      />
      <TagsFrame>
        <TagsIndex tags={tags} />
      </TagsFrame>
    </>
  );
}
