import * as tf from '@tensorflow/tfjs';

export class MLUtils {
  static async loadModel(modelPath: string): Promise<tf.LayersModel> {
    try {
      const model = await tf.loadLayersModel(modelPath);
      return model;
    } catch (error) {
      console.error('Error loading model:', error);
      throw new Error('Failed to load ML model');
    }
  }

  static async createSimpleModel(inputShape: number[]): Promise<tf.LayersModel> {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape,
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  static async trainModel(
    model: tf.LayersModel,
    trainData: tf.Tensor,
    trainLabels: tf.Tensor,
    validationData?: tf.Tensor,
    validationLabels?: tf.Tensor,
    epochs: number = 100,
    batchSize: number = 32,
    onEpochEnd?: (epoch: number, logs: any) => void
  ): Promise<tf.History> {
    const history = await model.fit(trainData, trainLabels, {
      epochs,
      batchSize,
      validationData: validationData && validationLabels ? [validationData, validationLabels] : undefined,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (onEpochEnd) {
            onEpochEnd(epoch, logs);
          }
        }
      }
    });

    return history;
  }

  static async makePrediction(model: tf.LayersModel, inputData: number[][]): Promise<number[]> {
    const tensor = tf.tensor2d(inputData);
    const prediction = model.predict(tensor) as tf.Tensor;
    const result = await prediction.data();
    
    tensor.dispose();
    prediction.dispose();
    
    return Array.from(result);
  }

  static preprocessData(data: number[][]): { normalized: number[][]; mean: number[]; std: number[] } {
    const tensor = tf.tensor2d(data);
    const { mean, variance } = tf.moments(tensor, 0);
    const std = tf.sqrt(variance);
    
    const normalized = tf.div(tf.sub(tensor, mean), std);
    
    const normalizedData = normalized.arraySync() as number[][];
    const meanData = mean.arraySync() as number[];
    const stdData = std.arraySync() as number[];
    
    tensor.dispose();
    mean.dispose();
    variance.dispose();
    std.dispose();
    normalized.dispose();
    
    return {
      normalized: normalizedData,
      mean: meanData,
      std: stdData
    };
  }

  static calculateMetrics(predictions: number[], actual: number[]): {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  } {
    if (predictions.length !== actual.length) {
      throw new Error('Predictions and actual arrays must have the same length');
    }

    const threshold = 0.5;
    const binaryPredictions = predictions.map(p => p > threshold ? 1 : 0);
    
    let tp = 0, fp = 0, fn = 0, tn = 0;
    
    for (let i = 0; i < binaryPredictions.length; i++) {
      if (binaryPredictions[i] === 1 && actual[i] === 1) tp++;
      else if (binaryPredictions[i] === 1 && actual[i] === 0) fp++;
      else if (binaryPredictions[i] === 0 && actual[i] === 1) fn++;
      else if (binaryPredictions[i] === 0 && actual[i] === 0) tn++;
    }

    const accuracy = (tp + tn) / (tp + fp + fn + tn);
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    return { accuracy, precision, recall, f1Score };
  }

  static generateSyntheticData(samples: number, features: number): {
    data: number[][];
    labels: number[];
  } {
    const data: number[][] = [];
    const labels: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      const row: number[] = [];
      let sum = 0;
      
      for (let j = 0; j < features; j++) {
        const value = Math.random() * 2 - 1; // Random value between -1 and 1
        row.push(value);
        sum += value;
      }
      
      data.push(row);
      labels.push(sum > 0 ? 1 : 0); // Binary classification based on sum
    }
    
    return { data, labels };
  }

  static async exportModel(model: tf.LayersModel, name: string): Promise<void> {
    await model.save(`downloads://${name}`);
  }

  static createFeatureCorrelationMatrix(data: number[][]): number[][] {
    const numFeatures = data[0].length;
    const correlationMatrix: number[][] = [];
    
    for (let i = 0; i < numFeatures; i++) {
      correlationMatrix[i] = [];
      for (let j = 0; j < numFeatures; j++) {
        const feature1 = data.map(row => row[i]);
        const feature2 = data.map(row => row[j]);
        correlationMatrix[i][j] = this.calculateCorrelation(feature1, feature2);
      }
    }
    
    return correlationMatrix;
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
}
