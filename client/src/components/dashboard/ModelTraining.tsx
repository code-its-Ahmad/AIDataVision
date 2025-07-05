import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest } from "@/lib/queryClient";
import { Play, Pause, Square, Settings } from "lucide-react";

interface TrainingSession {
  id: number;
  modelId: number;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentEpoch: number;
  totalEpochs: number;
  currentLoss: number;
  currentAccuracy: number;
  learningRate: number;
  batchSize: number;
}

interface Model {
  id: number;
  name: string;
  type: string;
  status: string;
}

export function ModelTraining() {
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [learningRate, setLearningRate] = useState(0.001);
  const [batchSize, setBatchSize] = useState(32);
  const [epochs, setEpochs] = useState(200);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket('/ws');

  // Fetch models
  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });

  // Fetch training sessions
  const { data: sessions = [] } = useQuery<TrainingSession[]>({
    queryKey: ["/api/training-sessions"],
    refetchInterval: 2000,
  });

  // Start training mutation
  const startTrainingMutation = useMutation({
    mutationFn: async (config: { modelId: number; epochs: number; learningRate: number; batchSize: number }) => {
      return apiRequest("POST", `/api/models/${config.modelId}/train`, {
        epochs: config.epochs,
        learningRate: config.learningRate,
        batchSize: config.batchSize,
      });
    },
    onSuccess: () => {
      toast({
        title: "Training Started",
        description: "Model training has been initiated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
    },
    onError: () => {
      toast({
        title: "Training Failed",
        description: "Failed to start model training.",
        variant: "destructive",
      });
    },
  });

  // Update training session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: number; updates: Partial<TrainingSession> }) => {
      return apiRequest("PATCH", `/api/training-sessions/${sessionId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
    },
  });

  // Subscribe to WebSocket updates
  useEffect(() => {
    const unsubscribe = subscribe('training_updated', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
      if (data.sessionId === currentSession?.id) {
        setCurrentSession(prev => prev ? { ...prev, ...data.updates } : null);
      }
    });

    return unsubscribe;
  }, [subscribe, currentSession?.id, queryClient]);

  // Find active training session
  useEffect(() => {
    const activeSession = sessions.find(session => session.status === 'running');
    if (activeSession && !currentSession) {
      setCurrentSession(activeSession);
      setSelectedModel(activeSession.modelId);
    }
  }, [sessions, currentSession]);

  const handleStartTraining = () => {
    if (!selectedModel) {
      toast({
        title: "No Model Selected",
        description: "Please select a model to train.",
        variant: "destructive",
      });
      return;
    }

    startTrainingMutation.mutate({
      modelId: selectedModel,
      epochs,
      learningRate,
      batchSize,
    });
  };

  const handlePauseTraining = () => {
    if (currentSession) {
      updateSessionMutation.mutate({
        sessionId: currentSession.id,
        updates: { status: 'paused' }
      });
    }
  };

  const handleStopTraining = () => {
    if (currentSession) {
      updateSessionMutation.mutate({
        sessionId: currentSession.id,
        updates: { status: 'completed' }
      });
      setCurrentSession(null);
    }
  };

  const progressPercentage = currentSession 
    ? (currentSession.currentEpoch / currentSession.totalEpochs) * 100 
    : 0;

  const estimatedTimeRemaining = currentSession 
    ? Math.max(0, (currentSession.totalEpochs - currentSession.currentEpoch) * 0.2) // 0.2 minutes per epoch
    : 0;

  return (
    <Card className="animate-scale-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Model Training Center</CardTitle>
        <Button
          onClick={handleStartTraining}
          disabled={startTrainingMutation.isPending || currentSession?.status === 'running'}
          className="flex items-center space-x-2"
        >
          <Play className="h-4 w-4" />
          <span>Start Training</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Training Progress */}
        {currentSession && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {models.find(m => m.id === currentSession.modelId)?.name || 'Unknown Model'} - {currentSession.status}
              </span>
              <span className="text-sm font-medium">
                Epoch {currentSession.currentEpoch}/{currentSession.totalEpochs}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Loss: {currentSession.currentLoss?.toFixed(4) || 'N/A'}</span>
              <span>Accuracy: {((currentSession.currentAccuracy || 0) * 100).toFixed(1)}%</span>
              <span>ETA: {estimatedTimeRemaining.toFixed(0)} min</span>
            </div>
          </div>
        )}

        {/* Model Selection */}
        <div className="space-y-2">
          <Label htmlFor="model-select">Select Model</Label>
          <Select
            value={selectedModel?.toString() || ""}
            onValueChange={(value) => setSelectedModel(parseInt(value))}
            disabled={currentSession?.status === 'running'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a model to train" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <span>{model.name}</span>
                    <Badge variant="outline">{model.type}</Badge>
                    <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                      {model.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Training Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Learning Rate: {learningRate}</Label>
            <Slider
              value={[learningRate]}
              onValueChange={(value) => setLearningRate(value[0])}
              min={0.0001}
              max={0.1}
              step={0.0001}
              disabled={currentSession?.status === 'running'}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="batch-size">Batch Size</Label>
            <Select
              value={batchSize.toString()}
              onValueChange={(value) => setBatchSize(parseInt(value))}
              disabled={currentSession?.status === 'running'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16">16</SelectItem>
                <SelectItem value="32">32</SelectItem>
                <SelectItem value="64">64</SelectItem>
                <SelectItem value="128">128</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Epochs: {epochs}</Label>
            <Slider
              value={[epochs]}
              onValueChange={(value) => setEpochs(value[0])}
              min={10}
              max={500}
              step={10}
              disabled={currentSession?.status === 'running'}
              className="w-full"
            />
          </div>
        </div>

        {/* Training Controls */}
        {currentSession && (
          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePauseTraining}
              disabled={currentSession.status !== 'running'}
              variant="secondary"
              className="flex-1 flex items-center space-x-2"
            >
              <Pause className="h-4 w-4" />
              <span>Pause Training</span>
            </Button>
            <Button
              onClick={handleStopTraining}
              variant="destructive"
              className="flex-1 flex items-center space-x-2"
            >
              <Square className="h-4 w-4" />
              <span>Stop Training</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
