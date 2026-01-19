import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSociety } from '@/hooks/useSociety';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Complaint {
  id: string;
  society_id: string;
  user_id: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ComplaintsProps {
  isSecretary?: boolean;
}

const CATEGORIES = [
  'Maintenance',
  'Security',
  'Cleanliness',
  'Noise',
  'Parking',
  'Water Supply',
  'Electricity',
  'Common Areas',
  'Other'
];

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved'];

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Pending':
      return 'destructive';
    case 'In Progress':
      return 'secondary';
    case 'Resolved':
      return 'default';
    default:
      return 'outline';
  }
};

export function Complaints({ isSecretary = false }: ComplaintsProps) {
  const { user } = useAuth();
  const { selectedSociety } = useSociety();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    if (!selectedSociety || !user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('society_id', selectedSociety.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching complaints:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch complaints',
        variant: 'destructive',
      });
    } else {
      setComplaints(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedSociety, user]);

  const handleSubmit = async () => {
    if (!selectedSociety || !user || !category || !description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('complaints').insert({
      society_id: selectedSociety.id,
      user_id: user.id,
      category,
      description: description.trim(),
    });

    if (error) {
      console.error('Error creating complaint:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit complaint',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Complaint submitted successfully',
      });
      setCategory('');
      setDescription('');
      setIsDialogOpen(false);
      fetchComplaints();
    }
    setSubmitting(false);
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
    const { error } = await supabase
      .from('complaints')
      .update({ status: newStatus })
      .eq('id', complaintId);

    if (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
      fetchComplaints();
    }
  };

  if (!selectedSociety) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Please select a society to view complaints.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Complaints</h2>
        {!isSecretary && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Raise Complaint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Raise a Complaint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your complaint in detail..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
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
            Loading complaints...
          </CardContent>
        </Card>
      ) : complaints.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <p>No complaints found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {complaints.map((complaint) => (
            <Card key={complaint.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{complaint.category}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(complaint.created_at), 'PPp')}
                    </p>
                  </div>
                  {isSecretary ? (
                    <Select
                      value={complaint.status}
                      onValueChange={(value) => handleStatusUpdate(complaint.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getStatusVariant(complaint.status)}>
                      {complaint.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {complaint.description}
                </p>
                {complaint.updated_at !== complaint.created_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Updated: {format(new Date(complaint.updated_at), 'PPp')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
