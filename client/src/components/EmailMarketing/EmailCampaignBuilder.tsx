/**
 * Email Campaign Builder Component
 * Phase 2.3: Email Marketing Suite
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Send, Users, BarChart3, FileText, Plus, Edit, Trash2, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SubscriberManagement } from './SubscriberManagement';
import { EmailAnalytics } from './EmailAnalytics';
import { EmailTemplateEditor } from './EmailTemplateEditor';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  previewText?: string;
  content: string;
  recipientList: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledDate?: string;
  sentDate?: string;
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
}

export function EmailCampaignBuilder({ websiteId }: { websiteId: string }) {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [_loading, setLoading] = useState(false);

  const handleSaveCampaign = (campaign: EmailCampaign) => {
    if (selectedCampaign) {
      setCampaigns(campaigns.map(c => c.id === campaign.id ? campaign : c));
      toast({
        title: 'Campaign Updated',
        description: 'Your email campaign has been saved.',
      });
    } else {
      const newCampaign = { ...campaign, id: Date.now().toString() };
      setCampaigns([...campaigns, newCampaign]);
      toast({
        title: 'Campaign Created',
        description: 'Your new email campaign has been created.',
      });
    }
    setSelectedCampaign(null);
  };

  const handleSendCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    try {
      setLoading(true);
      
      // Get subscribers
      const subscribersResponse = await fetch(`/api/email-marketing/${websiteId}/subscribers`);
      const subscribersData = await subscribersResponse.json();
      
      if (!subscribersData.success) {
        throw new Error('Failed to load subscribers');
      }
      
      // Filter active subscribers based on recipient list
      const activeSubscribers = subscribersData.subscribers.filter((s: any) => 
        s.status === 'subscribed' &&
        (campaign.recipientList === 'all' || 
         campaign.recipientList === 'active' ||
         campaign.recipientList === 'new')
      );
      
      const recipientEmails = activeSubscribers.map((s: any) => s.email);
      
      if (recipientEmails.length === 0) {
        toast({
          title: 'No Recipients',
          description: 'No active subscribers found for this campaign.',
          variant: 'destructive',
        });
        return;
      }
      
      // Send campaign via API (parallel execution on backend)
      const sendResponse = await fetch(`/api/email-marketing/${websiteId}/campaigns/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          subject: campaign.subject,
          htmlContent: campaign.content,
          recipientEmails,
          batchSize: 10, // Send 10 emails in parallel batches
        }),
      });
      
      const sendData = await sendResponse.json();
      
      if (sendData.success) {
        // Update campaign status
        const updatedCampaigns = campaigns.map(c =>
          c.id === campaignId
            ? { ...c, status: 'sent' as const, sentDate: new Date().toISOString() }
            : c
        );
        setCampaigns(updatedCampaigns);
        localStorage.setItem(`email-campaigns-${websiteId}`, JSON.stringify(updatedCampaigns));
        
        toast({
          title: 'Campaign Sent!',
          description: `${sendData.sent} emails sent successfully. ${sendData.failed > 0 ? `${sendData.failed} failed.` : ''}`,
        });
      } else {
        throw new Error(sendData.error || 'Failed to send campaign');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send campaign. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Email Campaign Builder</h2>
        <p className="text-muted-foreground">
          Create, manage, and send email campaigns to your subscribers
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">
            <FileText className="w-4 h-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="subscribers">
            <Users className="w-4 h-4 mr-2" />
            Subscribers
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-6">
          <CampaignList
            campaigns={campaigns}
            onSelect={setSelectedCampaign}
            onSend={handleSendCampaign}
            onDelete={(id) => setCampaigns(campaigns.filter(c => c.id !== id))}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <EmailTemplates onSelectTemplate={(template) => {
            const newCampaign: EmailCampaign = {
              id: Date.now().toString(),
              name: template.name,
              subject: `Your ${template.name}`,
              content: template.html,
              recipientList: 'all',
              status: 'draft',
            };
            setSelectedCampaign(newCampaign);
            setActiveTab('campaigns');
            toast({
              title: 'Template Selected',
              description: `${template.name} template loaded. You can now edit and customize it.`,
            });
          }} />
        </TabsContent>

        <TabsContent value="subscribers" className="mt-6">
          <SubscriberManagement websiteId={websiteId} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <EmailAnalytics websiteId={websiteId} />
        </TabsContent>
      </Tabs>

      {selectedCampaign && (
        <CampaignEditor
          campaign={selectedCampaign}
          onSave={handleSaveCampaign}
          onCancel={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  );
}

function CampaignList({
  campaigns,
  onSelect,
  onSend,
  onDelete,
}: {
  campaigns: EmailCampaign[];
  onSelect: (campaign: EmailCampaign) => void;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Email Campaigns</h3>
        <Button onClick={() => onSelect({} as EmailCampaign)}>
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid gap-4">
        {campaigns.map(campaign => (
          <Card key={campaign.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{campaign.name}</h4>
                    <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Subject: {campaign.subject}
                  </p>
                  {campaign.stats && (
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      <span>Sent: {campaign.stats.sent}</span>
                      <span>Opened: {campaign.stats.opened}</span>
                      <span>Clicked: {campaign.stats.clicked}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onSelect(campaign)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  {campaign.status === 'draft' && (
                    <Button size="sm" onClick={() => onSend(campaign.id)}>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => onDelete(campaign.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CampaignEditor({
  campaign,
  onSave,
  onCancel,
}: {
  campaign: EmailCampaign;
  onSave: (campaign: EmailCampaign) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<EmailCampaign>({
    ...campaign,
    id: campaign.id || Date.now().toString(),
    name: campaign.name || '',
    subject: campaign.subject || '',
    content: campaign.content || '',
    recipientList: campaign.recipientList || 'all',
    status: campaign.status || 'draft',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Campaign</CardTitle>
        <CardDescription>Create or edit your email campaign</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Campaign Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Welcome Campaign"
          />
        </div>
        <div className="space-y-2">
          <Label>Subject Line</Label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Welcome to our newsletter!"
          />
        </div>
        <div className="space-y-2">
          <Label>Preview Text</Label>
          <Input
            value={formData.previewText || ''}
            onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
            placeholder="Preview text shown in email clients"
          />
        </div>
        <div className="space-y-2">
          <Label>Recipient List</Label>
          <Select
            value={formData.recipientList}
            onValueChange={(value) => setFormData({ ...formData, recipientList: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select recipient list" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subscribers</SelectItem>
              <SelectItem value="active">Active Subscribers</SelectItem>
              <SelectItem value="new">New Subscribers</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Schedule Campaign (Optional)</Label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={formData.scheduledDate ? formData.scheduledDate.split('T')[0] : ''}
              onChange={(e) => {
                const date = e.target.value;
                const time = formData.scheduledDate ? formData.scheduledDate.split('T')[1] : '09:00';
                setFormData({ ...formData, scheduledDate: date ? `${date}T${time}` : undefined });
              }}
            />
            <Input
              type="time"
              value={formData.scheduledDate ? formData.scheduledDate.split('T')[1] : '09:00'}
              onChange={(e) => {
                const time = e.target.value;
                const date = formData.scheduledDate ? formData.scheduledDate.split('T')[0] : new Date().toISOString().split('T')[0];
                setFormData({ ...formData, scheduledDate: `${date}T${time}` });
              }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <EmailTemplateEditor
            content={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            onSave={() => onSave(formData)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onSave(formData)}>Save Campaign</Button>
          {formData.scheduledDate && (
            <Button variant="secondary" onClick={() => {
              setFormData({ ...formData, status: 'scheduled' as const });
              onSave({ ...formData, status: 'scheduled' as const });
            }}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          )}
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmailTemplates({ onSelectTemplate }: { onSelectTemplate?: (template: any) => void }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/email-marketing/templates');
        const data = await response.json();
        
        if (data.success && data.templates) {
          setTemplates(data.templates);
        }
      } catch (error) {
        console.error('Failed to load email templates:', error);
        toast({
          title: 'Error',
          description: 'Failed to load email templates',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [toast]);

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Email Templates</h3>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectTemplate?.(template)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">{template.name}</h4>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
              {template.variables && template.variables.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Variables: {template.variables.join(', ')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No templates found in this category
        </div>
      )}
    </div>
  );
}

// SubscriberManagement component is now imported from separate file

// EmailAnalytics component is now imported from separate file

