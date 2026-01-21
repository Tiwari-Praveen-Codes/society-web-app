import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserCheck, 
  AlertTriangle, 
  ClipboardList, 
  Users,
  Phone,
  LogOut,
  Building2,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSociety } from '@/hooks/useSociety';
import Noticeboard from '@/components/Noticeboard';
import { Complaints } from '@/components/Complaints';
import { ResidentDirectory } from '@/components/ResidentDirectory';
import { VisitorEntry } from '@/components/VisitorEntry';
import { EmergencyContacts } from '@/components/EmergencyContacts';
import { GateLog } from '@/components/GateLog';
import { NotificationBell } from '@/components/NotificationBell';

type ActiveView = 'dashboard' | 'noticeboard' | 'complaints' | 'residents' | 'visitors' | 'emergency' | 'gatelog';

export default function WatchmanDashboard() {
  const { signOut, user } = useAuth();
  const { societies, selectedSociety, loading, clearSociety } = useSociety();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  useEffect(() => {
    if (!loading && societies.length > 0 && !selectedSociety) {
      navigate('/select-society');
    }
  }, [loading, societies, selectedSociety, navigate]);

  const handleChangeSociety = () => {
    clearSociety();
    navigate('/select-society');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no societies and not loading, show message
  if (societies.length === 0) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Society Assignment</h2>
            <p className="text-muted-foreground text-center max-w-md">
              You're not assigned to any active society yet. Please contact your society secretary.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show noticeboard view
  if (activeView === 'noticeboard' && selectedSociety) {
    return (
      <Noticeboard 
        societyId={selectedSociety.id} 
        isSecretary={false}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  // Show complaints view
  if (activeView === 'complaints' && selectedSociety) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setActiveView('dashboard')} className="mb-4">
            ← Back to Dashboard
          </Button>
          <Complaints isSecretary={false} />
        </div>
      </div>
    );
  }

  // Show residents directory view
  if (activeView === 'residents' && selectedSociety) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setActiveView('dashboard')} className="mb-4">
            ← Back to Dashboard
          </Button>
          <ResidentDirectory societyId={selectedSociety.id} />
        </div>
      </div>
    );
  }

  // Show visitor entry view
  if (activeView === 'visitors' && selectedSociety) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setActiveView('dashboard')} className="mb-4">
            ← Back to Dashboard
          </Button>
          <VisitorEntry isWatchman={true} />
        </div>
      </div>
    );
  }

  // Show emergency contacts view
  if (activeView === 'emergency' && selectedSociety) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setActiveView('dashboard')} className="mb-4">
            ← Back to Dashboard
          </Button>
          <EmergencyContacts societyId={selectedSociety.id} isSecretary={false} />
        </div>
      </div>
    );
  }

  // Show gate log view
  if (activeView === 'gatelog' && selectedSociety) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setActiveView('dashboard')} className="mb-4">
            ← Back to Dashboard
          </Button>
          <GateLog isSecretary={false} />
        </div>
      </div>
    );
  }

  const features = [
    { title: 'Visitor Entry', icon: UserCheck, color: 'watchman', onClick: () => setActiveView('visitors') },
    { title: 'Gate Log', icon: ClipboardList, color: 'watchman', onClick: () => setActiveView('gatelog') },
    { title: 'Residents Directory', icon: Users, color: 'watchman', onClick: () => setActiveView('residents') },
    { title: 'Emergency Contacts', icon: Phone, color: 'watchman', onClick: () => setActiveView('emergency') },
    { title: 'Noticeboard', icon: AlertTriangle, color: 'watchman', onClick: () => setActiveView('noticeboard') },
    { title: 'Complaints', icon: MessageSquare, color: 'watchman', onClick: () => setActiveView('complaints') },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="text-watchman">Security</span> Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <NotificationBell />
            <Button
              variant="outline"
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </motion.div>

        {/* Society Selector */}
        {selectedSociety && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <button
              onClick={handleChangeSociety}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-watchman/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-watchman" />
              </div>
              <div className="text-left">
                <p className="font-medium">{selectedSociety.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedSociety.city}, {selectedSociety.state}
                </p>
              </div>
              {societies.length > 1 && (
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 group-hover:text-watchman transition-colors" />
              )}
            </button>
          </motion.div>
        )}

        {/* Role Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
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
              onClick={feature.onClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
