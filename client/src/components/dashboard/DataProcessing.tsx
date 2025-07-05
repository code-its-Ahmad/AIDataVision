import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  FileText, 
  Database, 
  CheckCircle, 
  AlertCircle,
  File,
  Trash2
} from "lucide-react";
import { useDropzone } from "react-dropzone";

interface Dataset {
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

interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export function DataProcessing() {
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [datasetName, setDatasetName] = useState("");
  const [datasetDescription, setDatasetDescription] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket('/ws');

  // Fetch datasets
  const { data: datasets = [], isLoading } = useQuery<Dataset[]>({
    queryKey: ["/api/datasets"],
    refetchInterval: 2000,
  });

  // Upload dataset mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/datasets", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: `Dataset "${data.name}" uploaded successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
      setDatasetName("");
      setDatasetDescription("");
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload dataset. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Subscribe to WebSocket updates
  useState(() => {
    const unsubscribe = subscribe('dataset_uploaded', (data: Dataset) => {
      queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
    });

    return unsubscribe;
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', datasetName || file.name);
      formData.append('description', datasetDescription);

      // Add to upload progress
      setUploadProgress(prev => [...prev, {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }]);

      uploadMutation.mutate(formData);
    });
  }, [datasetName, datasetDescription, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/octet-stream': ['.parquet']
    },
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Database className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'processing':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Data Processing Center</CardTitle>
        <Button
          onClick={() => document.getElementById('file-input')?.click()}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Data</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dataset Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dataset-name">Dataset Name</Label>
            <Input
              id="dataset-name"
              placeholder="Enter dataset name"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataset-description">Description</Label>
            <Textarea
              id="dataset-description"
              placeholder="Enter dataset description"
              value={datasetDescription}
              onChange={(e) => setDatasetDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* File Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} id="file-input" />
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">
            {isDragActive ? 'Drop your data files here' : 'Drop your data files here'}
          </p>
          <p className="text-sm text-muted-foreground">
            Support: CSV, JSON, Parquet, Excel (Max: 100MB)
          </p>
        </div>

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Upload Progress</h4>
            {uploadProgress.map((upload, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">{upload.fileName}</div>
                    <div className="text-xs text-muted-foreground capitalize">{upload.status}...</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-muted-foreground/20 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getStatusColor(upload.status)}`}
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{upload.progress}%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setUploadProgress(prev => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Processing Queue */}
        <div className="space-y-3">
          <h4 className="font-medium">Recent Datasets</h4>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-muted-foreground/20 rounded" />
                    <div>
                      <div className="w-32 h-4 bg-muted-foreground/20 rounded mb-1" />
                      <div className="w-20 h-3 bg-muted-foreground/20 rounded" />
                    </div>
                  </div>
                  <div className="w-16 h-4 bg-muted-foreground/20 rounded" />
                </div>
              ))}
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No datasets uploaded yet</p>
              <p className="text-sm">Upload your first dataset to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {datasets.slice(0, 5).map((dataset) => (
                <div key={dataset.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(dataset.status)}
                    <div>
                      <div className="text-sm font-medium">{dataset.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(dataset.fileSize)} • {formatDate(dataset.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {dataset.status === 'processing' && (
                      <div className="w-20 bg-muted-foreground/20 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all animate-pulse"
                          style={{ width: `${dataset.processingProgress}%` }}
                        />
                      </div>
                    )}
                    <Badge variant={
                      dataset.status === 'completed' ? 'default' :
                      dataset.status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {dataset.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
