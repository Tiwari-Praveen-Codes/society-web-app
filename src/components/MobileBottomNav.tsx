import { motion } from 'framer-motion';
import { 
  Home, 
  Bell, 
  CreditCard, 
  Users, 
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type MobileNavView = 'dashboard' | 'noticeboard' | 'bills' | 'visitors' | 'more';

interface NavItem {
  id: MobileNavView;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'noticeboard', label: 'Notices', icon: Bell },
  { id: 'bills', label: 'Bills', icon: CreditCard },
  { id: 'visitors', label: 'Visitors', icon: Users },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

interface MobileBottomNavProps {
  activeView: string;
  onNavigate: (view: MobileNavView) => void;
  className?: string;
}

export function MobileBottomNav({ activeView, onNavigate, className }: MobileBottomNavProps) {
  // Map sub-views to their parent nav item
  const getActiveNavItem = (view: string): MobileNavView => {
    if (view === 'dashboard') return 'dashboard';
    if (view === 'noticeboard') return 'noticeboard';
    if (view === 'bills') return 'bills';
    if (view === 'visitors') return 'visitors';
    return 'more'; // complaints, facilities, emergency, documents
  };

  const currentNav = getActiveNavItem(activeView);

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-card/95 backdrop-blur-lg border-t border-border",
        "safe-area-bottom",
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = currentNav === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center",
                "min-w-[64px] min-h-[48px] px-3 py-2 rounded-xl",
                "transition-all duration-200 active:scale-95",
                "touch-manipulation",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavBg"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              <Icon 
                className={cn(
                  "w-6 h-6 relative z-10 transition-transform",
                  isActive && "scale-110"
                )} 
              />
              <span className={cn(
                "text-[10px] font-medium mt-1 relative z-10",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
