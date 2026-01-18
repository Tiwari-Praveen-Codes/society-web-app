import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Plus, ArrowLeft, Calendar, ExternalLink, Edit, Trash2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Notice {
  id: string;
  title: string;
  description: string;
  link: string | null;
  created_at: string;
  created_by: string;
}

interface NoticeboardProps {
  societyId: string;
  isSecretary?: boolean;
  onBack?: () => void;
}

export default function Noticeboard({ societyId, isSecretary = false, onBack }: NoticeboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    fetchNotices();
  }, [societyId]);

  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('society_id', societyId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotices(data);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLink('');
    setSelectedNotice(null);
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Title and description are required.',
      });
      return;
    }

    setFormLoading(true);
    const { error } = await supabase.from('notices').insert({
      society_id: societyId,
      created_by: user?.id,
      title: title.trim(),
      description: description.trim(),
      link: link.trim() || null,
    });
    setFormLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to create notice',
        description: error.message,
      });
      return;
    }

    toast({ title: 'Notice created successfully' });
    setCreateDialogOpen(false);
    resetForm();
    fetchNotices();
  };

  const handleEdit = async () => {
    if (!selectedNotice || !title.trim() || !description.trim()) return;

    setFormLoading(true);
    const { error } = await supabase
      .from('notices')
      .update({
        title: title.trim(),
        description: description.trim(),
        link: link.trim() || null,
      })
      .eq('id', selectedNotice.id);
    setFormLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update notice',
        description: error.message,
      });
      return;
    }

    toast({ title: 'Notice updated successfully' });
    setEditDialogOpen(false);
    resetForm();
    fetchNotices();
  };

  const handleDelete = async () => {
    if (!selectedNotice) return;

    setFormLoading(true);
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', selectedNotice.id);
    setFormLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete notice',
        description: error.message,
      });
      return;
    }

    toast({ title: 'Notice deleted successfully' });
    setDeleteDialogOpen(false);
    resetForm();
    fetchNotices();
  };

  const openEditDialog = (notice: Notice) => {
    setSelectedNotice(notice);
    setTitle(notice.title);
    setDescription(notice.description);
    setLink(notice.link || '');
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (notice: Notice) => {
    setSelectedNotice(notice);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Noticeboard</h1>
                <p className="text-sm text-muted-foreground">
                  {notices.length} {notices.length === 1 ? 'notice' : 'notices'}
                </p>
              </div>
            </div>
          </div>
          {isSecretary && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Notice
            </Button>
          )}
        </motion.div>

        {/* Notices List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : notices.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-center">
                No notices yet
              </p>
              {isSecretary && (
                <p className="text-sm text-muted-foreground text-center mt-1">
                  Create your first notice to get started
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg">{notice.title}</CardTitle>
                      {isSecretary && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(notice)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(notice)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {notice.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(notice.created_at), 'MMM dd, yyyy')}
                      </div>
                      {notice.link && (
                        <a
                          href={notice.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Link
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Notice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter notice title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter notice description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link" className="flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5" />
                Link (optional)
              </Label>
              <Input
                id="link"
                type="url"
                placeholder="https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create Notice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                placeholder="Enter notice title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter notice description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-link" className="flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5" />
                Link (optional)
              </Label>
              <Input
                id="edit-link"
                type="url"
                placeholder="https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={formLoading}>
              {formLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notice</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            Are you sure you want to delete "{selectedNotice?.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
