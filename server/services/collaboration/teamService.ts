/**
 * Team Service
 * Phase 3.4: Collaboration Features - Team account management
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  invitedAt: Date;
  joinedAt?: Date;
  status: 'pending' | 'active' | 'suspended';
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: TeamMember[];
  settings: {
    allowMemberInvites: boolean;
    maxMembers: number;
    billingEmail?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get teams directory
 */
function getTeamsDir(): string {
  const teamsDir = path.join(process.cwd(), 'teams');
  
  if (!fs.existsSync(teamsDir)) {
    fs.mkdirSync(teamsDir, { recursive: true });
  }
  
  return teamsDir;
}

/**
 * Team Management
 */

export async function getTeam(teamId: string): Promise<Team | null> {
  const teamsDir = getTeamsDir();
  const teamPath = path.join(teamsDir, `${teamId}.json`);
  
  if (!fs.existsSync(teamPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(teamPath, 'utf-8');
    const team: Team = JSON.parse(content);
    return {
      ...team,
      createdAt: new Date(team.createdAt),
      updatedAt: new Date(team.updatedAt),
      members: team.members.map(m => ({
        ...m,
        invitedAt: new Date(m.invitedAt),
        joinedAt: m.joinedAt ? new Date(m.joinedAt) : undefined,
      })),
    };
  } catch (error) {
    console.error(`[Team Service] Failed to load team ${teamId}:`, error);
    return null;
  }
}

export async function saveTeam(team: Team): Promise<void> {
  const teamsDir = getTeamsDir();
  const teamPath = path.join(teamsDir, `${team.id}.json`);
  
  fs.writeFileSync(teamPath, JSON.stringify(team, null, 2), 'utf-8');
  console.log(`[Team Service] Saved team: ${team.name} (${team.id})`);
}

export async function createTeam(name: string, ownerId: string, ownerEmail: string): Promise<Team> {
  const team: Team = {
    id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    ownerId,
    members: [{
      id: ownerId,
      email: ownerEmail,
      role: 'owner',
      invitedAt: new Date(),
      joinedAt: new Date(),
      status: 'active',
    }],
    settings: {
      allowMemberInvites: true,
      maxMembers: 10,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await saveTeam(team);
  return team;
}

export async function inviteMember(
  teamId: string,
  email: string,
  role: TeamMember['role'],
  inviterId: string
): Promise<TeamMember> {
  const team = await getTeam(teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  
  // Check if member already exists
  const existing = team.members.find(m => m.email === email);
  if (existing) {
    throw new Error('Member already in team');
  }
  
  // Check member limit
  if (team.members.length >= team.settings.maxMembers) {
    throw new Error('Team member limit reached');
  }
  
  const member: TeamMember = {
    id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    role,
    invitedAt: new Date(),
    status: 'pending',
  };
  
  team.members.push(member);
  team.updatedAt = new Date();
  await saveTeam(team);
  
  return member;
}

export async function updateMemberRole(
  teamId: string,
  memberId: string,
  role: TeamMember['role'],
  updaterId: string
): Promise<void> {
  const team = await getTeam(teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  
  const member = team.members.find(m => m.id === memberId);
  if (!member) {
    throw new Error('Member not found');
  }
  
  // Don't allow changing owner role
  if (member.role === 'owner' && role !== 'owner') {
    throw new Error('Cannot change owner role');
  }
  
  member.role = role;
  team.updatedAt = new Date();
  await saveTeam(team);
}

export async function removeMember(teamId: string, memberId: string, removerId: string): Promise<void> {
  const team = await getTeam(teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  
  const member = team.members.find(m => m.id === memberId);
  if (!member) {
    throw new Error('Member not found');
  }
  
  // Don't allow removing owner
  if (member.role === 'owner') {
    throw new Error('Cannot remove team owner');
  }
  
  team.members = team.members.filter(m => m.id !== memberId);
  team.updatedAt = new Date();
  await saveTeam(team);
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  const teamsDir = getTeamsDir();
  const teams: Team[] = [];
  
  if (!fs.existsSync(teamsDir)) {
    return [];
  }
  
  const files = fs.readdirSync(teamsDir);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      try {
        const content = fs.readFileSync(path.join(teamsDir, file), 'utf-8');
        const team: Team = JSON.parse(content);
        
        // Check if user is a member
        const isMember = team.members.some(m => m.id === userId || m.email === userId);
        if (isMember) {
          teams.push({
            ...team,
            createdAt: new Date(team.createdAt),
            updatedAt: new Date(team.updatedAt),
            members: team.members.map(m => ({
              ...m,
              invitedAt: new Date(m.invitedAt),
              joinedAt: m.joinedAt ? new Date(m.joinedAt) : undefined,
            })),
          });
        }
      } catch (error) {
        console.error(`[Team Service] Failed to load team from ${file}:`, error);
      }
    }
  }
  
  return teams;
}

