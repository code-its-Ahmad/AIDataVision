import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { DashboardMetrics, ModelPerformance, AIInsight, SystemMetric } from '../types/dashboard';

export function useRealTimeData() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    accuracy: 0,
    dataPoints: 0,
    activeModels: 0,
    processingSpeed: 0
  });
  
  const [performanceData, setPerformanceData] = useState<ModelPerformance[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { isConnected, subscribe } = useWebSocket('/ws');

  // Generate initial performance data
  const generatePerformanceData = useCallback(() => {
    const data: ModelPerformance[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp: timestamp.toISOString(),
        accuracy: 0.85 + Math.random() * 0.15,
        loss: 0.1 + Math.random() * 0.05,
        f1Score: 0.88 + Math.random() * 0.12
      });
    }
    
    setPerformanceData(data);
  }, []);

  // Generate initial metrics
  const generateInitialMetrics = useCallback(() => {
    setMetrics({
      accuracy: 94.7,
      dataPoints: 2400000,
      activeModels: 12,
      processingSpeed: 1200
    });
  }, []);

  // Subscribe to WebSocket updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeMetrics = subscribe('metrics_updated', (data: SystemMetric[]) => {
      setSystemMetrics(data);
      
      // Update dashboard metrics from system metrics
      const latestMetrics = data.reduce((acc, metric) => {
        switch (metric.metricType) {
          case 'accuracy':
            acc.accuracy = metric.value * 100;
            break;
          case 'data_points':
            acc.dataPoints = metric.value;
            break;
          case 'active_models':
            acc.activeModels = metric.value;
            break;
          case 'processing_speed':
            acc.processingSpeed = metric.value;
            break;
        }
        return acc;
      }, { ...metrics });
      
      setMetrics(latestMetrics);
    });

    const unsubscribeTraining = subscribe('training_updated', (data: any) => {
      // Update performance data when training progresses
      const now = new Date();
      const newDataPoint: ModelPerformance = {
        timestamp: now.toISOString(),
        accuracy: data.updates.currentAccuracy || 0,
        loss: data.updates.currentLoss || 0,
        f1Score: (data.updates.currentAccuracy || 0) * 0.95
      };
      
      setPerformanceData(prev => [...prev.slice(-23), newDataPoint]);
    });

    const unsubscribeInsights = subscribe('insight_created', (data: AIInsight) => {
      setInsights(prev => [data, ...prev]);
    });

    return () => {
      unsubscribeMetrics();
      unsubscribeTraining();
      unsubscribeInsights();
    };
  }, [isConnected, subscribe, metrics]);

  // Initialize data
  useEffect(() => {
    generateInitialMetrics();
    generatePerformanceData();
    setIsLoading(false);
  }, [generateInitialMetrics, generatePerformanceData]);

  // Simulate real-time updates when not connected to WebSocket
  useEffect(() => {
    if (isConnected) return;

    const interval = setInterval(() => {
      // Update metrics with small random changes
      setMetrics(prev => ({
        accuracy: Math.max(85, Math.min(99, prev.accuracy + (Math.random() - 0.5) * 0.5)),
        dataPoints: prev.dataPoints + Math.floor(Math.random() * 1000),
        activeModels: prev.activeModels + (Math.random() > 0.9 ? (Math.random() > 0.5 ? 1 : -1) : 0),
        processingSpeed: Math.max(800, Math.min(2000, prev.processingSpeed + (Math.random() - 0.5) * 100))
      }));

      // Add new performance data point
      const now = new Date();
      const newDataPoint: ModelPerformance = {
        timestamp: now.toISOString(),
        accuracy: 0.85 + Math.random() * 0.15,
        loss: 0.05 + Math.random() * 0.1,
        f1Score: 0.88 + Math.random() * 0.12
      };
      
      setPerformanceData(prev => [...prev.slice(-23), newDataPoint]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const updateMetric = useCallback((metricType: string, value: number) => {
    setMetrics(prev => ({
      ...prev,
      [metricType]: value
    }));
  }, []);

  const addInsight = useCallback((insight: Omit<AIInsight, 'id' | 'createdAt'>) => {
    const newInsight: AIInsight = {
      ...insight,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setInsights(prev => [newInsight, ...prev]);
  }, []);

  return {
    metrics,
    performanceData,
    insights,
    systemMetrics,
    isLoading,
    isConnected,
    updateMetric,
    addInsight
  };
}
