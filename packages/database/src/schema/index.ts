import { blogComment, blogCommentRelations } from './blog-comment';
import { blogTag, blogTagRelations } from './blog-tag';
import { blogViews } from './blog-views';
import { blogs, blogsRelations } from './blogs';
import { comments, commentsRelations } from './comments';
import { feedbacks, feedbacksRelations } from './feedback';
import { quizAnswers, quizAnswersRelations } from './quiz-answers';
import { quizQuestions, quizQuestionsRelations } from './quiz-questions';
import { quizType } from './quiz-type';
import { quizzes, quizzesRelations } from './quizzes';
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
  // クイズ関連
  quizzes,
  quizType,
  quizQuestions,
  quizAnswers,
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
  // クイズ関連
  quizzesRelations,
  quizQuestionsRelations,
  quizAnswersRelations,
  // アプリ関連
  servicesRelations,
  serviceTagRelations,
};
