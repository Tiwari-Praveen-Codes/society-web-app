import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  FileText,
  Settings,
  Calendar,
  Bell,
  MessageSquare,
  Phone,
  ClipboardList,
  ArrowLeft,
  Building2
} from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import RegisterSociety from './RegisterSociety';
import PendingApproval from './PendingApproval';
import Noticeboard from '@/components/Noticeboard';
import { Complaints } from '@/components/Complaints';
import { SocietyProvider } from '@/hooks/useSociety';
import { Bills } from '@/components/Bills';
import { Facilities } from '@/components/Facilities';
import { EmergencyContacts } from '@/components/EmergencyContacts';
import { Documents } from '@/components/Documents';
import { GateLog } from '@/components/GateLog';

interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
}

type ActiveView = 'dashboard' | 'noticeboard' | 'complaints' | 'bills' | 'facilities' | 'emergency' | 'documents' | 'gatelog';

export default function SecretaryDashboard() {
  const { signOut, user } = useAuth();
  const [society, setSociety] = useState<Society | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  const fetchSociety = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('societies')
      .select('id, name, address, city, state, pincode, status')
      .eq('secretary_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setSociety(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSociety();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secretary/30 border-t-secretary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!society) {
    return <RegisterSociety onRegistered={fetchSociety} />;
  }

  if (society.status === 'pending_verification') {
    return <PendingApproval society={society} />;
  }

  // View wrapper for sub-pages
  const ViewWrapper = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <SocietyProvider initialSociety={society}>
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
    </SocietyProvider>
  );

  if (activeView === 'noticeboard') {
    return (
      <Noticeboard 
        societyId={society.id} 
        isSecretary={true}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  if (activeView === 'complaints') {
    return (
      <ViewWrapper title="Complaints Management">
        <Complaints isSecretary={true} />
      </ViewWrapper>
    );
  }

  if (activeView === 'bills') {
    return (
      <ViewWrapper title="Billing & Invoices">
        <Bills isSecretary={true} societyId={society.id} />
      </ViewWrapper>
    );
  }

  if (activeView === 'facilities') {
    return (
      <ViewWrapper title="Facility Management">
        <Facilities isSecretary={true} societyId={society.id} />
      </ViewWrapper>
    );
  }

  if (activeView === 'emergency') {
    return (
      <ViewWrapper title="Emergency Contacts">
        <EmergencyContacts societyId={society.id} isSecretary={true} />
      </ViewWrapper>
    );
  }

  if (activeView === 'documents') {
    return (
      <ViewWrapper title="Document Management">
        <Documents societyId={society.id} isSecretary={true} />
      </ViewWrapper>
    );
  }

  if (activeView === 'gatelog') {
    return (
      <ViewWrapper title="Gate Log">
        <GateLog isSecretary={true} />
      </ViewWrapper>
    );
  }

  // Secretary-specific features (management-focused)
  const features = [
    { 
      title: 'Overview', 
      description: 'Society dashboard',
      icon: LayoutDashboard, 
      onClick: undefined,
      disabled: true 
    },
    { 
      title: 'Residents', 
      description: 'Manage members',
      icon: Users, 
      onClick: undefined,
      disabled: true 
    },
    { 
      title: 'Billing', 
      description: 'Create & track bills',
      icon: Receipt, 
      onClick: () => setActiveView('bills') 
    },
    { 
      title: 'Facilities', 
      description: 'Manage amenities',
      icon: Calendar, 
      onClick: () => setActiveView('facilities') 
    },
    { 
      title: 'Gate Log', 
      description: 'View visitor records',
      icon: ClipboardList, 
      onClick: () => setActiveView('gatelog') 
    },
    { 
      title: 'Documents', 
      description: 'Upload & manage docs',
      icon: FileText, 
      onClick: () => setActiveView('documents') 
    },
    { 
      title: 'Noticeboard', 
      description: 'Post announcements',
      icon: Bell, 
      onClick: () => setActiveView('noticeboard') 
    },
    { 
      title: 'Complaints', 
      description: 'Resolve issues',
      icon: MessageSquare, 
      onClick: () => setActiveView('complaints') 
    },
    { 
      title: 'Emergency', 
      description: 'Manage contacts',
      icon: Phone, 
      onClick: () => setActiveView('emergency') 
    },
    { 
      title: 'Settings', 
      description: 'Society settings',
      icon: Settings, 
      onClick: undefined,
      disabled: true 
    },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <DashboardHeader
          title={society.name}
          subtitle={user?.email}
          role="secretary"
          onSignOut={signOut}
        />

        {/* Society Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-secretary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-secretary" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm text-muted-foreground truncate">
                {society.address}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {society.city}, {society.state} - {society.pincode}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4 text-foreground">Management Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <DashboardCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                color="secretary"
                index={index}
                onClick={feature.onClick}
                disabled={feature.disabled}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
