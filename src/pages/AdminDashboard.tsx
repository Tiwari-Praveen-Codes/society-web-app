import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Calendar, Eye, LogOut, ShieldCheck, Clock, User, Mail, CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  created_at: string | null;
  secretary_id: string | null;
}

interface SecretaryProfile {
  full_name: string | null;
  email: string | null;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [secretaryProfile, setSecretaryProfile] = useState<SecretaryProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchPendingSocieties();
  }, []);

  const fetchPendingSocieties = async () => {
    const { data, error } = await supabase
      .from('societies')
      .select('*')
      .eq('status', 'pending_verification')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSocieties(data);
    }
    setLoading(false);
  };

  const fetchSecretaryProfile = async (secretaryId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', secretaryId)
      .maybeSingle();

    if (!error && data) {
      setSecretaryProfile(data);
    } else {
      setSecretaryProfile(null);
    }
  };

  const handleViewDetails = async (society: Society) => {
    setSelectedSociety(society);
    setModalOpen(true);
    if (society.secretary_id) {
      await fetchSecretaryProfile(society.secretary_id);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSociety(null);
    setSecretaryProfile(null);
  };

  const handleUpdateStatus = async (status: 'active' | 'rejected') => {
    if (!selectedSociety) return;

    setActionLoading(true);
    const { error } = await supabase
      .from('societies')
      .update({ status })
      .eq('id', selectedSociety.id);

    setActionLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Action failed',
        description: error.message,
      });
      return;
    }

    toast({
      title: status === 'active' ? 'Society Approved' : 'Society Rejected',
      description: `${selectedSociety.name} has been ${status === 'active' ? 'approved' : 'rejected'}.`,
    });

    handleCloseModal();
    fetchPendingSocieties();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Pending Verification Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Pending Verification</h2>
              <p className="text-sm text-muted-foreground">
                Societies awaiting approval ({societies.length})
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : societies.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">
                  No societies pending verification
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {societies.map((society, index) => (
                <motion.div
                  key={society.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{society.name}</CardTitle>
                            <Badge variant="outline" className="mt-1 text-warning border-warning/30 bg-warning/10">
                              Pending
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">
                          {society.city}, {society.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">
                          {society.created_at
                            ? format(new Date(society.created_at), 'MMM dd, yyyy')
                            : 'N/A'}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleViewDetails(society)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Society Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Society Details
            </DialogTitle>
          </DialogHeader>

          {selectedSociety && (
            <div className="space-y-5">
              {/* Society Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Society Name
                </label>
                <p className="text-lg font-semibold mt-1">{selectedSociety.name}</p>
              </div>

              {/* Full Address */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Full Address
                </label>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                  <p className="text-foreground">
                    {selectedSociety.address}, {selectedSociety.city}, {selectedSociety.state} - {selectedSociety.pincode}
                  </p>
                </div>
              </div>

              {/* Created By */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created By
                </label>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{secretaryProfile?.full_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">
                      {secretaryProfile?.email || 'No email'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Created On */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created On
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {selectedSociety.created_at
                      ? format(new Date(selectedSociety.created_at), 'MMMM dd, yyyy \'at\' hh:mm a')
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => handleUpdateStatus('active')}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {actionLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={actionLoading}
                  variant="destructive"
                  className="flex-1"
                >
                  {actionLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
