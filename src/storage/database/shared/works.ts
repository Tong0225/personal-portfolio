import { pgTable, serial, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core"

export const works = pgTable("works", {
  id: serial().primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // image, video, pdf
  category: text("category"), // 一级分类ID
  sub_category: text("sub_category"), // 二级分类名称
  tags: jsonb("tags").default([]), // 标签数组
  description: text("description"),
  source: text("source"), // 资源链接或B站BV号
  thumbnail: text("thumbnail"), // 缩略图URL
  featured: boolean("featured").default(false), // 是否精选
  created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
