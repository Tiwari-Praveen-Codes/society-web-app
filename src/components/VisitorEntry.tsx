import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSociety } from '@/hooks/useSociety';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Visitor {
  id: string;
  visitor_name: string;
  purpose: string;
  flat_number: string;
  status: string;
  created_at: string;
  created_by: string;
  resident_id: string | null;
}

interface VisitorEntryProps {
  isWatchman: boolean;
}

export function VisitorEntry({ isWatchman }: VisitorEntryProps) {
  const { user } = useAuth();
  const { selectedSociety } = useSociety();
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [residents, setResidents] = useState<{ user_id: string; full_name: string; flat_number?: string }[]>([]);
  const [form, setForm] = useState({
    visitor_name: '',
    purpose: '',
    flat_number: '',
    resident_id: ''
  });

  useEffect(() => {
    if (selectedSociety) {
      fetchVisitors();
      if (isWatchman) {
        fetchResidents();
      }
    }
  }, [selectedSociety, isWatchman]);

  const fetchVisitors = async () => {
    if (!selectedSociety) return;

    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('society_id', selectedSociety.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVisitors(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch visitors',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async () => {
    if (!selectedSociety) return;

    try {
      const { data, error } = await supabase
        .from('society_members')
        .select('user_id')
        .eq('society_id', selectedSociety.id)
        .eq('status', 'active')
        .eq('role', 'resident');

      if (error) throw error;

      // Fetch profiles for these residents
      if (data && data.length > 0) {
        const userIds = data.map(m => m.user_id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        if (profileError) throw profileError;
        
        setResidents(profiles?.map(p => ({
          user_id: p.id,
          full_name: p.full_name || 'Unknown'
        })) || []);
      }
    } catch (error: any) {
      console.error('Error fetching residents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSociety || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('visitors').insert({
        society_id: selectedSociety.id,
        visitor_name: form.visitor_name,
        purpose: form.purpose,
        flat_number: form.flat_number,
        created_by: user.id,
        resident_id: form.resident_id || null,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Visitor entry added successfully'
      });

      setForm({ visitor_name: '', purpose: '', flat_number: '', resident_id: '' });
      setShowForm(false);
      fetchVisitors();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add visitor entry',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (visitorId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('visitors')
        .update({ status: newStatus })
        .eq('id', visitorId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Visitor ${newStatus}`
      });

      fetchVisitors();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update visitor status',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Visitor Entry</h2>
            <p className="text-sm text-muted-foreground">
              {isWatchman ? 'Manage visitor entries' : 'Approve or reject visitors'}
            </p>
          </div>
        </div>
        {isWatchman && (
          <Button onClick={() => setShowForm(!showForm)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Visitor
          </Button>
        )}
      </div>

      {/* Add Visitor Form (Watchman only) */}
      {isWatchman && showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Visitor Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="visitor_name">Visitor Name</Label>
                  <Input
                    id="visitor_name"
                    value={form.visitor_name}
                    onChange={(e) => setForm({ ...form, visitor_name: e.target.value })}
                    placeholder="Enter visitor name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flat_number">Flat Number</Label>
                  <Input
                    id="flat_number"
                    value={form.flat_number}
                    onChange={(e) => setForm({ ...form, flat_number: e.target.value })}
                    placeholder="e.g., A-101"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Visit</Label>
                <Textarea
                  id="purpose"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="Enter purpose of visit"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resident_id">Notify Resident (Optional)</Label>
                <select
                  id="resident_id"
                  value={form.resident_id}
                  onChange={(e) => setForm({ ...form, resident_id: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Select a resident</option>
                  {residents.map((resident) => (
                    <option key={resident.user_id} value={resident.user_id}>
                      {resident.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Entry'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Visitor List */}
      <div className="space-y-4">
        {visitors.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No visitor entries yet</p>
            </CardContent>
          </Card>
        ) : (
          visitors.map((visitor) => (
            <Card key={visitor.id}>
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{visitor.visitor_name}</h3>
                      {getStatusBadge(visitor.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Flat: {visitor.flat_number} • Purpose: {visitor.purpose}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(visitor.created_at), 'PPp')}
                    </p>
                  </div>
                  
                  {/* Resident action buttons */}
                  {!isWatchman && visitor.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(visitor.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus(visitor.id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
