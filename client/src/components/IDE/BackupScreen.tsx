/**
 * Backup Screen
 * Manage website backups - create, restore, delete backups
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Archive,
  Download,
  RotateCcw,
  Trash2,
  Plus,
  Calendar,
  HardDrive,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { BackButton } from './BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Backup {
  id: string;
  websiteId: string;
  websiteName: string;
  name: string;
  description?: string;
  createdAt: string;
  size: number; // bytes
  version: string;
  status: 'completed' | 'failed' | 'in_progress';
}

export function BackupScreen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [restoreBackupId, setRestoreBackupId] = useState<string | null>(null);
  const [deleteBackupId, setDeleteBackupId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load backups on mount
  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/websites/backups');
      if (!response.ok) {
        throw new Error('Failed to load backups');
      }
      const data = await response.json();
      setBackups(data.backups || []);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load backups',
        variant: 'destructive',
      });
      // Use mock data for now
      setBackups([
        {
          id: '1',
          websiteId: 'website-1',
          websiteName: 'My Business Website',
          name: 'Backup 2025-01-15',
          description: 'Full website backup before major changes',
          createdAt: new Date().toISOString(),
          size: 5242880, // 5MB
          version: '1.2.3',
          status: 'completed',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!backupName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a backup name',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/websites/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: backupName,
          description: backupDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      toast({
        title: 'Success',
        description: 'Backup created successfully',
      });

      setShowCreateDialog(false);
      setBackupName('');
      setBackupDescription('');
      await loadBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to create backup',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    try {
      setRestoring(true);
      const response = await fetch(`/api/websites/restore/${backupId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to restore backup');
      }

      toast({
        title: 'Success',
        description: 'Website restored successfully',
      });

      setRestoreBackupId(null);
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore backup',
        variant: 'destructive',
      });
    } finally {
      setRestoring(false);
    }
  };

  const handleDelete = async (backupId: string) => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/websites/backup/${backupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete backup');
      }

      toast({
        title: 'Success',
        description: 'Backup deleted successfully',
      });

      setDeleteBackupId(null);
      await loadBackups();
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete backup',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalBackups = backups.length;
  const completedBackups = backups.filter(b => b.status === 'completed').length;
  const failedBackups = backups.filter(b => b.status === 'failed').length;
  const totalSize = backups.reduce((sum, b) => sum + b.size, 0);

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-y-auto" data-testid="backup-screen">
      <div className="w-full px-8 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-cyan-300 flex items-center gap-3 mb-2">
            <Archive className="w-8 h-8" />
            Backup & Restore
          </h2>
          <p className="text-cyan-400">
            Manage website backups - create, restore, and delete backups
          </p>
        </div>

        {/* Summary Statistics Cards - Matching TemplateQA Design */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-cyan-900/30 border-cyan-500/50">
            <div className="text-2xl font-bold text-cyan-300">{totalBackups}</div>
            <div className="text-sm text-cyan-400">Total Backups</div>
          </Card>
          <Card className="p-4 bg-green-900/30 border-green-500/50">
            <div className="text-2xl font-bold text-green-300">{completedBackups}</div>
            <div className="text-sm text-green-400">✅ Completed</div>
          </Card>
          <Card className="p-4 bg-red-900/30 border-red-500/50">
            <div className="text-2xl font-bold text-red-300">{failedBackups}</div>
            <div className="text-sm text-red-400">❌ Failed</div>
          </Card>
          <Card className="p-4 bg-yellow-900/30 border-yellow-500/50">
            <div className="text-2xl font-bold text-yellow-300">
              {totalSize > 1024 * 1024 * 1024 
                ? `${(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB`
                : totalSize > 1024 * 1024
                  ? `${(totalSize / (1024 * 1024)).toFixed(1)} MB`
                  : `${(totalSize / 1024).toFixed(1)} KB`}
            </div>
            <div className="text-sm text-yellow-400">Total Size</div>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Backup
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mb-6 p-4 bg-blue-900/30 border-blue-500/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>About Backups</span>
            </CardTitle>
            <CardDescription>
              Backups include your complete website HTML, CSS, images, and configuration. You can
              restore to any backup point at any time.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Backups Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : backups.length === 0 ? (
          <Card className="p-8 bg-cyan-900/20 border-cyan-500/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Archive className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-cyan-300">No backups yet</h3>
              <p className="text-cyan-400 text-center mb-4">
                Create your first backup to protect your website
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Backup
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Your Backups</CardTitle>
              <CardDescription>
                {backups.length} backup{backups.length !== 1 ? 's' : ''} available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">{backup.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {backup.websiteName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(backup.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <HardDrive className="w-3 h-3" />
                          <span>{formatFileSize(backup.size)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{backup.version}</Badge>
                      </TableCell>
                      <TableCell>
                        {backup.status === 'completed' ? (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        ) : backup.status === 'failed' ? (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            In Progress
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRestoreBackupId(backup.id)}
                            disabled={backup.status !== 'completed'}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Download backup
                              window.open(`/api/websites/backup/${backup.id}/download`, '_blank');
                            }}
                            disabled={backup.status !== 'completed'}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteBackupId(backup.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Create Backup Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Backup</DialogTitle>
              <DialogDescription>
                Create a backup of your current website. This includes all HTML, CSS, images, and
                configuration.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Backup Name</label>
                <input
                  type="text"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="e.g., Backup before redesign"
                  className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <textarea
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="Add a note about this backup..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateBackup}
                disabled={creating || !backupName.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Backup
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Restore Confirmation Dialog */}
        <AlertDialog open={!!restoreBackupId} onOpenChange={() => setRestoreBackupId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restore Backup?</AlertDialogTitle>
              <AlertDialogDescription>
                This will replace your current website with the backup. This action cannot be
                undone. Make sure to create a backup of your current website first.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => restoreBackupId && handleRestore(restoreBackupId)}
                disabled={restoring}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {restoring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  'Restore'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteBackupId} onOpenChange={() => setDeleteBackupId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Backup?</AlertDialogTitle>
              <AlertDialogDescription>
                This backup will be permanently deleted. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteBackupId && handleDelete(deleteBackupId)}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

