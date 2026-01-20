import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  FileText,
  Settings,
  BarChart3,
  Calendar,
  Bell,
  LogOut,
  MessageSquare
} from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import RegisterSociety from './RegisterSociety';
import PendingApproval from './PendingApproval';
import Noticeboard from '@/components/Noticeboard';
import { Complaints } from '@/components/Complaints';
import { SocietyProvider } from '@/hooks/useSociety';

interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
}

import { Bills } from '@/components/Bills';
import { Facilities } from '@/components/Facilities';

type ActiveView = 'dashboard' | 'noticeboard' | 'complaints' | 'bills' | 'facilities';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // No society registered yet - show registration form
  if (!society) {
    return <RegisterSociety onRegistered={fetchSociety} />;
  }

  // Society pending verification - show waiting screen
  if (society.status === 'pending_verification') {
    return <PendingApproval society={society} />;
  }

  // Show noticeboard view
  if (activeView === 'noticeboard') {
    return (
      <Noticeboard 
        societyId={society.id} 
        isSecretary={true}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  // Show complaints view
  if (activeView === 'complaints') {
    return (
      <SocietyProvider initialSociety={society}>
        <div className="min-h-screen p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setActiveView('dashboard')} className="mb-4">
              ← Back to Dashboard
            </Button>
            <Complaints isSecretary={true} />
          </div>
        </div>
      </SocietyProvider>
    );
  }

  // Show bills view
  if (activeView === 'bills') {
    return (
      <SocietyProvider initialSociety={society}>
        <div className="min-h-screen p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setActiveView('dashboard')} className="mb-4">
              ← Back to Dashboard
            </Button>
            <Bills isSecretary={true} societyId={society.id} />
          </div>
        </div>
      </SocietyProvider>
    );
  }

  // Show facilities view
  if (activeView === 'facilities') {
    return (
      <SocietyProvider initialSociety={society}>
        <div className="min-h-screen p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setActiveView('dashboard')} className="mb-4">
              ← Back to Dashboard
            </Button>
            <Facilities isSecretary={true} societyId={society.id} />
          </div>
        </div>
      </SocietyProvider>
    );
  }

  const features = [
    { title: 'Overview', icon: LayoutDashboard, color: 'secretary', onClick: undefined },
    { title: 'Manage Residents', icon: Users, color: 'secretary', onClick: undefined },
    { title: 'Billing & Invoices', icon: Receipt, color: 'secretary', onClick: () => setActiveView('bills') },
    { title: 'Facilities', icon: Calendar, color: 'secretary', onClick: () => setActiveView('facilities') },
    { title: 'Financial Reports', icon: BarChart3, color: 'secretary', onClick: undefined },
    { title: 'Documents', icon: FileText, color: 'secretary', onClick: undefined },
    { title: 'Noticeboard', icon: Bell, color: 'secretary', onClick: () => setActiveView('noticeboard') },
    { title: 'Complaints', icon: MessageSquare, color: 'secretary', onClick: () => setActiveView('complaints') },
    { title: 'Settings', icon: Settings, color: 'secretary', onClick: undefined },
  ];

  // Society approved - show dashboard
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
              <span className="text-secretary">{society.name}</span>
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secretary/10 border border-secretary/30 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-secretary animate-pulse" />
          <span className="text-sm font-medium text-secretary">Secretary</span>
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
              onClick={feature.onClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
