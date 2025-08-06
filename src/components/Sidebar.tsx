"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Brain, 
  Users, 
  BarChart3, 
  Settings, 
  Network, 
  Shield, 
  Database,
  Zap,
  FileText,
  MessageSquare,
  Activity,
  ChevronLeft,
  ChevronRight,
  Home,
  Plus
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    current: true,
  },
  {
    name: "AI Employees",
    href: "/employees",
    icon: Brain,
    current: false,
    badge: "12",
  },
  {
    name: "Create Employee",
    href: "/create",
    icon: Plus,
    current: false,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    current: false,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: FileText,
    current: false,
    badge: "5",
  },
  {
    name: "Conversations",
    href: "/conversations",
    icon: MessageSquare,
    current: false,
  },
  {
    name: "Multi-LLM Config",
    href: "/multi-llm",
    icon: Network,
    current: false,
    badge: "Beta",
  },
];

const secondaryNavigation = [
  {
    name: "Activity Log",
    href: "/activity",
    icon: Activity,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    name: "Security",
    href: "/security",
    icon: Shield,
  },
  {
    name: "Database",
    href: "/database",
    icon: Database,
  },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-40 flex flex-col bg-background border-r transition-all duration-300",
      isOpen ? "translate-x-0" : "-translate-x-full",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg animate-pulse"></div>
              <div className="absolute inset-0.5 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Cognisia</h2>
              <p className="text-xs text-muted-foreground">Enterprise</p>
            </div>
          </div>
        )}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="md:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/avatars/user.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">Enterprise Plan</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted rounded-lg p-2">
              <p className="text-lg font-semibold">12</p>
              <p className="text-xs text-muted-foreground">Agents</p>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <p className="text-lg font-semibold">98%</p>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <p className="text-lg font-semibold">4.9</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.name}
                variant={item.current ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "px-2",
                  item.current && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </div>

        {!isCollapsed && (
          <>
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                System
              </p>
            </div>
            <div className="space-y-1">
              {secondaryNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <span className="flex-1 text-left">{item.name}</span>
                  </Button>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Multi-LLM Ready</p>
                <p className="text-xs text-muted-foreground">
                  Enable advanced AI collaboration
                </p>
              </div>
            </div>
            <Button size="sm" className="w-full mt-2" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}