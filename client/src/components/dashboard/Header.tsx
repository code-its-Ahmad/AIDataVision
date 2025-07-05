import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  Download, 
  Wifi, 
  WifiOff 
} from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderProps {
  isConnected: boolean;
  onTimeRangeChange: (range: string) => void;
  selectedTimeRange: string;
}

export function Header({ isConnected, onTimeRangeChange, selectedTimeRange }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      toast({
        title: "Export Started",
        description: "Preparing your data export...",
      });
      
      // Simulate export process
      setTimeout(() => {
        toast({
          title: "Export Complete",
          description: "Your data has been exported successfully.",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-4 animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent animate-fade-in">
            ML Analytics Dashboard
          </h2>
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500 animate-glow" />
                  <span className="real-time-indicator font-medium text-green-600">Live Data</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500 animate-pulse" />
                  <span className="font-medium text-red-600">Offline</span>
                </>
              )}
            </div>
            <span className="hidden sm:block animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Updated 2 seconds ago
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-md animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Input
              type="text"
              placeholder="Search models, data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300" />
          </div>
          
          {/* Time Range Selector */}
          <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <select 
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm transition-all duration-300 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 min-w-0 flex-shrink-0"
              value={selectedTimeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
            >
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7d</option>
              <option value="30d">Last 30d</option>
            </select>
          </div>
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 hover:bg-primary/10 transition-all duration-300 hover:scale-110 flex-shrink-0 animate-fade-in"
            style={{ animationDelay: '0.6s' }}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
            ) : (
              <Moon className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
            )}
          </Button>
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative hover:bg-primary/10 transition-all duration-300 hover:scale-110 flex-shrink-0 animate-fade-in"
            style={{ animationDelay: '0.7s' }}
          >
            <Bell className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 animate-pulse"
            >
              3
            </Badge>
          </Button>
          
          {/* Export */}
          <Button
            onClick={handleExport}
            className="flex items-center space-x-2 transition-all duration-300 hover:scale-105 hover:shadow-md animate-fade-in"
            style={{ animationDelay: '0.8s' }}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:block">Export</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
