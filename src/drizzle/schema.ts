import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const quizzes = pgTable(
  'quizzes',
  {
    id: serial('id').primaryKey(),
    type: integer('type')
      .notNull()
      .references(() => quizType.id),
  },
  (table) => {
    return {
      typeIdx: index().on(table.type),
    };
  },
);

export const quizType = pgTable(
  'quiz_type',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
  },
  (table) => {
    return {
      uniqueNameIdx: uniqueIndex().on(table.name),
    };
  },
);

export const quizQuestions = pgTable(
  'quiz_questions',
  {
    id: serial('id').primaryKey(),
    quizId: integer('quiz_id')
      .notNull()
      .references(() => quizzes.id),
    highlight: text('highlight'),
    question: text('question').notNull(),
  },
  (table) => {
    return {
      quizIdx: uniqueIndex().on(table.quizId),
    };
  },
);

export const quizAnswers = pgTable(
  'quiz_answers',
  {
    id: serial('id').primaryKey(),
    quizId: integer('quiz_id')
      .notNull()
      .references(() => quizzes.id),
    answer: text('answer').notNull(),
    explanation: text('explanation'),
  },
  (table) => {
    return {
      quizIdx: index().on(table.quizId),
    };
  },
);

export const quizzesRelations = relations(
  quizzes,
  ({ one, many }) => ({
    type: one(quizType),
    question: one(quizQuestions, {
      fields: [quizzes.id],
      references: [quizQuestions.quizId],
    }),
    answers: many(quizAnswers),
  }),
);

export const quizQuestionsRelations = relations(
  quizQuestions,
  ({ one }) => ({
    quiz: one(quizzes, {
      fields: [quizQuestions.quizId],
      references: [quizzes.id],
    }),
  }),
);

export const quizAnswersRelations = relations(
  quizAnswers,
  ({ one }) => ({
    quiz: one(quizzes, {
      fields: [quizAnswers.quizId],
      references: [quizzes.id],
    }),
  }),
);

export const blogs = pgTable(
  'blogs',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    slug: text('slug').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      uniqueTitleIdx: uniqueIndex().on(table.title),
      uniqueSlugIdx: uniqueIndex().on(table.slug),
    };
  },
);

export const blogViews = pgTable(
  'blog_views',
  {
    blogId: integer('blog_id')
      .notNull()
      .references(() => blogs.id)
      .primaryKey(),
    views: integer('views').notNull().default(0),
  },
  (table) => {
    return {
      blogIdx: index().on(table.blogId),
    };
  },
);

export const tags = pgTable(
  'tags',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
  },
  (table) => {
    return {
      uniqueNameIdx: uniqueIndex().on(table.name),
    };
  },
);

export const blogTag = pgTable(
  'blog_tag',
  {
    blogId: integer('blog_id')
      .notNull()
      .references(() => blogs.id),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (table) => {
    return {
      blogIdx: index().on(table.blogId),
      tagIdx: index().on(table.tagId),
      uniqueBlogTagIdx: uniqueIndex().on(table.blogId, table.tagId),
    };
  },
);

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  views: one(blogViews),
  tags: many(blogTag),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  blogs: many(blogTag),
}));

export const blogTagRelations = relations(blogTag, ({ one }) => ({
  blog: one(blogs, {
    fields: [blogTag.blogId],
    references: [blogs.id],
  }),
  tag: one(tags, {
    fields: [blogTag.tagId],
    references: [tags.id],
  }),
}));
