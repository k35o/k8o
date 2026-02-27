import { blogComment, blogCommentRelations } from './blog-comment';
import { blogTag, blogTagRelations } from './blog-tag';
import { blogViews } from './blog-views';
import { blogs, blogsRelations } from './blogs';
import { comments, commentsRelations } from './comments';
import { feedbacks, feedbacksRelations } from './feedback';
import { serviceTag, serviceTagRelations } from './service-tag';
import { serviceType } from './service-type';
import { services, servicesRelations } from './services';
import { tags, tagsRelations } from './tags';
import { talkTag, talkTagRelations } from './talk-tag';
import { talks, talksRelations } from './talks';

export const schema = {
  // 全体
  feedbacks,
  tags,
  comments,
  // ブログ関連
  blogs,
  blogViews,
  blogTag,
  blogComment,
  // Talks関連
  talks,
  talkTag,
  // アプリ関連
  services,
  serviceTag,
  serviceType,
};

export const relations = {
  // 全体
  feedbacksRelations,
  tagsRelations,
  commentsRelations,
  // ブログ関連
  blogsRelations,
  blogTagRelations,
  blogCommentRelations,
  // Talks関連
  talksRelations,
  talkTagRelations,
  // アプリ関連
  servicesRelations,
  serviceTagRelations,
};
