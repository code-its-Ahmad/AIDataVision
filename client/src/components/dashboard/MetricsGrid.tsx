import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardMetrics } from "@/types/dashboard";
import { 
  TrendingUp, 
  Database, 
  Bot, 
  Zap,
  ArrowUp,
  ArrowDown,
  Clock
} from "lucide-react";

interface MetricsGridProps {
  metrics: DashboardMetrics;
  isLoading: boolean;
}

export function MetricsGrid({ metrics, isLoading }: MetricsGridProps) {
  const metricCards = [
    {
      title: "Prediction Accuracy",
      value: `${metrics.accuracy.toFixed(1)}%`,
      change: "+2.3%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-blue-500",
      progress: metrics.accuracy,
    },
    {
      title: "Data Points",
      value: `${(metrics.dataPoints / 1000000).toFixed(1)}M`,
      change: "+15.2K",
      trend: "up",
      icon: Database,
      color: "bg-green-500",
      progress: 78,
    },
    {
      title: "Active Models",
      value: metrics.activeModels.toString(),
      change: "2 training",
      trend: "neutral",
      icon: Bot,
      color: "bg-orange-500",
      progress: 85,
    },
    {
      title: "Processing Speed",
      value: `${(metrics.processingSpeed / 1000).toFixed(1)}K/s`,
      change: "+8.7%",
      trend: "up",
      icon: Zap,
      color: "bg-red-500",
      progress: 92,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="metric-card animate-pulse">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metricCards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.trend === "up";
        const isNeutral = card.trend === "neutral";
        
        return (
          <Card 
            key={index} 
            className="metric-card hover:shadow-xl transition-all duration-500 hover:scale-105 group animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color} animate-glow group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {card.title}
                  </div>
                  <div className="text-2xl font-bold metric-counter group-hover:text-primary transition-colors duration-300">
                    {card.value}
                  </div>
                  <div className="text-xs flex items-center justify-end">
                    {isNeutral ? (
                      <div className="flex items-center text-muted-foreground animate-pulse-slow">
                        <Clock className="h-3 w-3 mr-1" />
                        {card.change}
                      </div>
                    ) : (
                      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'} animate-bounce-slow`}>
                        {isPositive ? (
                          <ArrowUp className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDown className="h-3 w-3 mr-1" />
                        )}
                        {card.change}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Progress 
                value={card.progress} 
                className="h-2 group-hover:h-3 transition-all duration-300" 
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
