import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Shield, Briefcase, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type AppRole = 'resident' | 'watchman' | 'secretary';

interface RoleOption {
  id: AppRole;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const roles: RoleOption[] = [
  {
    id: 'resident',
    title: 'Resident',
    description: 'Access society features, pay bills, book amenities, and stay updated with notices.',
    icon: Home,
    color: 'text-resident',
    bgColor: 'bg-resident/10 hover:bg-resident/20',
  },
  {
    id: 'watchman',
    title: 'Watchman',
    description: 'Manage visitor entries, handle security alerts, and monitor gate activities.',
    icon: Shield,
    color: 'text-watchman',
    bgColor: 'bg-watchman/10 hover:bg-watchman/20',
  },
  {
    id: 'secretary',
    title: 'Secretary',
    description: 'Manage society operations, handle finances, and oversee all administrative tasks.',
    icon: Briefcase,
    color: 'text-secretary',
    bgColor: 'bg-secretary/10 hover:bg-secretary/20',
  },
];

export default function SelectRole() {
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUserRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    const { error } = await setUserRole(selectedRole);
    setLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to set role',
        description: error.message,
      });
      return;
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold mb-2"
          >
            Choose Your Role
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground"
          >
            Select how you'll be using the Society App
          </motion.p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                onClick={() => setSelectedRole(role.id)}
                className={`relative p-6 rounded-xl border-2 text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                } ${role.bgColor}`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
                
                <div className={`w-14 h-14 rounded-xl ${role.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-7 h-7 ${role.color}`} />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{role.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {role.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            size="lg"
            className="px-8 group"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
                Setting up...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
