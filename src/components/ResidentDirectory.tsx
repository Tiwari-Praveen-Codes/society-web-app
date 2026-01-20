import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Home, Plane, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Resident {
  id: string;
  user_id: string;
  availability_status: string;
  role: string;
  profile: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface ResidentDirectoryProps {
  societyId: string;
}

export function ResidentDirectory({ societyId }: ResidentDirectoryProps) {
  const { toast } = useToast();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResidents = async () => {
    setLoading(true);
    
    // Fetch society members with their profiles
    const { data: members, error: membersError } = await supabase
      .from('society_members')
      .select('id, user_id, availability_status, role')
      .eq('society_id', societyId)
      .eq('status', 'active')
      .in('role', ['resident', 'watchman']);

    if (membersError) {
      toast({ title: 'Error fetching residents', description: membersError.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Fetch profiles for all members
    const userIds = members?.map(m => m.user_id) || [];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    if (profilesError) {
      toast({ title: 'Error fetching profiles', description: profilesError.message, variant: 'destructive' });
    }

    // Combine members with their profiles
    const residentsWithProfiles = members?.map(member => ({
      ...member,
      profile: profiles?.find(p => p.id === member.user_id) || null
    })) || [];

    // Sort: available first, then by name
    residentsWithProfiles.sort((a, b) => {
      if (a.availability_status === b.availability_status) {
        const nameA = a.profile?.full_name || a.profile?.email || '';
        const nameB = b.profile?.full_name || b.profile?.email || '';
        return nameA.localeCompare(nameB);
      }
      return a.availability_status === 'available' ? -1 : 1;
    });

    setResidents(residentsWithProfiles);
    setLoading(false);
  };

  useEffect(() => {
    fetchResidents();
  }, [societyId]);

  const availableCount = residents.filter(r => r.availability_status === 'available').length;
  const awayCount = residents.filter(r => r.availability_status === 'away').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Residents Directory</h2>
          <p className="text-muted-foreground">View resident availability status</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchResidents}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Home className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{availableCount}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Plane className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{awayCount}</p>
              <p className="text-sm text-muted-foreground">Away</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Residents List */}
      {residents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No residents found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {residents.map((resident, index) => (
            <motion.div
              key={resident.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      resident.availability_status === 'available' 
                        ? 'bg-green-500/10' 
                        : 'bg-amber-500/10'
                    }`}>
                      {resident.availability_status === 'available' 
                        ? <Home className="w-5 h-5 text-green-500" />
                        : <Plane className="w-5 h-5 text-amber-500" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">
                        {resident.profile?.full_name || resident.profile?.email || 'Unknown'}
                      </p>
                      {resident.profile?.full_name && resident.profile?.email && (
                        <p className="text-sm text-muted-foreground">{resident.profile.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {resident.role === 'watchman' && (
                      <Badge variant="secondary">Watchman</Badge>
                    )}
                    <Badge variant={resident.availability_status === 'available' ? 'default' : 'outline'}
                      className={resident.availability_status === 'available' 
                        ? 'bg-green-600' 
                        : 'border-amber-500 text-amber-600'
                      }
                    >
                      {resident.availability_status === 'available' ? 'Available' : 'Away'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}