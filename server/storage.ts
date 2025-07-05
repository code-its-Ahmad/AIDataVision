import { 
  users, datasets, mlModels, trainingSessions, predictions, aiInsights, systemMetrics,
  type User, type InsertUser, type Dataset, type InsertDataset, type MlModel, type InsertMlModel,
  type TrainingSession, type InsertTrainingSession, type Prediction, type InsertPrediction,
  type AiInsight, type InsertAiInsight, type SystemMetric, type InsertSystemMetric
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Datasets
  getDatasets(): Promise<Dataset[]>;
  getDataset(id: number): Promise<Dataset | undefined>;
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  updateDatasetStatus(id: number, status: string, progress?: number): Promise<void>;
  
  // ML Models
  getMlModels(): Promise<MlModel[]>;
  getMlModel(id: number): Promise<MlModel | undefined>;
  createMlModel(model: InsertMlModel): Promise<MlModel>;
  updateMlModel(id: number, updates: Partial<MlModel>): Promise<void>;
  
  // Training Sessions
  getTrainingSessions(): Promise<TrainingSession[]>;
  getTrainingSession(id: number): Promise<TrainingSession | undefined>;
  createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession>;
  updateTrainingSession(id: number, updates: Partial<TrainingSession>): Promise<void>;
  
  // Predictions
  getPredictions(modelId?: number): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  
  // AI Insights
  getAiInsights(): Promise<AiInsight[]>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  updateAiInsightStatus(id: number, status: string): Promise<void>;
  
  // System Metrics
  getSystemMetrics(metricType?: string, timeRange?: { start: Date; end: Date }): Promise<SystemMetric[]>;
  createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric>;
  getLatestMetrics(): Promise<SystemMetric[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Datasets
  async getDatasets(): Promise<Dataset[]> {
    return await db.select().from(datasets).orderBy(desc(datasets.createdAt));
  }

  async getDataset(id: number): Promise<Dataset | undefined> {
    const [dataset] = await db.select().from(datasets).where(eq(datasets.id, id));
    return dataset || undefined;
  }

  async createDataset(insertDataset: InsertDataset): Promise<Dataset> {
    const [dataset] = await db.insert(datasets).values(insertDataset).returning();
    return dataset;
  }

  async updateDatasetStatus(id: number, status: string, progress?: number): Promise<void> {
    const updates: any = { status };
    if (progress !== undefined) {
      updates.processingProgress = progress;
    }
    await db.update(datasets).set(updates).where(eq(datasets.id, id));
  }

  // ML Models
  async getMlModels(): Promise<MlModel[]> {
    return await db.select().from(mlModels).orderBy(desc(mlModels.createdAt));
  }

  async getMlModel(id: number): Promise<MlModel | undefined> {
    const [model] = await db.select().from(mlModels).where(eq(mlModels.id, id));
    return model || undefined;
  }

  async createMlModel(insertMlModel: InsertMlModel): Promise<MlModel> {
    const [model] = await db.insert(mlModels).values(insertMlModel).returning();
    return model;
  }

  async updateMlModel(id: number, updates: Partial<MlModel>): Promise<void> {
    await db.update(mlModels).set(updates).where(eq(mlModels.id, id));
  }

  // Training Sessions
  async getTrainingSessions(): Promise<TrainingSession[]> {
    return await db.select().from(trainingSessions).orderBy(desc(trainingSessions.startedAt));
  }

  async getTrainingSession(id: number): Promise<TrainingSession | undefined> {
    const [session] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, id));
    return session || undefined;
  }

  async createTrainingSession(insertTrainingSession: InsertTrainingSession): Promise<TrainingSession> {
    const [session] = await db.insert(trainingSessions).values(insertTrainingSession).returning();
    return session;
  }

  async updateTrainingSession(id: number, updates: Partial<TrainingSession>): Promise<void> {
    await db.update(trainingSessions).set(updates).where(eq(trainingSessions.id, id));
  }

  // Predictions
  async getPredictions(modelId?: number): Promise<Prediction[]> {
    const query = db.select().from(predictions);
    if (modelId) {
      return await query.where(eq(predictions.modelId, modelId)).orderBy(desc(predictions.createdAt));
    }
    return await query.orderBy(desc(predictions.createdAt));
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const [prediction] = await db.insert(predictions).values(insertPrediction).returning();
    return prediction;
  }

  // AI Insights
  async getAiInsights(): Promise<AiInsight[]> {
    return await db.select().from(aiInsights).orderBy(desc(aiInsights.createdAt));
  }

  async createAiInsight(insertAiInsight: InsertAiInsight): Promise<AiInsight> {
    const [insight] = await db.insert(aiInsights).values(insertAiInsight).returning();
    return insight;
  }

  async updateAiInsightStatus(id: number, status: string): Promise<void> {
    await db.update(aiInsights).set({ status }).where(eq(aiInsights.id, id));
  }

  // System Metrics
  async getSystemMetrics(metricType?: string, timeRange?: { start: Date; end: Date }): Promise<SystemMetric[]> {
    let query = db.select().from(systemMetrics);
    
    const conditions = [];
    if (metricType) {
      conditions.push(eq(systemMetrics.metricType, metricType));
    }
    if (timeRange) {
      conditions.push(gte(systemMetrics.timestamp, timeRange.start));
      conditions.push(lte(systemMetrics.timestamp, timeRange.end));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(systemMetrics.timestamp));
  }

  async createSystemMetric(insertSystemMetric: InsertSystemMetric): Promise<SystemMetric> {
    const [metric] = await db.insert(systemMetrics).values(insertSystemMetric).returning();
    return metric;
  }

  async getLatestMetrics(): Promise<SystemMetric[]> {
    return await db.select().from(systemMetrics)
      .orderBy(desc(systemMetrics.timestamp))
      .limit(20);
  }
}

export const storage = new DatabaseStorage();
