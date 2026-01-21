import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserCheck, 
  ClipboardList, 
  Users,
  Phone,
  Building2,
  Bell,
  ArrowLeft
} from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SocietySelector } from '@/components/SocietySelector';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSociety } from '@/hooks/useSociety';
import Noticeboard from '@/components/Noticeboard';
import { ResidentDirectory } from '@/components/ResidentDirectory';
import { VisitorEntry } from '@/components/VisitorEntry';
import { EmergencyContacts } from '@/components/EmergencyContacts';
import { GateLog } from '@/components/GateLog';

type ActiveView = 'dashboard' | 'noticeboard' | 'residents' | 'visitors' | 'emergency' | 'gatelog';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-warning/30 border-t-warning rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (societies.length === 0) {
    return (
      <div className="min-h-screen p-6 md:p-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <DashboardHeader
            title="Security Dashboard"
            subtitle={user?.email}
            role="watchman"
            onSignOut={signOut}
            showNotifications={false}
          />
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
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

  // View wrapper for sub-pages
  const ViewWrapper = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div className="min-h-screen p-6 md:p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => setActiveView('dashboard')} 
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );

  if (activeView === 'noticeboard' && selectedSociety) {
    return (
      <Noticeboard 
        societyId={selectedSociety.id} 
        isSecretary={false}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  if (activeView === 'residents' && selectedSociety) {
    return (
      <ViewWrapper title="Resident Directory">
        <ResidentDirectory societyId={selectedSociety.id} />
      </ViewWrapper>
    );
  }

  if (activeView === 'visitors' && selectedSociety) {
    return (
      <ViewWrapper title="Visitor Entry">
        <VisitorEntry isWatchman={true} />
      </ViewWrapper>
    );
  }

  if (activeView === 'emergency' && selectedSociety) {
    return (
      <ViewWrapper title="Emergency Contacts">
        <EmergencyContacts societyId={selectedSociety.id} isSecretary={false} />
      </ViewWrapper>
    );
  }

  if (activeView === 'gatelog' && selectedSociety) {
    return (
      <ViewWrapper title="Gate Log">
        <GateLog isSecretary={false} />
      </ViewWrapper>
    );
  }

  // Watchman-specific features (security-focused)
  const features = [
    { 
      title: 'Visitor Entry', 
      description: 'Log visitor check-ins',
      icon: UserCheck, 
      onClick: () => setActiveView('visitors') 
    },
    { 
      title: 'Gate Log', 
      description: 'View entry/exit records',
      icon: ClipboardList, 
      onClick: () => setActiveView('gatelog') 
    },
    { 
      title: 'Residents', 
      description: 'View resident directory',
      icon: Users, 
      onClick: () => setActiveView('residents') 
    },
    { 
      title: 'Emergency', 
      description: 'Emergency contacts',
      icon: Phone, 
      onClick: () => setActiveView('emergency') 
    },
    { 
      title: 'Noticeboard', 
      description: 'View announcements',
      icon: Bell, 
      onClick: () => setActiveView('noticeboard') 
    },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <DashboardHeader
          title="Security Dashboard"
          subtitle={user?.email}
          role="watchman"
          onSignOut={signOut}
        />

        {selectedSociety && (
          <SocietySelector
            society={selectedSociety}
            canChange={societies.length > 1}
            onChangeSociety={handleChangeSociety}
            color="watchman"
          />
        )}

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <DashboardCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                color="watchman"
                index={index}
                onClick={feature.onClick}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
