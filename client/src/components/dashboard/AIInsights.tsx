import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { apiRequest } from "@/lib/queryClient";
import { AIInsight } from "@/types/dashboard";
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Send,
  Clock,
  Zap
} from "lucide-react";

interface AIInsightsProps {
  insights: AIInsight[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export function AIInsights({ insights: propInsights }: AIInsightsProps) {
  const [chatQuery, setChatQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket('/ws');

  // Fetch insights from API
  const { data: apiInsights = [] } = useQuery<AIInsight[]>({
    queryKey: ["/api/insights"],
    refetchInterval: 30000,
  });

  // Combine prop insights with API insights
  const allInsights = [...propInsights, ...apiInsights].reduce((acc, insight) => {
    const existing = acc.find(item => item.id === insight.id);
    if (!existing) {
      acc.push(insight);
    }
    return acc;
  }, [] as AIInsight[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // AI Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/chat", { query });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        type: 'ai',
        content: data.response,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    },
    onError: () => {
      toast({
        title: "AI Chat Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  // Resolve insight mutation
  const resolveInsightMutation = useMutation({
    mutationFn: async (insightId: number) => {
      return apiRequest("POST", `/api/insights/${insightId}/resolve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      toast({
        title: "Insight Resolved",
        description: "The insight has been marked as resolved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resolve insight.",
        variant: "destructive",
      });
    },
  });

  // Subscribe to WebSocket updates
  useEffect(() => {
    const unsubscribe = subscribe('insight_created', (data: AIInsight) => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
    });

    return unsubscribe;
  }, [subscribe, queryClient]);

  const handleChatSubmit = () => {
    if (!chatQuery.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: chatQuery,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    chatMutation.mutate(chatQuery);
    setChatQuery("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern':
        return <Lightbulb className="h-4 w-4" />;
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4" />;
      case 'training_complete':
        return <CheckCircle className="h-4 w-4" />;
      case 'recommendation':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-border';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'secondary' as const;
      case 'low':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI-Powered Insights</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Gemini AI</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Insight Cards */}
        <ScrollArea className="h-80">
          <div className="space-y-4 pr-4">
            {allInsights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No insights available yet</p>
                <p className="text-sm">AI insights will appear here as your models generate data</p>
              </div>
            ) : (
              allInsights.map((insight) => (
                <div 
                  key={insight.id} 
                  className={`bg-muted rounded-lg p-4 border-l-4 ${getPriorityColor(insight.priority)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 ${
                      insight.type === 'pattern' ? 'text-primary' :
                      insight.type === 'anomaly' ? 'text-red-500' :
                      insight.type === 'training_complete' ? 'text-green-500' :
                      'text-blue-500'
                    }`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant={getPriorityBadgeVariant(insight.priority)}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(insight.confidence * 100)}% confidence
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(insight.createdAt)}
                          </span>
                        </div>
                        {insight.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveInsightMutation.mutate(insight.id)}
                            disabled={resolveInsightMutation.isPending}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Chat Messages */}
        {chatMessages.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">AI Chat History</h4>
            <ScrollArea className="h-32 bg-muted rounded-lg p-3">
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-2 text-sm ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background border'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {message.type === 'ai' && <Brain className="h-3 w-3" />}
                        <span className="text-xs opacity-70">
                          {message.type === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                      </div>
                      <p>{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-background border rounded-lg p-2 text-sm max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-3 w-3" />
                        <span className="text-xs opacity-70">AI Assistant</span>
                      </div>
                      <div className="flex space-x-1 mt-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* AI Chat Interface */}
        <div className="pt-6 border-t border-border">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Ask AI about your data..."
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleChatSubmit}
              disabled={!chatQuery.trim() || chatMutation.isPending}
              size="icon"
            >
              {chatMutation.isPending ? (
                <Zap className="h-4 w-4 animate-pulse" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
