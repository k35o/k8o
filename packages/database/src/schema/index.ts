/* eslint-disable import/max-dependencies -- Drizzle schema の export map と relations を一箇所に集約するため */

import { articleSources, articleSourcesRelations } from './article-sources';
import { articles, articlesRelations } from './articles';
import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from './auth-schema';
import { baselineSnapshots } from './baseline-snapshots';
import { blogComment, blogCommentRelations } from './blog-comment';
import { blogTag, blogTagRelations } from './blog-tag';
import { blogViews } from './blog-views';
import { blogs, blogsRelations } from './blogs';
import { comments, commentsRelations } from './comments';
import { feedbacks, feedbacksRelations } from './feedback';
import { reportingReports } from './reporting-reports';
import { tags, tagsRelations } from './tags';
import { talkTag, talkTagRelations } from './talk-tag';
import { talks, talksRelations } from './talks';

export const schema = {
  // 認証
  user,
  session,
  account,
  verification,
  // 全体
  feedbacks,
  tags,
  comments,
  reportingReports,
  baselineSnapshots,
  // ブログ関連
  blogs,
  blogViews,
  blogTag,
  blogComment,
  // Talks関連
  talks,
  talkTag,
  // よんでるもの関連
  articleSources,
  articles,
};

export const relations = {
  // 認証
  userRelations,
  sessionRelations,
  accountRelations,
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
  // よんでるもの関連
  articleSourcesRelations,
  articlesRelations,
};
