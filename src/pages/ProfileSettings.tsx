import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Camera, 
  User, 
  Phone, 
  Mail, 
  Bell, 
  CreditCard, 
  Users,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  notify_visitors: boolean;
  notify_bills: boolean;
  notify_notices: boolean;
}

export default function ProfileSettings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: null,
    notify_visitors: true,
    notify_bills: true,
    notify_notices: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email, phone, avatar_url, notify_visitors, notify_bills, notify_notices')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile({
        full_name: data.full_name || '',
        email: data.email || user.email || '',
        phone: data.phone || '',
        avatar_url: data.avatar_url,
        notify_visitors: data.notify_visitors ?? true,
        notify_bills: data.notify_bills ?? true,
        notify_notices: data.notify_notices ?? true,
      });
    }
    setLoading(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload an image file.',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB.',
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload avatar.',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        notify_visitors: profile.notify_visitors,
        notify_bills: profile.notify_bills,
        notify_notices: profile.notify_notices,
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: error.message,
      });
      return;
    }

    toast({
      title: 'Profile updated',
      description: 'Your settings have been saved.',
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Profile Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Picture</CardTitle>
              <CardDescription>Click to upload a new avatar</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 cursor-pointer" onClick={handleAvatarClick}>
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Upload a photo to personalize your profile. Max size: 2MB.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={profile.email || ''}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  type="tel"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">Visitor Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when visitors arrive</p>
                  </div>
                </div>
                <Switch
                  checked={profile.notify_visitors}
                  onCheckedChange={(checked) => setProfile(prev => ({ ...prev, notify_visitors: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium">Bill Reminders</p>
                    <p className="text-sm text-muted-foreground">Get reminded about due bills</p>
                  </div>
                </div>
                <Switch
                  checked={profile.notify_bills}
                  onCheckedChange={(checked) => setProfile(prev => ({ ...prev, notify_bills: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Society Notices</p>
                    <p className="text-sm text-muted-foreground">Get notified about new announcements</p>
                  </div>
                </div>
                <Switch
                  checked={profile.notify_notices}
                  onCheckedChange={(checked) => setProfile(prev => ({ ...prev, notify_notices: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full gap-2"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
