import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  color?: string;
  onClick?: () => void;
  index?: number;
}

export function DashboardCard({ title, icon: Icon, color = 'primary', onClick, index = 0 }: DashboardCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 card-hover text-left w-full"
    >
      <div className={`w-14 h-14 rounded-xl bg-${color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-7 h-7 text-${color}`} />
      </div>
      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
    </motion.button>
  );
}
