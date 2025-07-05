import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const datasets = pgTable("datasets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  processingProgress: real("processing_progress").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mlModels = pgTable("ml_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // neural_network, random_forest, xgboost, etc.
  description: text("description"),
  status: text("status").notNull().default("inactive"), // active, training, inactive, failed
  accuracy: real("accuracy"),
  loss: real("loss"),
  f1Score: real("f1_score"),
  configuration: jsonb("configuration"),
  datasetId: integer("dataset_id").references(() => datasets.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trainingSessions = pgTable("training_sessions", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").references(() => mlModels.id),
  status: text("status").notNull().default("running"), // running, completed, failed, paused
  currentEpoch: integer("current_epoch").default(0),
  totalEpochs: integer("total_epochs").notNull(),
  currentLoss: real("current_loss"),
  currentAccuracy: real("current_accuracy"),
  learningRate: real("learning_rate").notNull(),
  batchSize: integer("batch_size").notNull(),
  trainingData: jsonb("training_data"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").references(() => mlModels.id),
  inputData: jsonb("input_data").notNull(),
  outputData: jsonb("output_data").notNull(),
  confidence: real("confidence"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // anomaly, pattern, recommendation, etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  status: text("status").notNull().default("active"), // active, resolved, dismissed
  confidence: real("confidence"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  metricType: text("metric_type").notNull(), // accuracy, data_points, active_models, processing_speed
  value: real("value").notNull(),
  unit: text("unit"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  datasets: many(datasets),
  mlModels: many(mlModels),
}));

export const datasetsRelations = relations(datasets, ({ one, many }) => ({
  uploadedBy: one(users, { fields: [datasets.uploadedBy], references: [users.id] }),
  mlModels: many(mlModels),
}));

export const mlModelsRelations = relations(mlModels, ({ one, many }) => ({
  dataset: one(datasets, { fields: [mlModels.datasetId], references: [datasets.id] }),
  createdBy: one(users, { fields: [mlModels.createdBy], references: [users.id] }),
  trainingSessions: many(trainingSessions),
  predictions: many(predictions),
}));

export const trainingSessionsRelations = relations(trainingSessions, ({ one }) => ({
  model: one(mlModels, { fields: [trainingSessions.modelId], references: [mlModels.id] }),
}));

export const predictionsRelations = relations(predictions, ({ one }) => ({
  model: one(mlModels, { fields: [predictions.modelId], references: [mlModels.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const insertDatasetSchema = createInsertSchema(datasets).pick({
  name: true,
  description: true,
  fileName: true,
  fileSize: true,
  fileType: true,
});

export const insertMlModelSchema = createInsertSchema(mlModels).pick({
  name: true,
  type: true,
  description: true,
  configuration: true,
  datasetId: true,
});

export const insertTrainingSessionSchema = createInsertSchema(trainingSessions).pick({
  modelId: true,
  totalEpochs: true,
  learningRate: true,
  batchSize: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).pick({
  modelId: true,
  inputData: true,
  outputData: true,
  confidence: true,
});

export const insertAiInsightSchema = createInsertSchema(aiInsights).pick({
  type: true,
  title: true,
  description: true,
  priority: true,
  confidence: true,
  metadata: true,
});

export const insertSystemMetricSchema = createInsertSchema(systemMetrics).pick({
  metricType: true,
  value: true,
  unit: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Dataset = typeof datasets.$inferSelect;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type MlModel = typeof mlModels.$inferSelect;
export type InsertMlModel = z.infer<typeof insertMlModelSchema>;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertSystemMetric = z.infer<typeof insertSystemMetricSchema>;
