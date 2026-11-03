import { findTagRows } from '../infrastructure/tag-repository';

export async function getTags(): Promise<
  Array<{
    id: number;
    name: string;
    blogCount: number;
    talkCount: number;
  }>
> {
  const tags = await findTagRows();

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    blogCount: tag.blogTag.filter((blogTag) => blogTag.blog.published).length,
    talkCount: tag.talkTag.length,
  }));
}
