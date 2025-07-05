export interface DashboardMetrics {
  accuracy: number;
  dataPoints: number;
  activeModels: number;
  processingSpeed: number;
}

export interface ModelPerformance {
  timestamp: string;
  accuracy: number;
  loss: number;
  f1Score: number;
}

export interface PredictionDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface TrainingProgress {
  modelId: number;
  modelName: string;
  currentEpoch: number;
  totalEpochs: number;
  currentLoss: number;
  currentAccuracy: number;
  status: 'running' | 'paused' | 'completed' | 'failed';
  estimatedTimeRemaining: number;
}

export interface AIInsight {
  id: number;
  type: 'pattern' | 'anomaly' | 'recommendation' | 'training_complete';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  status: 'active' | 'resolved' | 'dismissed';
  createdAt: string;
  metadata?: any;
}

export interface DatasetInfo {
  id: number;
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: 'processing' | 'completed' | 'failed';
  processingProgress: number;
  createdAt: string;
}

export interface ModelInfo {
  id: number;
  name: string;
  type: string;
  description?: string;
  status: 'active' | 'training' | 'inactive' | 'failed';
  accuracy?: number;
  loss?: number;
  f1Score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SystemMetric {
  id: number;
  metricType: string;
  value: number;
  unit?: string;
  timestamp: string;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: string;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface HeatmapData {
  x: string;
  y: string;
  value: number;
}

export interface PredictionResult {
  result: any;
  confidence: number;
  probabilities?: Record<string, number>;
  metadata?: any;
}

export interface TrainingConfiguration {
  epochs: number;
  learningRate: number;
  batchSize: number;
  optimizer?: string;
  lossFunction?: string;
}

export interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface ExportOptions {
  type: 'models' | 'datasets' | 'metrics' | 'insights';
  format: 'json' | 'csv' | 'xlsx';
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
}
