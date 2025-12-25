import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const donghua = sqliteTable("donghua", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  title: text("title").notNull(),
  link: text("link").notNull(),
  site: text("site").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$onUpdateFn(() => new Date()),
});
type Video = {
  link: string;
  label: string;
};
/* =======================
   Chapter
======================= */
export const chapter = sqliteTable("chapter", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  title: text("title").notNull(),
  link: text("link").notNull(),
  site: text("site").notNull(),

  // Json[] en Prisma → JSON en SQLite
  videos: text("videos", { mode: "json" }).$type<Video[]>().notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$onUpdateFn(() => new Date()),
});
