import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  color?: 'primary' | 'resident' | 'watchman' | 'secretary' | 'warning';
  onClick?: () => void;
  index?: number;
  disabled?: boolean;
}

const colorVariants = {
  primary: {
    bg: 'bg-primary/10',
    border: 'hover:border-primary/50',
    icon: 'text-primary',
    glow: 'group-hover:shadow-[0_0_20px_hsl(173_80%_40%/0.2)]',
  },
  resident: {
    bg: 'bg-primary/10',
    border: 'hover:border-primary/50',
    icon: 'text-primary',
    glow: 'group-hover:shadow-[0_0_20px_hsl(173_80%_40%/0.2)]',
  },
  watchman: {
    bg: 'bg-warning/10',
    border: 'hover:border-warning/50',
    icon: 'text-warning',
    glow: 'group-hover:shadow-[0_0_20px_hsl(45_93%_47%/0.2)]',
  },
  secretary: {
    bg: 'bg-secretary/10',
    border: 'hover:border-secretary/50',
    icon: 'text-secretary',
    glow: 'group-hover:shadow-[0_0_20px_hsl(280_65%_60%/0.2)]',
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'hover:border-warning/50',
    icon: 'text-warning',
    glow: 'group-hover:shadow-[0_0_20px_hsl(45_93%_47%/0.2)]',
  },
};

export function DashboardCard({ 
  title, 
  description,
  icon: Icon, 
  color = 'primary', 
  onClick, 
  index = 0,
  disabled = false 
}: DashboardCardProps) {
  const variant = colorVariants[color] || colorVariants.primary;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base styles with improved touch targets
        "group relative p-5 rounded-xl bg-card border border-border transition-all duration-300 text-left w-full",
        // Minimum touch target size (48x48px recommended by WCAG)
        "min-h-[72px]",
        // Touch optimization
        "touch-manipulation active:scale-[0.98]",
        variant.border,
        variant.glow,
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "hover:translate-y-[-2px]"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          // Larger icon container for better touch
          "w-12 h-12 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300",
          variant.bg,
          !disabled && "group-hover:scale-110 group-active:scale-95"
        )}>
          <Icon className={cn("w-6 h-6", variant.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate text-base">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
