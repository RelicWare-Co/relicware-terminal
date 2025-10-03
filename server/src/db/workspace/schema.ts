import { organization, user } from "@/db/auth/schema";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

type PageContentBlock = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  children?: PageContentBlock[];
};

type PageProperty = Record<string, unknown>;

export const workspaceFolder = sqliteTable(
  "workspace_folder",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    parentFolderId: text("parent_folder_id").references(
      (): AnySQLiteColumn => workspaceFolder.id,
      { onDelete: "cascade" }
    ),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
    position: integer("position").notNull().default(0),
    isArchived: integer("is_archived", { mode: "boolean" })
      .default(false)
      .notNull(),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedById: text("updated_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("workspace_folder_org_idx").on(table.organizationId),
    index("workspace_folder_parent_idx").on(table.parentFolderId),
    uniqueIndex("workspace_folder_parent_name_unq").on(
      table.organizationId,
      table.parentFolderId,
      table.name
    ),
  ]
);

export const workspacePage = sqliteTable(
  "workspace_page",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    folderId: text("folder_id").references(() => workspaceFolder.id, {
      onDelete: "set null",
    }),
    parentPageId: text("parent_page_id").references(
      (): AnySQLiteColumn => workspacePage.id,
      { onDelete: "cascade" }
    ),
    title: text("title").notNull(),
    slug: text("slug"),
    icon: text("icon"),
    coverImage: text("cover_image"),
    summary: text("summary"),
    content: text("content", { mode: "json" })
      .$type<PageContentBlock[]>()
      .default(sql`'[]'`)
      .notNull(),
    properties: text("properties", { mode: "json" })
      .$type<PageProperty>()
      .default(sql`'{}'`)
      .notNull(),
    isArchived: integer("is_archived", { mode: "boolean" })
      .default(false)
      .notNull(),
    isFavorite: integer("is_favorite", { mode: "boolean" })
      .default(false)
      .notNull(),
    position: integer("position").notNull().default(0),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedById: text("updated_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("workspace_page_org_idx").on(table.organizationId),
    index("workspace_page_folder_idx").on(table.folderId),
    index("workspace_page_parent_idx").on(table.parentPageId),
    uniqueIndex("workspace_page_slug_unq").on(
      table.organizationId,
      table.slug
    ),
  ]
);

export const workspacePageRevision = sqliteTable(
  "workspace_page_revision",
  {
    id: text("id").primaryKey(),
    pageId: text("page_id")
      .notNull()
      .references(() => workspacePage.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    summary: text("summary"),
    content: text("content", { mode: "json" })
      .$type<PageContentBlock[]>()
      .notNull(),
    properties: text("properties", { mode: "json" })
      .$type<PageProperty>()
      .notNull(),
    editorId: text("editor_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("workspace_page_revision_page_idx").on(table.pageId),
    uniqueIndex("workspace_page_revision_version_unq").on(
      table.pageId,
      table.version
    ),
  ]
);

export const workspaceFolderRelations = relations(
  workspaceFolder,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [workspaceFolder.organizationId],
      references: [organization.id],
    }),
    parent: one(workspaceFolder, {
      relationName: "workspaceFolderHierarchy",
      fields: [workspaceFolder.parentFolderId],
      references: [workspaceFolder.id],
    }),
    children: many(workspaceFolder, {
      relationName: "workspaceFolderHierarchy",
    }),
    createdBy: one(user, {
      relationName: "folderCreatedBy",
      fields: [workspaceFolder.createdById],
      references: [user.id],
    }),
    updatedBy: one(user, {
      relationName: "folderUpdatedBy",
      fields: [workspaceFolder.updatedById],
      references: [user.id],
    }),
    pages: many(workspacePage),
  })
);

export const workspacePageRelations = relations(
  workspacePage,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [workspacePage.organizationId],
      references: [organization.id],
    }),
    folder: one(workspaceFolder, {
      fields: [workspacePage.folderId],
      references: [workspaceFolder.id],
    }),
    parent: one(workspacePage, {
      relationName: "workspacePageHierarchy",
      fields: [workspacePage.parentPageId],
      references: [workspacePage.id],
    }),
    children: many(workspacePage, {
      relationName: "workspacePageHierarchy",
    }),
    createdBy: one(user, {
      relationName: "pageCreatedBy",
      fields: [workspacePage.createdById],
      references: [user.id],
    }),
    updatedBy: one(user, {
      relationName: "pageUpdatedBy",
      fields: [workspacePage.updatedById],
      references: [user.id],
    }),
    revisions: many(workspacePageRevision),
  })
);

export const workspacePageRevisionRelations = relations(
  workspacePageRevision,
  ({ one }) => ({
    page: one(workspacePage, {
      fields: [workspacePageRevision.pageId],
      references: [workspacePage.id],
    }),
    editor: one(user, {
      fields: [workspacePageRevision.editorId],
      references: [user.id],
    }),
  })
);

