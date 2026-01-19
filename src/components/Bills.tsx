import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSociety } from '@/hooks/useSociety';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Receipt, CreditCard, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Bill {
  id: string;
  society_id: string;
  user_id: string;
  title: string;
  amount: number;
  due_date: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface BillsProps {
  isSecretary?: boolean;
  societyId?: string;
}

export function Bills({ isSecretary = false, societyId }: BillsProps) {
  const { user } = useAuth();
  const { selectedSociety } = useSociety();
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeSocietyId = societyId || selectedSociety?.id;

  const fetchBills = async () => {
    if (!activeSocietyId || !user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('society_id', activeSocietyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bills',
        variant: 'destructive',
      });
    } else {
      setBills(data || []);
    }
    setLoading(false);
  };

  const fetchMembers = async () => {
    if (!activeSocietyId || !isSecretary) return;

    const { data, error } = await supabase
      .from('society_members')
      .select(`
        id,
        user_id,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('society_id', activeSocietyId)
      .eq('status', 'active');

    if (!error && data) {
      setMembers(data as unknown as Member[]);
    }
  };

  useEffect(() => {
    fetchBills();
    if (isSecretary) {
      fetchMembers();
    }
  }, [activeSocietyId, user, isSecretary]);

  const handleSubmit = async () => {
    if (!activeSocietyId || !user || !title.trim() || !amount || !dueDate || !selectedMember) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('bills').insert({
      society_id: activeSocietyId,
      user_id: selectedMember,
      title: title.trim(),
      amount: parseFloat(amount),
      due_date: dueDate,
    });

    if (error) {
      console.error('Error creating bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate bill',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Bill generated successfully',
      });
      setTitle('');
      setAmount('');
      setDueDate('');
      setSelectedMember('');
      setIsDialogOpen(false);
      fetchBills();
    }
    setSubmitting(false);
  };

  const handleMarkAsPaid = async (billId: string) => {
    const { error } = await supabase
      .from('bills')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', billId);

    if (error) {
      console.error('Error updating bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark bill as paid',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Bill marked as paid',
      });
      fetchBills();
    }
  };

  if (!activeSocietyId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Please select a society to view bills.
        </CardContent>
      </Card>
    );
  }

  const getMemberName = (userId: string) => {
    const member = members.find(m => m.user_id === userId);
    return member?.profiles?.full_name || member?.profiles?.email || 'Unknown';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bills</h2>
        {isSecretary && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Bill</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="member">Resident *</Label>
                  <Select value={selectedMember} onValueChange={setSelectedMember}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resident" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {member.profiles?.full_name || member.profiles?.email || 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Monthly Maintenance"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Generating...' : 'Generate'}
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
            Loading bills...
          </CardContent>
        </Card>
      ) : bills.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground flex flex-col items-center gap-2">
            <Receipt className="h-8 w-8" />
            <p>No bills found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <Card key={bill.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{bill.title}</CardTitle>
                    {isSecretary && (
                      <p className="text-xs text-muted-foreground mt-1">
                        For: {getMemberName(bill.user_id)}
                      </p>
                    )}
                  </div>
                  <Badge variant={bill.status === 'paid' ? 'default' : 'destructive'}>
                    {bill.status === 'paid' ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Paid</>
                    ) : (
                      'Unpaid'
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">₹{Number(bill.amount).toLocaleString('en-IN')}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {format(new Date(bill.due_date), 'PP')}
                    </p>
                    {bill.paid_at && (
                      <p className="text-xs text-green-600 mt-1">
                        Paid on: {format(new Date(bill.paid_at), 'PPp')}
                      </p>
                    )}
                  </div>
                  {!isSecretary && bill.status === 'unpaid' && (
                    <Button onClick={() => handleMarkAsPaid(bill.id)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
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
