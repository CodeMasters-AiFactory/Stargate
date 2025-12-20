/**
 * CMS Service
 * Complete content management system with dynamic content types and entries
 */

import { db } from '../db';
import {
  contentTypes,
  contentEntries,
  contentRelations,
  contentRevisions,
  type InsertContentType,
  type InsertContentEntry,
  type InsertContentRelation,
  type InsertContentRevision,
} from '@shared/schema';
import { eq, and, desc, asc, inArray, gte, lte, or, like } from 'drizzle-orm';

/**
 * Content Type Management
 */

export interface ContentTypeField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'richtext' | 'image' | 'file' | 'relation' | 'repeater';
  required?: boolean;
  defaultValue?: any;
  options?: any; // Field-specific options
  validation?: any; // Validation rules
}

export async function createContentType(
  websiteId: string,
  name: string,
  fields: ContentTypeField[]
): Promise<string> {
  if (!db) {
    throw new Error('Database not available');
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const [contentType] = await db
    .insert(contentTypes)
    .values({
      websiteId,
      name,
      slug,
      fields,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return contentType.id;
}

export async function getContentTypes(websiteId: string): Promise<typeof contentTypes.$inferSelect[]> {
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(contentTypes)
    .where(eq(contentTypes.websiteId, websiteId))
    .orderBy(asc(contentTypes.name));
}

export async function getContentTypeById(contentTypeId: string): Promise<typeof contentTypes.$inferSelect | null> {
  if (!db) {
    return null;
  }

  const [contentType] = await db
    .select()
    .from(contentTypes)
    .where(eq(contentTypes.id, contentTypeId))
    .limit(1);

  return contentType || null;
}

export async function updateContentType(
  contentTypeId: string,
  updates: Partial<InsertContentType>
): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    await db
      .update(contentTypes)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(contentTypes.id, contentTypeId));
    return true;
  } catch (error) {
    console.error('[CMSService] Update contentType error:', error);
    return false;
  }
}

export async function deleteContentType(contentTypeId: string): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    await db.delete(contentTypes).where(eq(contentTypes.id, contentTypeId));
    return true;
  } catch (error) {
    console.error('[CMSService] Delete contentType error:', error);
    return false;
  }
}

/**
 * Content Entry Management
 */

export async function createContentEntry(
  contentTypeId: string,
  websiteId: string,
  data: Record<string, any>,
  status: 'draft' | 'published' | 'archived' = 'draft',
  publishedAt?: Date
): Promise<string> {
  if (!db) {
    throw new Error('Database not available');
  }

  const [entry] = await db
    .insert(contentEntries)
    .values({
      contentTypeId,
      websiteId,
      data,
      status,
      publishedAt: publishedAt || (status === 'published' ? new Date() : null),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Create initial revision
  await createContentRevision(entry.id, data);

  return entry.id;
}

export async function getContentEntries(
  websiteId: string,
  filters: {
    contentTypeId?: string;
    status?: 'draft' | 'published' | 'archived';
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<typeof contentEntries.$inferSelect[]> {
  if (!db) {
    return [];
  }

  let query = db
    .select()
    .from(contentEntries)
    .where(eq(contentEntries.websiteId, websiteId));

  if (filters.contentTypeId) {
    query = query.where(eq(contentEntries.contentTypeId, filters.contentTypeId));
  }

  if (filters.status) {
    query = query.where(eq(contentEntries.status, filters.status));
  }

  if (filters.search) {
    // Search in JSONB data - simplified for now
    // In production, use proper JSONB search
    query = query.where(
      // This is a placeholder - actual JSONB search would be more complex
      like(contentEntries.data as any, `%${filters.search}%`)
    );
  }

  query = query.orderBy(desc(contentEntries.createdAt));

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}

export async function getContentEntry(entryId: string): Promise<typeof contentEntries.$inferSelect | null> {
  if (!db) {
    return null;
  }

  const [entry] = await db
    .select()
    .from(contentEntries)
    .where(eq(contentEntries.id, entryId))
    .limit(1);

  return entry || null;
}

export async function updateContentEntry(
  entryId: string,
  updates: Partial<InsertContentEntry>
): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    // Get current entry to create revision
    const currentEntry = await getContentEntry(entryId);
    if (currentEntry) {
      await createContentRevision(entryId, currentEntry.data as Record<string, any>);
    }

    await db
      .update(contentEntries)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(contentEntries.id, entryId));
    return true;
  } catch (error) {
    console.error('[CMSService] Update entry error:', error);
    return false;
  }
}

export async function deleteContentEntry(entryId: string): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    await db.delete(contentEntries).where(eq(contentEntries.id, entryId));
    return true;
  } catch (error) {
    console.error('[CMSService] Delete entry error:', error);
    return false;
  }
}

/**
 * Content Relationships
 */

export async function createContentRelation(
  entryId: string,
  relatedEntryId: string,
  relationType: 'one-to-one' | 'one-to-many' | 'many-to-many'
): Promise<string> {
  if (!db) {
    throw new Error('Database not available');
  }

  const [relation] = await db
    .insert(contentRelations)
    .values({
      entryId,
      relatedEntryId,
      relationType,
      createdAt: new Date(),
    })
    .returning();

  return relation.id;
}

export async function getContentRelations(entryId: string): Promise<typeof contentRelations.$inferSelect[]> {
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(contentRelations)
    .where(eq(contentRelations.entryId, entryId));
}

export async function deleteContentRelation(relationId: string): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    await db.delete(contentRelations).where(eq(contentRelations.id, relationId));
    return true;
  } catch (error) {
    console.error('[CMSService] Delete relation error:', error);
    return false;
  }
}

/**
 * Content Versioning
 */

export async function createContentRevision(
  entryId: string,
  data: Record<string, any>,
  createdBy?: string
): Promise<string> {
  if (!db) {
    throw new Error('Database not available');
  }

  const [revision] = await db
    .insert(contentRevisions)
    .values({
      entryId,
      data,
      createdAt: new Date(),
      createdBy,
    })
    .returning();

  return revision.id;
}

export async function getContentRevisions(entryId: string): Promise<typeof contentRevisions.$inferSelect[]> {
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(contentRevisions)
    .where(eq(contentRevisions.entryId, entryId))
    .orderBy(desc(contentRevisions.createdAt));
}

export async function getContentRevision(revisionId: string): Promise<typeof contentRevisions.$inferSelect | null> {
  if (!db) {
    return null;
  }

  const [revision] = await db
    .select()
    .from(contentRevisions)
    .where(eq(contentRevisions.id, revisionId))
    .limit(1);

  return revision || null;
}

export async function restoreContentRevision(entryId: string, revisionId: string): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    const revision = await getContentRevision(revisionId);
    if (!revision) {
      return false;
    }

    await updateContentEntry(entryId, {
      data: revision.data as Record<string, any>,
    });

    return true;
  } catch (error) {
    console.error('[CMSService] Restore revision error:', error);
    return false;
  }
}

