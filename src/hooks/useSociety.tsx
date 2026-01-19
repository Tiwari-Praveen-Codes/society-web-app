import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
}

interface SocietyContextType {
  societies: Society[];
  selectedSociety: Society | null;
  loading: boolean;
  selectSociety: (society: Society) => void;
  clearSociety: () => void;
  refetchSocieties: () => Promise<void>;
}

const SocietyContext = createContext<SocietyContextType | undefined>(undefined);

interface SocietyProviderProps {
  children: ReactNode;
  initialSociety?: Society;
}

export function SocietyProvider({ children, initialSociety }: SocietyProviderProps) {
  const { user } = useAuth();
  const [societies, setSocieties] = useState<Society[]>(initialSociety ? [initialSociety] : []);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(initialSociety || null);
  const [loading, setLoading] = useState(!initialSociety);

  const fetchUserSocieties = async () => {
    if (!user) {
      setSocieties([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Fetch societies where user is a member and society is active
    const { data, error } = await supabase
      .from('society_members')
      .select(`
        society_id,
        societies!inner (
          id,
          name,
          address,
          city,
          state,
          pincode,
          status
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (!error && data) {
      const activeSocieties = data
        .map((m: any) => m.societies)
        .filter((s: Society) => s.status === 'active');
      setSocieties(activeSocieties);
      
      // Restore selected society from session storage
      const storedSocietyId = sessionStorage.getItem('selectedSocietyId');
      if (storedSocietyId) {
        const stored = activeSocieties.find((s: Society) => s.id === storedSocietyId);
        if (stored) {
          setSelectedSociety(stored);
        }
      }
    } else {
      setSocieties([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchUserSocieties();
  }, [user]);

  const selectSociety = (society: Society) => {
    setSelectedSociety(society);
    sessionStorage.setItem('selectedSocietyId', society.id);
  };

  const clearSociety = () => {
    setSelectedSociety(null);
    sessionStorage.removeItem('selectedSocietyId');
  };

  const refetchSocieties = async () => {
    await fetchUserSocieties();
  };

  return (
    <SocietyContext.Provider value={{
      societies,
      selectedSociety,
      loading,
      selectSociety,
      clearSociety,
      refetchSocieties,
    }}>
      {children}
    </SocietyContext.Provider>
  );
}

export function useSociety() {
  const context = useContext(SocietyContext);
  if (context === undefined) {
    throw new Error('useSociety must be used within a SocietyProvider');
  }
  return context;
}
