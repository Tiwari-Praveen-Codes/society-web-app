import { motion } from 'framer-motion';
import { 
  UserCheck, 
  AlertTriangle, 
  ClipboardList, 
  Users,
  Phone,
  Shield,
  LogOut
} from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const features = [
  { title: 'Visitor Entry', icon: UserCheck, color: 'watchman' },
  { title: 'Security Alerts', icon: AlertTriangle, color: 'watchman' },
  { title: 'Gate Log', icon: ClipboardList, color: 'watchman' },
  { title: 'Residents Directory', icon: Users, color: 'watchman' },
  { title: 'Emergency Contacts', icon: Phone, color: 'watchman' },
  { title: 'Duty Schedule', icon: Shield, color: 'watchman' },
];

export default function WatchmanDashboard() {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="text-watchman">Security</span> Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.email}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={signOut}
            className="flex items-center gap-2 self-start"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </motion.div>

        {/* Role Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watchman/10 border border-watchman/30 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-watchman animate-pulse" />
          <span className="text-sm font-medium text-watchman">Watchman</span>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <DashboardCard
              key={feature.title}
              title={feature.title}
              icon={feature.icon}
              color={feature.color}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
