import {
  aiProjectVersions,
  aiProjectVersionsRelations,
} from './ai-project-versions';
import { aiProjects, aiProjectsRelations } from './ai-projects';
import { aiShareServes } from './ai-share-serves';
import { aiUsages, aiUsagesRelations } from './ai-usages';
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
import { blogViewDailies } from './blog-view-dailies';
import { blogViews } from './blog-views';
import { blogs, blogsRelations } from './blogs';
import { browserSupport } from './browser-support';
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
  browserSupport,
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
  aiProjects,
  aiProjectVersions,
  aiUsages,
  aiShareServes,
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
  aiProjectsRelations,
  aiProjectVersionsRelations,
  aiUsagesRelations,
};
