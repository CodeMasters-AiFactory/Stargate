/**
 * Collaboration Screen
 * Phase 3.4: Collaboration Features - Main screen for team management and collaboration
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, History, UserPlus, MessageSquare } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CursorTracker } from './CursorTracker';
import { CommentsPanel } from './CommentsPanel';
import { UserPresenceIndicator } from './UserPresenceIndicator';

export function CollaborationScreen() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentWebsiteId, setCurrentWebsiteId] = useState<string>('default');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Fetch teams
  const loadTeams = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/collaboration/teams');
      const data = await response.json();
      if (data.success) {
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 relative">
      {/* Cursor Tracker */}
      {currentRoomId && user && (
        <CursorTracker
          roomId={currentRoomId}
          userId={user.id || 'anonymous'}
          userName={user.username || 'Anonymous'}
          avatar={user.avatar}
          containerRef={canvasRef}
        />
      )}

      {/* Comments Panel */}
      <CommentsPanel
        websiteId={currentWebsiteId}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
      />

      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Collaboration
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage teams, roles, and version control
            </p>
          </div>
          <div className="flex items-center gap-2">
            {currentRoomId && (
              <>
                <UserPresenceIndicator
                  roomId={currentRoomId}
                  currentUserId={user?.id || 'anonymous'}
                />
                <Button
                  variant={commentsOpen ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCommentsOpen(!commentsOpen)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments
                </Button>
              </>
            )}
            <Button
              onClick={() => toast({
                title: 'Create Team',
                description: 'Team creation interface coming soon.',
              })}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Create Team
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-3 mb-6">
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Version Control
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Teams</CardTitle>
                <CardDescription>
                  Manage your teams and collaborate on projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading teams...</p>
                ) : teams.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">You're not part of any teams yet.</p>
                    <Button onClick={() => toast({
                      title: 'Create Team',
                      description: 'Team creation interface coming soon.',
                    })}>
                      Create Your First Team
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teams.map((team) => (
                      <Card key={team.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{team.name}</h3>
                            <p className="text-sm text-muted-foreground">{team.description}</p>
                          </div>
                          <Badge>{team.members?.length || 0} members</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Roles & Permissions</CardTitle>
                <CardDescription>
                  Configure role-based access control for your teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">RBAC configuration interface coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Version Control</CardTitle>
                <CardDescription>
                  View and manage project version history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Version control interface coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

