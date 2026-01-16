import { motion } from 'framer-motion';
import { Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface Society {
  name: string;
  status: string;
}

interface PendingApprovalProps {
  society: Society;
}

export default function PendingApproval({ society }: PendingApprovalProps) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secretary/10 mb-6"
        >
          <Clock className="w-10 h-10 text-secretary" />
        </motion.div>
        
        <h1 className="text-2xl font-bold mb-3">Waiting for Approval</h1>
        <p className="text-muted-foreground mb-2">
          Your society <span className="text-foreground font-medium">"{society.name}"</span> is pending verification.
        </p>
        <p className="text-muted-foreground mb-6">
          Our team will review and verify your details shortly.
        </p>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secretary/10 border border-secretary/30 mb-8">
          <div className="w-2 h-2 rounded-full bg-secretary animate-pulse" />
          <span className="text-sm font-medium text-secretary">Pending Verification</span>
        </div>

        <div>
          <Button
            variant="outline"
            onClick={signOut}
            className="flex items-center gap-2 mx-auto"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
