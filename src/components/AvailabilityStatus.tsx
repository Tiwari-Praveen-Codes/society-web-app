import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Plane } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AvailabilityStatusProps {
  societyId: string;
}

export function AvailabilityStatus({ societyId }: AvailabilityStatusProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>('available');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('society_members')
        .select('availability_status')
        .eq('society_id', societyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setStatus(data.availability_status);
      }
      setLoading(false);
    };

    fetchStatus();
  }, [societyId, user]);

  const updateStatus = async (newStatus: string) => {
    if (!user) return;
    setUpdating(true);

    const { error } = await supabase
      .from('society_members')
      .update({ availability_status: newStatus })
      .eq('society_id', societyId)
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    } else {
      setStatus(newStatus);
      toast({ title: `Status updated to ${newStatus === 'available' ? 'Available' : 'Away'}` });
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Let the watchman know if you're home or away
        </p>
        
        <div className="flex gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1"
          >
            <Button
              variant={status === 'available' ? 'default' : 'outline'}
              className={`w-full h-auto py-4 flex flex-col gap-2 ${
                status === 'available' ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
              onClick={() => updateStatus('available')}
              disabled={updating}
            >
              <Home className="w-6 h-6" />
              <span>Available</span>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1"
          >
            <Button
              variant={status === 'away' ? 'default' : 'outline'}
              className={`w-full h-auto py-4 flex flex-col gap-2 ${
                status === 'away' ? 'bg-amber-600 hover:bg-amber-700' : ''
              }`}
              onClick={() => updateStatus('away')}
              disabled={updating}
            >
              <Plane className="w-6 h-6" />
              <span>Away</span>
            </Button>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <div className={`w-3 h-3 rounded-full ${
            status === 'available' ? 'bg-green-500' : 'bg-amber-500'
          }`} />
          <span className="text-sm font-medium">
            Currently: {status === 'available' ? 'Available' : 'Away'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}