/**
 * Operational Transform Service
 * Handles conflict resolution for concurrent edits using operational transformation
 */

export interface Operation {
  type: 'insert' | 'delete' | 'retain';
  content?: string;
  length: number;
  position: number;
}

export interface Change {
  operations: Operation[];
  version: number;
  userId: string;
  timestamp: number;
}

class OperationalTransformService {
  /**
   * Transform operation against another operation
   * Returns transformed operation that can be applied after the other
   */
  transform(op1: Operation, op2: Operation, priority: 'left' | 'right' = 'left'): Operation {
    // Simple transformation logic
    // In production, use a proper OT algorithm like OT.js or ShareJS

    if (op1.type === 'retain' && op2.type === 'retain') {
      return { ...op1 };
    }

    if (op1.type === 'insert' && op2.type === 'insert') {
      // Both inserting - priority determines order
      if (priority === 'left') {
        return { ...op1, position: op1.position + op2.length };
      } else {
        return { ...op1 };
      }
    }

    if (op1.type === 'delete' && op2.type === 'delete') {
      // Both deleting - adjust positions
      if (op1.position < op2.position) {
        return { ...op1 };
      } else {
        return { ...op1, position: op1.position - op2.length };
      }
    }

    if (op1.type === 'insert' && op2.type === 'delete') {
      if (op1.position <= op2.position) {
        return { ...op1 };
      } else {
        return { ...op1, position: op1.position - op2.length };
      }
    }

    if (op1.type === 'delete' && op2.type === 'insert') {
      if (op1.position < op2.position) {
        return { ...op1 };
      } else {
        return { ...op1, position: op1.position + op2.length };
      }
    }

    return op1;
  }

  /**
   * Apply operation to content
   */
  apply(content: string, operation: Operation): string {
    if (operation.type === 'retain') {
      return content;
    }

    if (operation.type === 'insert' && operation.content) {
      const before = content.slice(0, operation.position);
      const after = content.slice(operation.position);
      return before + operation.content + after;
    }

    if (operation.type === 'delete') {
      const before = content.slice(0, operation.position);
      const after = content.slice(operation.position + operation.length);
      return before + after;
    }

    return content;
  }

  /**
   * Transform change against another change
   */
  transformChange(change1: Change, change2: Change): Change {
    const transformedOps = change1.operations.map(op =>
      change2.operations.reduce((acc, op2) => this.transform(acc, op2), op)
    );

    return {
      ...change1,
      operations: transformedOps,
      version: Math.max(change1.version, change2.version) + 1,
    };
  }

  /**
   * Compose multiple changes into one
   */
  compose(changes: Change[]): Change {
    if (changes.length === 0) {
      throw new Error('Cannot compose empty changes');
    }

    if (changes.length === 1) {
      return changes[0];
    }

    let result = changes[0];
    for (let i = 1; i < changes.length; i++) {
      result = this.transformChange(result, changes[i]);
    }

    return result;
  }
}

export const operationalTransformService = new OperationalTransformService();

