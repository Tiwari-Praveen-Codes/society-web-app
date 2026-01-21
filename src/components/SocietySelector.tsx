import { motion } from 'framer-motion';
import { Building2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Society {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface SocietySelectorProps {
  society: Society;
  canChange?: boolean;
  onChangeSociety?: () => void;
  color?: 'primary' | 'watchman' | 'secretary';
}

const colorVariants = {
  primary: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    hoverBorder: 'hover:border-primary/50',
  },
  watchman: {
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    hoverBorder: 'hover:border-warning/50',
  },
  secretary: {
    iconBg: 'bg-secretary/10',
    iconColor: 'text-secretary',
    hoverBorder: 'hover:border-secretary/50',
  },
};

export function SocietySelector({ 
  society, 
  canChange = true, 
  onChangeSociety,
  color = 'primary'
}: SocietySelectorProps) {
  const variant = colorVariants[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-6"
    >
      <button
        onClick={canChange ? onChangeSociety : undefined}
        disabled={!canChange}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border transition-colors group w-full sm:w-auto",
          canChange && variant.hoverBorder,
          !canChange && "cursor-default"
        )}
      >
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          variant.iconBg
        )}>
          <Building2 className={cn("w-5 h-5", variant.iconColor)} />
        </div>
        <div className="text-left min-w-0">
          <p className="font-medium text-foreground truncate">{society.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {society.city}, {society.state}
          </p>
        </div>
        {canChange && (
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground ml-auto shrink-0 transition-colors",
            `group-hover:${variant.iconColor}`
          )} />
        )}
      </button>
    </motion.div>
  );
}
