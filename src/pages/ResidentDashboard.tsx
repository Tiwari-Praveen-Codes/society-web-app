import { motion } from 'framer-motion';
import { 
  Users, 
  Bell, 
  CreditCard, 
  MessageSquare, 
  Phone, 
  Building, 
  FileText, 
  User,
  Bot,
  LogOut
} from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const features = [
  { title: 'Residents', icon: Users, color: 'primary' },
  { title: 'Noticeboard', icon: Bell, color: 'primary' },
  { title: 'Bill', icon: CreditCard, color: 'primary' },
  { title: 'Complaints', icon: MessageSquare, color: 'primary' },
  { title: 'Emergency Contact', icon: Phone, color: 'primary' },
  { title: 'Facilities', icon: Building, color: 'primary' },
  { title: 'Documents', icon: FileText, color: 'primary' },
  { title: 'Profile', icon: User, color: 'primary' },
  { title: 'AI Chatbox', icon: Bot, color: 'primary' },
];

export default function ResidentDashboard() {
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
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              Welcome to Society App
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-resident/10 border border-resident/30 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-resident animate-pulse" />
          <span className="text-sm font-medium text-resident">Resident</span>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
