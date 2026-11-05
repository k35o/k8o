import { findTagRows } from '../infrastructure/tag-repository';

export async function getTags(): Promise<
  Array<{
    id: number;
    name: string;
    blogIds: number[];
    talkCount: number;
  }>
> {
  const tags = await findTagRows();

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    blogIds: tag.blogTag
      .filter((blogTag) => blogTag.blog.published)
      .map((blogTag) => blogTag.blog.id),
    talkCount: tag.talkTag.length,
  }));
}
