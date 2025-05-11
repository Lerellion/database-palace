import { pgTable, serial, text, varchar, timestamp, integer, decimal, boolean } from "drizzle-orm/pg-core"
import { roleEnum, orderStatusEnum } from "./enums"

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 255 }).notNull(),
  first_name: varchar("first_name", { length: 255 }).notNull(),
  last_name: varchar("last_name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  is_admin: boolean("is_admin").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  inStock: integer("in_stock").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  status: orderStatusEnum("status").default("pending"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
})
