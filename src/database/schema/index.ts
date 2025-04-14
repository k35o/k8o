import { blogComment, blogCommentRelations } from './blog-comment';
import { blogTag, blogTagRelations } from './blog-tag';
import { blogViews } from './blog-views';
import { blogs, blogsRelations } from './blogs';
import { comments, commentsRelations } from './comments';
import { feedbacks, feedbacksRelations } from './feedback';
import { quizAnswers, quizAnswersRelations } from './quiz-answers';
import {
  quizQuestions,
  quizQuestionsRelations,
} from './quiz-questions';
import { quizType } from './quiz-type';
import { quizzes, quizzesRelations } from './quzzes';
import { tags, tagsRelations } from './tags';

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
  // クイズ関連
  quizzes,
  quizType,
  quizQuestions,
  quizAnswers,
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
  // クイズ関連
  quizzesRelations,
  quizQuestionsRelations,
  quizAnswersRelations,
};
