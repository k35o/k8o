import * as actual from '@/app/blog/_actions';
import { fn } from '@storybook/test';

export const getBlogs = fn(actual.getBlogs).mockName('getBlogs');

export const getBlogsWithoutCache = fn(
  actual.getBlogsWithoutCache,
).mockName('getBlogsWithoutCache');

export const getBlog = fn(actual.getBlog).mockName('getBlog');

export const getBlogWitoutCache = fn(
  actual.getBlogWitoutCache,
).mockName('getBlogWitoutCache');

export const getBlogView = fn(actual.getBlogView).mockName(
  'getBlogView',
);

export const incrementBlogView = fn(
  actual.incrementBlogView,
).mockName('incrementBlogView');
