import { read } from 'to-vfile';
import { matter } from 'vfile-matter';

type Frontmatter = {
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const getFrontmatter = async (
  path: string,
): Promise<Frontmatter> => {
  const file = await read(path);
  matter(file);
  return file.data.matter as Frontmatter;
};
