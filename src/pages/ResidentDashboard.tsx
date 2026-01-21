import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bell, 
  CreditCard, 
  MessageSquare, 
  Building, 
  Building2,
  Users,
  Phone,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SocietySelector } from '@/components/SocietySelector';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSociety } from '@/hooks/useSociety';
import Noticeboard from '@/components/Noticeboard';
import { Complaints } from '@/components/Complaints';
import { Bills } from '@/components/Bills';
import { Facilities } from '@/components/Facilities';
import { AvailabilityStatus } from '@/components/AvailabilityStatus';
import { VisitorEntry } from '@/components/VisitorEntry';
import { EmergencyContacts } from '@/components/EmergencyContacts';
import { Documents } from '@/components/Documents';

type ActiveView = 'dashboard' | 'noticeboard' | 'complaints' | 'bills' | 'facilities' | 'visitors' | 'emergency' | 'documents';

export default function ResidentDashboard() {
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
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
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
            title="Welcome!"
            subtitle={user?.email}
            role="resident"
            onSignOut={signOut}
            showNotifications={false}
          />
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Society Membership</h2>
            <p className="text-muted-foreground text-center max-w-md">
              You're not a member of any active society yet. Please contact your society secretary to be added.
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

  if (activeView === 'complaints' && selectedSociety) {
    return (
      <ViewWrapper title="Complaints">
        <Complaints isSecretary={false} />
      </ViewWrapper>
    );
  }

  if (activeView === 'bills' && selectedSociety) {
    return (
      <ViewWrapper title="Bills & Payments">
        <Bills isSecretary={false} />
      </ViewWrapper>
    );
  }

  if (activeView === 'facilities' && selectedSociety) {
    return (
      <ViewWrapper title="Facility Booking">
        <Facilities isSecretary={false} societyId={selectedSociety.id} />
      </ViewWrapper>
    );
  }

  if (activeView === 'visitors' && selectedSociety) {
    return (
      <ViewWrapper title="Visitor Management">
        <VisitorEntry isWatchman={false} />
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

  if (activeView === 'documents' && selectedSociety) {
    return (
      <ViewWrapper title="Documents">
        <Documents societyId={selectedSociety.id} isSecretary={false} />
      </ViewWrapper>
    );
  }

  // Resident-specific features
  const features = [
    { 
      title: 'Noticeboard', 
      description: 'View society announcements',
      icon: Bell, 
      onClick: () => setActiveView('noticeboard') 
    },
    { 
      title: 'Visitors', 
      description: 'Approve or reject visitors',
      icon: Users, 
      onClick: () => setActiveView('visitors') 
    },
    { 
      title: 'Complaints', 
      description: 'Submit and track issues',
      icon: MessageSquare, 
      onClick: () => setActiveView('complaints') 
    },
    { 
      title: 'Bills', 
      description: 'View and pay your bills',
      icon: CreditCard, 
      onClick: () => setActiveView('bills') 
    },
    { 
      title: 'Facilities', 
      description: 'Book society amenities',
      icon: Building, 
      onClick: () => setActiveView('facilities') 
    },
    { 
      title: 'Documents', 
      description: 'Access society documents',
      icon: FileText, 
      onClick: () => setActiveView('documents') 
    },
    { 
      title: 'Emergency', 
      description: 'View emergency contacts',
      icon: Phone, 
      onClick: () => setActiveView('emergency') 
    },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <DashboardHeader
          title="Welcome back!"
          subtitle={user?.email}
          role="resident"
          onSignOut={signOut}
        />

        {selectedSociety && (
          <SocietySelector
            society={selectedSociety}
            canChange={societies.length > 1}
            onChangeSociety={handleChangeSociety}
            color="primary"
          />
        )}

        {/* Availability Status */}
        {selectedSociety && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <AvailabilityStatus societyId={selectedSociety.id} />
          </motion.div>
        )}

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <DashboardCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                color="resident"
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
