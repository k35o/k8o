/* oxlint-disable import/max-dependencies -- Drizzle schema の export map と relations を一箇所に集約するため */

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
import { pushLogs } from './push-logs';
import { pushSubscriptions } from './push-subscriptions';
import { reportingReports } from './reporting-reports';
import { slideTag, slideTagRelations } from './slide-tag';
import { slides, slidesRelations } from './slides';
import { tags, tagsRelations } from './tags';
import { talkTag, talkTagRelations } from './talk-tag';
import { talks, talksRelations } from './talks';

export const schema = {
  user,
  session,
  account,
  verification,
  feedbacks,
  tags,
  comments,
  reportingReports,
  baselineSnapshots,
  pushSubscriptions,
  pushLogs,
  blogs,
  blogViews,
  blogTag,
  blogComment,
  talks,
  talkTag,
  slides,
  slideTag,
  articleSources,
  articles,
};

export const relations = {
  userRelations,
  sessionRelations,
  accountRelations,
  feedbacksRelations,
  tagsRelations,
  commentsRelations,
  blogsRelations,
  blogTagRelations,
  blogCommentRelations,
  talksRelations,
  talkTagRelations,
  slidesRelations,
  slideTagRelations,
  articleSourcesRelations,
  articlesRelations,
};
