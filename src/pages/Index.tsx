import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSociety } from '@/hooks/useSociety';
import ResidentDashboard from './ResidentDashboard';
import WatchmanDashboard from './WatchmanDashboard';
import SecretaryDashboard from './SecretaryDashboard';
import AdminDashboard from './AdminDashboard';

export default function Index() {
  const { user, role, loading: authLoading } = useAuth();
  const { societies, selectedSociety, loading: societyLoading } = useSociety();
  const navigate = useNavigate();

  const loading = authLoading || societyLoading;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (!role) {
        navigate('/select-role');
      } else if (role === 'resident' && societies.length > 0 && !selectedSociety) {
        navigate('/select-society');
      }
    }
  }, [user, role, loading, societies, selectedSociety, navigate]);

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

  if (!user || !role) {
    return null;
  }

  switch (role) {
    case 'resident':
      return <ResidentDashboard />;
    case 'watchman':
      return <WatchmanDashboard />;
    case 'secretary':
      return <SecretaryDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return null;
  }
}
