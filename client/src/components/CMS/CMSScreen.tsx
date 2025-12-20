/**
 * CMS Screen
 * Content Management System interface
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, FileText, FolderOpen, Settings, Trash2, Edit, Eye, History } from 'lucide-react';
import { ContentTypeBuilder } from './ContentTypeBuilder';
import { ContentEntryEditor } from './ContentEntryEditor';
import { toast } from 'sonner';

export interface CMSScreenProps {
  websiteId: string;
}

export interface ContentType {
  id: string;
  name: string;
  slug: string;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    required?: boolean;
  }>;
}

export interface ContentEntry {
  id: string;
  contentTypeId: string;
  data: Record<string, any>;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export function CMSScreen({ websiteId }: CMSScreenProps) {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [contentEntries, setContentEntries] = useState<ContentEntry[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentTypeBuilderOpen, setContentTypeBuilderOpen] = useState(false);
  const [editingContentType, setEditingContentType] = useState<ContentType | null>(null);
  const [entryEditorOpen, setEntryEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ContentEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<ContentEntry | null>(null);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [entryRevisions, setEntryRevisions] = useState<any[]>([]);

  useEffect(() => {
    loadContentTypes();
  }, [websiteId]);

  useEffect(() => {
    if (selectedContentType) {
      loadContentEntries(selectedContentType);
    }
  }, [selectedContentType, websiteId]);

  const loadContentTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cms/content-types/${websiteId}`);
      const data = await response.json();
      if (data.success) {
        setContentTypes(data.contentTypes);
        if (data.contentTypes.length > 0 && !selectedContentType) {
          setSelectedContentType(data.contentTypes[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load content types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContentEntries = async (contentTypeId: string) => {
    try {
      const response = await fetch(`/api/cms/entries/${websiteId}?contentTypeId=${contentTypeId}`);
      const data = await response.json();
      if (data.success) {
        setContentEntries(data.entries);
      }
    } catch (error) {
      console.error('Failed to load content entries:', error);
    }
  };

  const handleCreateContentType = () => {
    setEditingContentType(null);
    setContentTypeBuilderOpen(true);
  };

  const handleEditContentType = (contentType: ContentType) => {
    setEditingContentType(contentType);
    setContentTypeBuilderOpen(true);
  };

  const handleDeleteContentType = async (contentTypeId: string) => {
    if (!confirm('Are you sure you want to delete this content type? All entries will be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/cms/content-types/${contentTypeId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Content type deleted');
        loadContentTypes();
        if (selectedContentType === contentTypeId) {
          setSelectedContentType(null);
        }
      } else {
        toast.error(data.error || 'Failed to delete content type');
      }
    } catch (error) {
      console.error('Failed to delete content type:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleCreateEntry = () => {
    if (!selectedContentType) {
      toast.error('Please select a content type first');
      return;
    }
    setEditingEntry(null);
    setEntryEditorOpen(true);
  };

  const handleEditEntry = (entry: ContentEntry) => {
    setEditingEntry(entry);
    setEntryEditorOpen(true);
  };

  const handleViewEntry = async (entry: ContentEntry) => {
    setViewingEntry(entry);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/cms/entries/${entryId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Entry deleted');
        if (selectedContentType) {
          loadContentEntries(selectedContentType);
        }
      } else {
        toast.error(data.error || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleViewRevisions = async (entryId: string) => {
    try {
      const response = await fetch(`/api/cms/revisions/${entryId}`);
      const data = await response.json();
      if (data.success) {
        setEntryRevisions(data.revisions);
        setRevisionsOpen(true);
      } else {
        toast.error(data.error || 'Failed to load revisions');
      }
    } catch (error) {
      console.error('Failed to load revisions:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleRestoreRevision = async (entryId: string, revisionId: string) => {
    if (!confirm('Are you sure you want to restore this revision? Current data will be replaced.')) {
      return;
    }

    try {
      const response = await fetch(`/api/cms/revisions/${entryId}/restore/${revisionId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Revision restored');
        setRevisionsOpen(false);
        if (selectedContentType) {
          loadContentEntries(selectedContentType);
        }
      } else {
        toast.error(data.error || 'Failed to restore revision');
      }
    } catch (error) {
      console.error('Failed to restore revision:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleContentTypeSuccess = () => {
    loadContentTypes();
  };

  const handleEntrySuccess = () => {
    if (selectedContentType) {
      loadContentEntries(selectedContentType);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading CMS...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Content Management System</h2>
            <p className="text-muted-foreground">Manage your website content</p>
          </div>
          <Button onClick={handleCreateContentType}>
            <Plus className="w-4 h-4 mr-2" />
            New Content Type
          </Button>
        </div>

        <Tabs defaultValue="content-types" className="w-full">
          <TabsList>
            <TabsTrigger value="content-types">Content Types</TabsTrigger>
            <TabsTrigger value="entries">Content Entries</TabsTrigger>
          </TabsList>

          <TabsContent value="content-types" className="space-y-4">
            {contentTypes.length === 0 ? (
              <Card className="p-8 text-center">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Content Types</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first content type to start managing content
                </p>
                <Button onClick={handleCreateContentType}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Content Type
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentTypes.map(type => (
                  <Card
                    key={type.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedContentType === type.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedContentType(type.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">{type.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditContentType(type);
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContentType(type.id);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Slug: {type.slug}</p>
                    <p className="text-xs text-muted-foreground">
                      {type.fields.length} field{type.fields.length !== 1 ? 's' : ''}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="entries" className="space-y-4">
            {!selectedContentType ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Select a content type to view entries</p>
              </Card>
            ) : contentEntries.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Content Entries</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first content entry for this content type
                </p>
                <Button onClick={handleCreateEntry}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Entry
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {contentEntries.length} entr{contentEntries.length !== 1 ? 'ies' : 'y'}
                  </p>
                  <Button onClick={handleCreateEntry}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Entry
                  </Button>
                </div>
                <div className="space-y-2">
                  {contentEntries.map(entry => (
                    <Card key={entry.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              {Object.values(entry.data)[0] || 'Untitled Entry'}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              entry.status === 'published' ? 'bg-green-500/20 text-green-500' :
                              entry.status === 'draft' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-gray-500/20 text-gray-500'
                            }`}>
                              {entry.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Updated: {new Date(entry.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewEntry(entry)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEntry(entry)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewRevisions(entry.id)}
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Content Type Builder Dialog */}
        <ContentTypeBuilder
          websiteId={websiteId}
          contentType={editingContentType}
          open={contentTypeBuilderOpen}
          onOpenChange={setContentTypeBuilderOpen}
          onSuccess={handleContentTypeSuccess}
        />

        {/* Content Entry Editor Dialog */}
        {selectedContentType && (
          <ContentEntryEditor
            websiteId={websiteId}
            contentTypeId={selectedContentType}
            contentType={contentTypes.find(ct => ct.id === selectedContentType) || null}
            entry={editingEntry}
            open={entryEditorOpen}
            onOpenChange={setEntryEditorOpen}
            onSuccess={handleEntrySuccess}
          />
        )}

        {/* View Entry Dialog */}
        <Dialog open={!!viewingEntry} onOpenChange={(open) => !open && setViewingEntry(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Content Entry</DialogTitle>
              <DialogDescription>View entry details</DialogDescription>
            </DialogHeader>
            {viewingEntry && (
              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <p className="text-sm font-medium">{viewingEntry.status}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(viewingEntry.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(viewingEntry.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Data</Label>
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                    {JSON.stringify(viewingEntry.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Revisions Dialog */}
        <Dialog open={revisionsOpen} onOpenChange={setRevisionsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Content Revisions</DialogTitle>
              <DialogDescription>View and restore previous versions</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {entryRevisions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No revisions found</p>
              ) : (
                entryRevisions.map((revision, index) => (
                  <Card key={revision.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Revision #{revision.revisionNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(revision.timestamp).toLocaleString()}
                        </p>
                        {revision.message && (
                          <p className="text-sm text-muted-foreground mt-1">{revision.message}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const entryId = editingEntry?.id || viewingEntry?.id;
                          if (entryId) {
                            handleRestoreRevision(entryId, revision.id);
                          }
                        }}
                      >
                        Restore
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

