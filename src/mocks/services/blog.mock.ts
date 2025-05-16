import { fn } from 'storybook/test';

export const getBlogs = fn().mockName('getBlogs');

export const getBlog = fn().mockName('getBlog');

export const getBlogMetadata = fn().mockName('getBlogMetadata');

export const getBlogsByTags = fn().mockName('getBlogsByTags');

export const getBlogToc = fn().mockName('getBlogToc');

export const getBlogView = fn().mockName('getBlogView');

export const incrementBlogView = fn().mockName('incrementBlogView');
