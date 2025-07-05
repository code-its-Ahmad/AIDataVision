import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { mlService } from "./services/mlService";
import { chatWithAI } from "./services/gemini";
import { insertDatasetSchema, insertMlModelSchema, insertTrainingSessionSchema } from "@shared/schema";
import multer from "multer";
import path from "path";

const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    
    ws.on('close', () => {
      clients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });
  
  // Broadcast to all connected clients
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // Dashboard overview
  app.get("/api/dashboard", async (req, res) => {
    try {
      const [models, datasets, insights, metrics] = await Promise.all([
        storage.getMlModels(),
        storage.getDatasets(),
        storage.getAiInsights(),
        storage.getLatestMetrics()
      ]);
      
      res.json({
        models: models.slice(0, 10),
        datasets: datasets.slice(0, 5),
        insights: insights.slice(0, 10),
        metrics: metrics.slice(0, 20)
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: "Failed to load dashboard data" });
    }
  });

  // Models API
  app.get("/api/models", async (req, res) => {
    try {
      const models = await storage.getMlModels();
      res.json(models);
    } catch (error) {
      console.error("Models fetch error:", error);
      res.status(500).json({ error: "Failed to fetch models" });
    }
  });

  app.post("/api/models", async (req, res) => {
    try {
      const modelData = insertMlModelSchema.parse(req.body);
      const model = await storage.createMlModel(modelData);
      
      broadcast({ type: "model_created", data: model });
      res.json(model);
    } catch (error) {
      console.error("Model creation error:", error);
      res.status(500).json({ error: "Failed to create model" });
    }
  });

  app.post("/api/models/:id/train", async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const trainingConfig = req.body;
      
      await mlService.startModelTraining(modelId, trainingConfig);
      
      broadcast({ type: "training_started", data: { modelId, config: trainingConfig } });
      res.json({ success: true, message: "Training started" });
    } catch (error) {
      console.error("Training start error:", error);
      res.status(500).json({ error: "Failed to start training" });
    }
  });

  app.post("/api/models/:id/predict", async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const inputData = req.body;
      
      const prediction = await mlService.makePrediction(modelId, inputData);
      
      broadcast({ type: "prediction_made", data: { modelId, prediction } });
      res.json(prediction);
    } catch (error) {
      console.error("Prediction error:", error);
      res.status(500).json({ error: "Failed to make prediction" });
    }
  });

  // Datasets API
  app.get("/api/datasets", async (req, res) => {
    try {
      const datasets = await storage.getDatasets();
      res.json(datasets);
    } catch (error) {
      console.error("Datasets fetch error:", error);
      res.status(500).json({ error: "Failed to fetch datasets" });
    }
  });

  app.post("/api/datasets", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const datasetData = insertDatasetSchema.parse({
        name: req.body.name || req.file.originalname,
        description: req.body.description,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      });
      
      const dataset = await storage.createDataset(datasetData);
      
      // Process dataset asynchronously
      mlService.processDataset(dataset.id, req.file.path);
      
      broadcast({ type: "dataset_uploaded", data: dataset });
      res.json(dataset);
    } catch (error) {
      console.error("Dataset upload error:", error);
      res.status(500).json({ error: "Failed to upload dataset" });
    }
  });

  // Training Sessions API
  app.get("/api/training-sessions", async (req, res) => {
    try {
      const sessions = await storage.getTrainingSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Training sessions fetch error:", error);
      res.status(500).json({ error: "Failed to fetch training sessions" });
    }
  });

  app.patch("/api/training-sessions/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const updates = req.body;
      
      await storage.updateTrainingSession(sessionId, updates);
      
      broadcast({ type: "training_updated", data: { sessionId, updates } });
      res.json({ success: true });
    } catch (error) {
      console.error("Training session update error:", error);
      res.status(500).json({ error: "Failed to update training session" });
    }
  });

  // Predictions API
  app.get("/api/predictions", async (req, res) => {
    try {
      const modelId = req.query.modelId ? parseInt(req.query.modelId as string) : undefined;
      const predictions = await storage.getPredictions(modelId);
      res.json(predictions);
    } catch (error) {
      console.error("Predictions fetch error:", error);
      res.status(500).json({ error: "Failed to fetch predictions" });
    }
  });

  // AI Insights API
  app.get("/api/insights", async (req, res) => {
    try {
      const insights = await storage.getAiInsights();
      res.json(insights);
    } catch (error) {
      console.error("Insights fetch error:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  app.post("/api/insights/:id/resolve", async (req, res) => {
    try {
      const insightId = parseInt(req.params.id);
      await storage.updateAiInsightStatus(insightId, "resolved");
      
      broadcast({ type: "insight_resolved", data: { insightId } });
      res.json({ success: true });
    } catch (error) {
      console.error("Insight resolution error:", error);
      res.status(500).json({ error: "Failed to resolve insight" });
    }
  });

  // AI Chat API
  app.post("/api/chat", async (req, res) => {
    try {
      const { query, context } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      
      const response = await chatWithAI(query, context);
      res.json({ response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: "Failed to process AI chat request" });
    }
  });

  // System Metrics API
  app.get("/api/metrics", async (req, res) => {
    try {
      const { type, start, end } = req.query;
      
      const timeRange = start && end ? {
        start: new Date(start as string),
        end: new Date(end as string)
      } : undefined;
      
      const metrics = await storage.getSystemMetrics(type as string, timeRange);
      res.json(metrics);
    } catch (error) {
      console.error("Metrics fetch error:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // Export API
  app.get("/api/export", async (req, res) => {
    try {
      const { type, format } = req.query;
      
      // Generate export data based on type
      let exportData: any = {};
      
      switch (type) {
        case "models":
          exportData = await storage.getMlModels();
          break;
        case "datasets":
          exportData = await storage.getDatasets();
          break;
        case "metrics":
          exportData = await storage.getLatestMetrics();
          break;
        default:
          exportData = await storage.getLatestMetrics();
      }
      
      if (format === "csv") {
        // Convert to CSV format
        const csv = convertToCSV(exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${type || 'data'}.csv"`);
        res.send(csv);
      } else {
        // Default JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${type || 'data'}.json"`);
        res.json(exportData);
      }
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Periodic updates
  setInterval(async () => {
    try {
      await mlService.updateSystemMetrics();
      await mlService.generateSystemInsights();
      
      const metrics = await storage.getLatestMetrics();
      broadcast({ type: "metrics_updated", data: metrics });
    } catch (error) {
      console.error("Periodic update error:", error);
    }
  }, 30000); // Update every 30 seconds

  return httpServer;
}

function convertToCSV(data: any[]): string {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}
