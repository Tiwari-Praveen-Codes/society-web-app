import { useState, useEffect } from 'react';
import { Phone, Plus, Trash2, AlertCircle, Building2, Flame, Stethoscope, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  category: string;
  description: string | null;
}

interface EmergencyContactsProps {
  societyId: string;
  isSecretary: boolean;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  police: Shield,
  fire: Flame,
  hospital: Stethoscope,
  other: Building2,
};

const categoryColors: Record<string, string> = {
  police: 'text-blue-500 bg-blue-500/10',
  fire: 'text-orange-500 bg-orange-500/10',
  hospital: 'text-red-500 bg-red-500/10',
  other: 'text-muted-foreground bg-muted',
};

export function EmergencyContacts({ societyId, isSecretary }: EmergencyContactsProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    category: 'other',
    description: '',
  });

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('society_id', societyId)
      .order('category', { ascending: true });

    if (error) {
      toast.error('Failed to load contacts');
      console.error(error);
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, [societyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from('emergency_contacts').insert({
      society_id: societyId,
      name: form.name,
      phone: form.phone,
      category: form.category,
      description: form.description || null,
    });

    if (error) {
      toast.error('Failed to add contact');
      console.error(error);
    } else {
      toast.success('Contact added');
      setForm({ name: '', phone: '', category: 'other', description: '' });
      setShowForm(false);
      fetchContacts();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete contact');
    } else {
      toast.success('Contact deleted');
      fetchContacts();
    }
  };

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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Emergency Contacts</h2>
            <p className="text-sm text-muted-foreground">Important numbers for emergencies</p>
          </div>
        </div>
        {isSecretary && (
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showForm && isSecretary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Police Station"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="100"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => setForm({ ...form, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="police">Police</SelectItem>
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Local police station"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Contact</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No emergency contacts added yet</p>
            {isSecretary && (
              <p className="text-sm text-muted-foreground mt-2">
                Click "Add Contact" to add police, fire, or hospital numbers
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => {
            const Icon = categoryIcons[contact.category] || Building2;
            const colorClass = categoryColors[contact.category] || categoryColors.other;
            
            return (
              <Card key={contact.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{contact.name}</h3>
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-lg font-semibold text-primary hover:underline flex items-center gap-2"
                        >
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </a>
                        {contact.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {contact.description}
                          </p>
                        )}
                        <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-muted capitalize">
                          {contact.category}
                        </span>
                      </div>
                    </div>
                    {isSecretary && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={() => handleDelete(contact.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
