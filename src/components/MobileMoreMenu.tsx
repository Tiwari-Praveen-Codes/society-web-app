import { motion, AnimatePresence } from 'framer-motion';
import { 
  X,
  MessageSquare,
  Building,
  Phone,
  FileText,
  Settings,
  LogOut,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  action?: () => void;
}

interface MobileMoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onSignOut: () => void;
}

export function MobileMoreMenu({ isOpen, onClose, onNavigate, onSignOut }: MobileMoreMenuProps) {
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    { 
      id: 'complaints', 
      label: 'Complaints', 
      description: 'Submit and track issues',
      icon: MessageSquare 
    },
    { 
      id: 'facilities', 
      label: 'Facilities', 
      description: 'Book society amenities',
      icon: Building 
    },
    { 
      id: 'emergency', 
      label: 'Emergency', 
      description: 'View emergency contacts',
      icon: Phone 
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      description: 'Access society documents',
      icon: FileText 
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else {
      onNavigate(item.id);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 md:hidden",
              "bg-card border-t border-border rounded-t-3xl",
              "max-h-[80vh] overflow-auto",
              "safe-area-bottom"
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">More Options</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors touch-manipulation"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl",
                      "bg-secondary/50 hover:bg-secondary transition-colors",
                      "active:scale-[0.98] touch-manipulation text-left"
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{item.label}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Settings & Sign Out */}
            <div className="p-4 pt-0 border-t border-border mt-2">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigate('/profile');
                    onClose();
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-4 rounded-xl",
                    "bg-muted hover:bg-muted/80 transition-colors",
                    "active:scale-[0.98] touch-manipulation"
                  )}
                >
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Settings</span>
                </button>
                <button
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-4 rounded-xl",
                    "bg-destructive/10 hover:bg-destructive/20 transition-colors",
                    "active:scale-[0.98] touch-manipulation"
                  )}
                >
                  <LogOut className="w-5 h-5 text-destructive" />
                  <span className="font-medium text-destructive">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
