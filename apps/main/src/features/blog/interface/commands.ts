import { incrementBlogView as _incrementBlogView } from '../application/view';

export async function incrementBlogView(id: number) {
  return await _incrementBlogView(id);
}
