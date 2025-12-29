import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { services } from './services';
import { tags } from './tags';

export const serviceTag = sqliteTable(
  'service_tag',
  {
    serviceId: integer('service_id')
      .notNull()
      .references(() => services.id),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (table) => [
    index('service_tag_service_id_idx').on(table.serviceId),
    index('service_tag_tag_id_idx').on(table.tagId),
    uniqueIndex('service_tag_unique_idx').on(table.serviceId, table.tagId),
  ],
);

export const serviceTagRelations = relations(serviceTag, ({ one }) => ({
  service: one(services, {
    fields: [serviceTag.serviceId],
    references: [services.id],
  }),
  tag: one(tags, {
    fields: [serviceTag.tagId],
    references: [tags.id],
  }),
}));
