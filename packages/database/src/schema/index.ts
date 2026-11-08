import { articleSources, articleSourcesRelations } from './article-sources.ts';
import { articles, articlesRelations } from './articles.ts';
import { blogComment, blogCommentRelations } from './blog-comment.ts';
import { blogTag, blogTagRelations } from './blog-tag.ts';
import { blogViewDailies } from './blog-view-dailies.ts';
import { blogViews } from './blog-views.ts';
import { blogs, blogsRelations } from './blogs.ts';
import { browserSupportDatasets } from './browser-support-datasets.ts';
import { browserSupportFeatureChanges } from './browser-support-feature-changes.ts';
import { browserSupportSyncRuns } from './browser-support-sync-runs.ts';
import { comments, commentsRelations } from './comments.ts';
import { feedbacks, feedbacksRelations } from './feedback.ts';
import { pushLogs } from './push-logs.ts';
import { pushSubscriptions } from './push-subscriptions.ts';
import { reportingReports } from './reporting-reports.ts';
import { slideTag, slideTagRelations } from './slide-tag.ts';
import { slides, slidesRelations } from './slides.ts';
import { tags, tagsRelations } from './tags.ts';
import { talkTag, talkTagRelations } from './talk-tag.ts';
import { talks, talksRelations } from './talks.ts';

export const schema = {
  feedbacks,
  tags,
  comments,
  reportingReports,
  browserSupportDatasets,
  browserSupportFeatureChanges,
  browserSupportSyncRuns,
  pushSubscriptions,
  pushLogs,
  blogs,
  blogViews,
  blogViewDailies,
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
