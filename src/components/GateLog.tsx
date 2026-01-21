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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList, Plus, LogIn, LogOut as LogOutIcon, Car, Bike } from 'lucide-react';
import { format } from 'date-fns';

interface GateLogEntry {
  id: string;
  society_id: string;
  visitor_id: string | null;
  visitor_name: string;
  flat_number: string;
  purpose: string;
  vehicle_number: string | null;
  vehicle_type: string | null;
  entry_time: string;
  exit_time: string | null;
  security_notes: string | null;
  logged_by: string;
  created_at: string;
}

interface GateLogProps {
  isSecretary?: boolean;
}

export function GateLog({ isSecretary = false }: GateLogProps) {
  const { user } = useAuth();
  const { selectedSociety } = useSociety();
  const { toast } = useToast();
  const [entries, setEntries] = useState<GateLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    visitor_name: '',
    flat_number: '',
    purpose: '',
    vehicle_number: '',
    vehicle_type: '',
    security_notes: ''
  });

  const fetchEntries = async () => {
    if (!selectedSociety) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('gate_logs')
      .select('*')
      .eq('society_id', selectedSociety.id)
      .order('entry_time', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching gate logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch gate logs',
        variant: 'destructive',
      });
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedSociety) {
      fetchEntries();
    }
  }, [selectedSociety]);

  const handleSubmit = async () => {
    if (!selectedSociety || !user || !form.visitor_name.trim() || !form.flat_number.trim() || !form.purpose.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('gate_logs').insert({
      society_id: selectedSociety.id,
      visitor_name: form.visitor_name.trim(),
      flat_number: form.flat_number.trim(),
      purpose: form.purpose.trim(),
      vehicle_number: form.vehicle_number.trim() || null,
      vehicle_type: form.vehicle_type || null,
      security_notes: form.security_notes.trim() || null,
      logged_by: user.id,
    });

    if (error) {
      console.error('Error creating gate log:', error);
      toast({
        title: 'Error',
        description: 'Failed to add gate log entry',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Gate log entry added',
      });
      setForm({
        visitor_name: '',
        flat_number: '',
        purpose: '',
        vehicle_number: '',
        vehicle_type: '',
        security_notes: ''
      });
      setIsDialogOpen(false);
      fetchEntries();
    }
    setSubmitting(false);
  };

  const handleMarkExit = async (entryId: string) => {
    const { error } = await supabase
      .from('gate_logs')
      .update({ exit_time: new Date().toISOString() })
      .eq('id', entryId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark exit',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Exit time recorded',
      });
      fetchEntries();
    }
  };

  const getVehicleIcon = (type: string | null) => {
    switch (type) {
      case 'car':
        return <Car className="h-3 w-3" />;
      case 'bike':
      case 'auto':
        return <Bike className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (!selectedSociety) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Please select a society to view gate logs.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Gate Log</h2>
            <p className="text-sm text-muted-foreground">
              Track visitor entries and exits
            </p>
          </div>
        </div>
        {!isSecretary && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>New Gate Log Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="visitor_name">Visitor Name *</Label>
                    <Input
                      id="visitor_name"
                      value={form.visitor_name}
                      onChange={(e) => setForm({ ...form, visitor_name: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="flat_number">Flat Number *</Label>
                    <Input
                      id="flat_number"
                      value={form.flat_number}
                      onChange={(e) => setForm({ ...form, flat_number: e.target.value })}
                      placeholder="e.g., A-101"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose *</Label>
                  <Input
                    id="purpose"
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="Reason for visit"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_type">Vehicle Type</Label>
                    <Select value={form.vehicle_type} onValueChange={(value) => setForm({ ...form, vehicle_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_number">Vehicle Number</Label>
                    <Input
                      id="vehicle_number"
                      value={form.vehicle_number}
                      onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
                      placeholder="e.g., MH-01-AB-1234"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="security_notes">Security Notes</Label>
                  <Textarea
                    id="security_notes"
                    value={form.security_notes}
                    onChange={(e) => setForm({ ...form, security_notes: e.target.value })}
                    placeholder="Any additional notes..."
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Entry'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Loading gate logs...
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground flex flex-col items-center gap-2">
            <ClipboardList className="h-8 w-8" />
            <p>No gate log entries found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{entry.visitor_name}</h3>
                      <Badge variant="outline">Flat {entry.flat_number}</Badge>
                      {entry.vehicle_type && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {getVehicleIcon(entry.vehicle_type)}
                          {entry.vehicle_number || entry.vehicle_type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.purpose}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <LogIn className="h-3 w-3 text-green-500" />
                        {format(new Date(entry.entry_time), 'PPp')}
                      </span>
                      {entry.exit_time && (
                        <span className="flex items-center gap-1">
                          <LogOutIcon className="h-3 w-3 text-red-500" />
                          {format(new Date(entry.exit_time), 'PPp')}
                        </span>
                      )}
                    </div>
                    {entry.security_notes && (
                      <p className="text-xs text-muted-foreground italic">
                        Note: {entry.security_notes}
                      </p>
                    )}
                  </div>
                  {!entry.exit_time && !isSecretary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkExit(entry.id)}
                    >
                      <LogOutIcon className="h-4 w-4 mr-1" />
                      Mark Exit
                    </Button>
                  )}
                  {entry.exit_time && (
                    <Badge variant="default" className="bg-green-500/20 text-green-600 border-green-500/30">
                      Completed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
