export interface CollaborationUser {
  id: string;
  username: string;
  avatar?: string;
  color: string;
  isActive: boolean;
  cursor?: CursorPosition;
  selection?: Selection;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface Selection {
  start: CursorPosition;
  end: CursorPosition;
}

export interface CollaborationMessage {
  type: 'cursor' | 'edit' | 'selection' | 'presence';
  projectId: string;
  userId: string;
  data: any;
}

export interface EditOperation {
  type: 'insert' | 'delete' | 'replace';
  position: CursorPosition;
  content?: string;
  length?: number;
}

export interface PresenceData {
  action: 'joined' | 'left' | 'typing' | 'idle';
  timestamp: string;
  file?: string;
}
