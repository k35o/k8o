import { incrementBlogView as _incrementBlogView } from '../application/view';

export async function incrementBlogView(id: number) {
  const result = await _incrementBlogView(id);
  return result;
}
