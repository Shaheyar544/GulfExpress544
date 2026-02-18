import { pgTable, text, varchar, timestamp, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Shipment tracking
export const shipments = pgTable("shipments", {
  id: varchar("id").primaryKey(),
  trackingNumber: text("tracking_number").notNull().unique(),
  senderName: text("sender_name").notNull(),
  senderCity: text("sender_city").notNull(),
  senderPhone: text("sender_phone").notNull(),
  senderEmail: text("sender_email").notNull(),
  receiverName: text("receiver_name").notNull(),
  receiverCountry: text("receiver_country").notNull(),
  receiverCity: text("receiver_city").notNull(),
  receiverAddress: text("receiver_address").notNull(),
  receiverPhone: text("receiver_phone").notNull(),
  shipmentType: text("shipment_type").notNull(), // documents, parcels, freight
  weight: real("weight").notNull(),
  dimensions: text("dimensions"),
  deliveryMode: text("delivery_mode").notNull(), // same-day, next-day, express, economy
  pickupRequired: boolean("pickup_required").default(false),
  status: text("status").notNull().default("pending"), // pending, picked-up, in-transit, out-for-delivery, delivered
  currentLocation: text("current_location"),
  estimatedDelivery: text("estimated_delivery"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
});
// @ts-ignore
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipments.$inferSelect;

// Quotation requests
export const quotations = pgTable("quotations", {
  id: varchar("id").primaryKey(),
  senderName: text("sender_name").notNull(),
  senderCity: text("sender_city").notNull(),
  receiverCountry: text("receiver_country").notNull(),
  shipmentType: text("shipment_type").notNull(),
  weight: real("weight").notNull(),
  length: real("length"),
  width: real("width"),
  height: real("height"),
  pickupRequired: boolean("pickup_required").default(false),
  deliveryMode: text("delivery_mode").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  estimatedPrice: real("estimated_price"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({
  id: true,
  createdAt: true,
  estimatedPrice: true,
});
// @ts-ignore
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotations.$inferSelect;

// Contact form submissions
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});
// @ts-ignore
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Newsletter subscriptions
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  createdAt: true,
});
// @ts-ignore
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

// Booking/Shipment requests
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey(),
  senderName: text("sender_name").notNull(),
  senderPhone: text("sender_phone").notNull(),
  senderEmail: text("sender_email").notNull(),
  senderAddress: text("sender_address").notNull(),
  senderCity: text("sender_city").notNull(),
  receiverName: text("receiver_name").notNull(),
  receiverPhone: text("receiver_phone").notNull(),
  receiverEmail: text("receiver_email"),
  receiverAddress: text("receiver_address").notNull(),
  receiverCity: text("receiver_city").notNull(),
  receiverCountry: text("receiver_country").notNull(),
  shipmentType: text("shipment_type").notNull(),
  weight: real("weight").notNull(),
  length: real("length"),
  width: real("width"),
  height: real("height"),
  deliveryMode: text("delivery_mode").notNull(),
  pickupRequired: boolean("pickup_required").default(true),
  pickupDate: text("pickup_date"),
  specialInstructions: text("special_instructions"),
  status: text("status").notNull().default("pending"),
  trackingNumber: text("tracking_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  trackingNumber: true,
  status: true,
});
// @ts-ignore
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Keep existing user schema for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// @ts-ignore
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Site Configuration
export const siteConfigs = pgTable("site_configs", {
  id: varchar("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g., 'google_analytics_id', 'adsense_id'
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSiteConfigSchema = createInsertSchema(siteConfigs).omit({
  id: true,
  createdAt: true,
});
// @ts-ignore
export type InsertSiteConfig = z.infer<typeof insertSiteConfigSchema>;
export type SiteConfig = typeof siteConfigs.$inferSelect;

// TypeScript interfaces for frontend use
export interface TrackingStatus {
  id: string;
  trackingNumber: string;
  status: "pending" | "picked-up" | "in-transit" | "out-for-delivery" | "delivered";
  currentLocation: string;
  estimatedDelivery: string;
  timeline: TrackingEvent[];
}

export interface TrackingEvent {
  status: string;
  location: string;
  date: string;
  time: string;
  completed: boolean;
}

export interface PickupLocation {
  id: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  coordinates: { lat: number; lng: number };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}
