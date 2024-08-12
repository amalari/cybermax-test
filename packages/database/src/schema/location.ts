import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { AnyPgColumn, integer, numeric, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  building: varchar("building").notNull(),
  number: varchar("number").unique().notNull(),
  area: numeric("area"),
  level: integer("level").notNull(),
  parentId: integer("parentId").references((): AnyPgColumn => locations.id, { onDelete: "cascade" })
});

export const locationsRelations = relations(locations, ({ one, many }) => ({
  parent: one(locations, {
    fields: [locations.parentId],
    references: [locations.id],
    relationName: "sublocations"
  }),
  children: many(locations, {
    relationName: "sublocations"
  })
}));

export type InsertLocation = InferInsertModel<typeof locations>
export type SelectLocation = InferSelectModel<typeof locations>
