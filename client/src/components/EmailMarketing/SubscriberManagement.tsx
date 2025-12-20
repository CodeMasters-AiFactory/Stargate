/**
 * Subscriber Management Component
 * Phase 2.3: Complete subscriber management with segmentation
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Download, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: 'subscribed' | 'unsubscribed' | 'bounced';
  tags: string[];
  segments: string[];
  metadata: Record<string, any>;
  subscribedAt: string;
}

interface SubscriberManagementProps {
  websiteId: string;
}

export function SubscriberManagement({ websiteId }: SubscriberManagementProps) {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'subscribed' | 'unsubscribed' | 'bounced'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({ email: '', name: '', tags: '' });

  useEffect(() => {
    loadSubscribers();
  }, [websiteId]);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/email-marketing/${websiteId}/subscribers`);
      const data = await response.json();
      
      if (data.success) {
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error('Failed to load subscribers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscribers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriber = async () => {
    if (!newSubscriber.email) {
      toast({
        title: 'Error',
        description: 'Email is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const tags = newSubscriber.tags.split(',').map(t => t.trim()).filter(Boolean);
      const response = await fetch(`/api/email-marketing/${websiteId}/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newSubscriber.email,
          name: newSubscriber.name || undefined,
          tags,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Subscriber added successfully',
        });
        setIsAddDialogOpen(false);
        setNewSubscriber({ email: '', name: '', tags: '' });
        loadSubscribers();
      } else {
        throw new Error(data.error || 'Failed to add subscriber');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add subscriber',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveSubscriber = async (subscriberId: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) {
      return;
    }

    try {
      const response = await fetch(`/api/email-marketing/${websiteId}/subscribers/${subscriberId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Subscriber removed',
        });
        loadSubscribers();
      } else {
        throw new Error(data.error || 'Failed to remove subscriber');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove subscriber',
        variant: 'destructive',
      });
    }
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = !searchTerm || 
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: subscribers.length,
    subscribed: subscribers.filter(s => s.status === 'subscribed').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    bounced: subscribers.filter(s => s.status === 'bounced').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Subscriber Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage your email subscribers, tags, and segments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Subscriber
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subscriber</DialogTitle>
              <DialogDescription>
                Add a subscriber to your email list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={newSubscriber.email}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
                  placeholder="subscriber@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newSubscriber.name}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={newSubscriber.tags}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, tags: e.target.value })}
                  placeholder="customer, vip, newsletter"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddSubscriber} className="flex-1">
                  Add Subscriber
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Subscribers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.subscribed}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.unsubscribed}</div>
            <div className="text-sm text-muted-foreground">Unsubscribed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.bounced}</div>
            <div className="text-sm text-muted-foreground">Bounced</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="subscribed">Subscribed</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading subscribers...</div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No subscribers found. Add your first subscriber to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>{subscriber.name || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          subscriber.status === 'subscribed'
                            ? 'default'
                            : subscriber.status === 'unsubscribed'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {subscriber.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {subscriber.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSubscriber(subscriber.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

