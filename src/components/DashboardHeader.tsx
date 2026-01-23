import { motion } from 'framer-motion';
import { LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  role: 'resident' | 'watchman' | 'secretary' | 'admin';
  onSignOut: () => void;
  showNotifications?: boolean;
}

const roleConfig = {
  resident: {
    label: 'Resident',
    color: 'bg-primary/10 border-primary/30 text-primary',
    dotColor: 'bg-primary',
  },
  watchman: {
    label: 'Security',
    color: 'bg-warning/10 border-warning/30 text-warning',
    dotColor: 'bg-warning',
  },
  secretary: {
    label: 'Secretary',
    color: 'bg-secretary/10 border-secretary/30 text-secretary',
    dotColor: 'bg-secretary',
  },
  admin: {
    label: 'Admin',
    color: 'bg-primary/10 border-primary/30 text-primary',
    dotColor: 'bg-primary',
  },
};

export function DashboardHeader({ 
  title, 
  subtitle, 
  role, 
  onSignOut,
  showNotifications = true 
}: DashboardHeaderProps) {
  const config = roleConfig[role];
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-3xl font-bold text-foreground">
            {title}
          </h1>
          <Badge 
            variant="outline" 
            className={cn(
              "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium",
              config.color
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.dotColor)} />
            {config.label}
          </Badge>
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/* Mobile role badge */}
        <Badge 
          variant="outline" 
          className={cn(
            "sm:hidden inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium",
            config.color
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.dotColor)} />
          {config.label}
        </Badge>
        
        {showNotifications && <NotificationBell />}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/profile')}
          className="text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] touch-manipulation"
          title="Profile Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
        
        {/* Hide sign out on mobile - it's in the More menu */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSignOut}
          className="gap-2 hidden md:flex min-h-[44px] touch-manipulation"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </motion.header>
  );
}
