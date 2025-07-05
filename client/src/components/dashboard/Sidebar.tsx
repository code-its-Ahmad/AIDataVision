import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  ChartLine, 
  Database, 
  BarChart3, 
  Settings, 
  FileText, 
  Bot, 
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const navigationItems = [
  { path: "/", icon: ChartLine, label: "Dashboard", badge: null },
  { path: "/models", icon: Bot, label: "ML Models", badge: "12" },
  { path: "/data", icon: Database, label: "Data Sources", badge: null },
  { path: "/analytics", icon: BarChart3, label: "Analytics", badge: null },
  { path: "/training", icon: Settings, label: "Model Training", badge: "2" },
  { path: "/reports", icon: FileText, label: "Reports", badge: null },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-background border animate-float"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <div className="space-y-1">
          <div className="w-4 h-0.5 bg-foreground transition-all duration-300" />
          <div className="w-4 h-0.5 bg-foreground transition-all duration-300" />
          <div className="w-4 h-0.5 bg-foreground transition-all duration-300" />
        </div>
      </Button>

      <aside className={cn(
        "bg-card border-r border-border flex flex-col transition-all duration-500 ease-in-out relative z-50",
        "lg:translate-x-0",
        isCollapsed ? "w-16" : "w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "fixed lg:relative h-screen shadow-xl lg:shadow-none"
      )}>
        {/* Logo Section */}
        <div className="p-4 lg:p-6 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3 animate-fade-in">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center animate-glow">
                  <Brain className="text-primary-foreground text-xl animate-pulse-slow" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    ML Analytics
                  </h1>
                  <p className="text-xs text-muted-foreground">Advanced Platform</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 hover:bg-primary/10 transition-all duration-300 hidden lg:flex"
            >
              {isCollapsed ? 
                <ChevronRight className="h-4 w-4 animate-bounce-slow" /> : 
                <ChevronLeft className="h-4 w-4 animate-bounce-slow" />
              }
            </Button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div 
                  className={cn(
                    "sidebar-nav-item w-full justify-start cursor-pointer group transition-all duration-300 hover:scale-105",
                    isActive && "active animate-glow"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="h-5 w-5 min-w-[20px] transition-transform duration-300 group-hover:scale-110" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 transition-all duration-300">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto animate-pulse-slow">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
        
        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-glow">
              <User className="text-white text-sm" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 animate-fade-in">
                <p className="text-sm font-medium">Dr. Sarah Chen</p>
                <p className="text-xs text-muted-foreground">Data Scientist</p>
              </div>
            )}
            {!isCollapsed && (
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 transition-all duration-300">
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}