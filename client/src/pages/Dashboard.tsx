import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { DistributionChart } from "@/components/charts/DistributionChart";
import { HeatmapChart } from "@/components/charts/HeatmapChart";
import { ModelTraining } from "@/components/dashboard/ModelTraining";
import { DataProcessing } from "@/components/dashboard/DataProcessing";
import { AIInsights } from "@/components/dashboard/AIInsights";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const { 
    metrics, 
    performanceData, 
    insights, 
    isLoading: realtimeLoading, 
    isConnected 
  } = useRealTimeData();

  const { data: dashboardData, isLoading: dashboardLoading, error } = useQuery({
    queryKey: ["/api/dashboard"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const isLoading = realtimeLoading || dashboardLoading;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please check your connection and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <div className="animate-slide-in-left">
        <Sidebar />
      </div>
      
      <main className="flex-1 flex flex-col animate-slide-in-right">
        <Header 
          isConnected={isConnected}
          onTimeRangeChange={setSelectedTimeRange}
          selectedTimeRange={selectedTimeRange}
        />
        
        <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-6 lg:ml-0">
          {/* Connection Status */}
          {!isConnected && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Real-time connection lost. Showing cached data.
              </AlertDescription>
            </Alert>
          )}

          {/* Key Metrics */}
          <div className="animate-fade-in">
            <MetricsGrid metrics={metrics} isLoading={isLoading} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            <Card className="animate-slide-up hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-lg md:text-xl">Real-time Performance</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-glow" />
                  <Badge variant="outline" className="animate-pulse-slow">Live</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-64 md:h-80 w-full" />
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <PerformanceChart data={performanceData} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="animate-slide-up hover:shadow-xl transition-all duration-300 group" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-lg md:text-xl">Prediction Distribution</CardTitle>
                <select 
                  className="bg-background border border-border rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-64 md:h-80 w-full" />
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <DistributionChart timeRange={selectedTimeRange} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ML Training and Processing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ModelTraining />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Training Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Validation Loss</span>
                        <Badge variant="secondary">Decreasing</Badge>
                      </div>
                      <div className="text-2xl font-bold">0.0234</div>
                      <div className="text-xs text-green-600">-12.3% from last epoch</div>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">F1 Score</span>
                        <Badge variant="secondary">Improving</Badge>
                      </div>
                      <div className="text-2xl font-bold">0.968</div>
                      <div className="text-xs text-green-600">+0.023 from last epoch</div>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">GPU Usage</span>
                        <Badge variant="destructive">High</Badge>
                      </div>
                      <div className="text-2xl font-bold">87%</div>
                      <div className="w-full bg-muted-foreground/20 rounded-full h-2 mt-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "87%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Data Processing and AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataProcessing />
            <AIInsights insights={insights} />
          </div>

          {/* Advanced Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Feature Correlation</CardTitle>
                <button className="text-muted-foreground hover:text-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <HeatmapChart />
                )}
              </CardContent>
            </Card>

            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Predictive Trends</CardTitle>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm text-muted-foreground">7 days</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Revenue Forecast</span>
                      <Badge className="bg-green-500">+12.5%</Badge>
                    </div>
                    <div className="text-xl font-bold">$2.4M</div>
                    <div className="text-xs text-muted-foreground">Expected by end of month</div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Churn Risk</span>
                      <Badge variant="destructive">Medium</Badge>
                    </div>
                    <div className="text-xl font-bold">8.3%</div>
                    <div className="text-xs text-muted-foreground">234 customers at risk</div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Demand Spike</span>
                      <Badge className="bg-blue-500">High</Badge>
                    </div>
                    <div className="text-xl font-bold">+47%</div>
                    <div className="text-xs text-muted-foreground">Next 3 days</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Model Comparison</CardTitle>
                <button className="text-muted-foreground hover:text-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Random Forest</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Accuracy</span>
                      <span className="text-sm font-medium">94.7%</span>
                    </div>
                    <div className="w-full bg-muted-foreground/20 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "94.7%" }} />
                    </div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Neural Network</span>
                      <Badge variant="destructive">Training</Badge>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Accuracy</span>
                      <span className="text-sm font-medium">92.1%</span>
                    </div>
                    <div className="w-full bg-muted-foreground/20 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "92.1%" }} />
                    </div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">XGBoost</span>
                      <Badge variant="outline">Standby</Badge>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Accuracy</span>
                      <span className="text-sm font-medium">91.3%</span>
                    </div>
                    <div className="w-full bg-muted-foreground/20 rounded-full h-2">
                      <div className="bg-gray-500 h-2 rounded-full" style={{ width: "91.3%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
