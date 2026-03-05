import { openDB, type IDBPDatabase } from 'idb'
import { supabase } from './supabase'

interface QueueEntry {
  id: number
  operation: 'insert' | 'update'
  table: string
  payload: Record<string, unknown>
  filter?: Record<string, unknown>
  localId?: string
  createdAt: number
}

const DB_NAME = 'scrumboard-offline'
const STORE_NAME = 'queue'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        }
      },
    })
  }
  return dbPromise
}

function isNetworkError(err: unknown): boolean {
  if (!navigator.onLine) return true
  if (err instanceof TypeError && err.message.includes('fetch')) return true
  const msg = String((err as { message?: string })?.message ?? '')
  return msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')
}

/**
 * Try a Supabase insert; on network failure, queue it and return an optimistic record.
 */
export async function safeInsert<T extends Record<string, unknown>>(
  table: string,
  payload: T,
): Promise<{ data: T & { id: string }; queued: boolean }> {
  // If clearly offline, skip the network call
  if (navigator.onLine) {
    try {
      const { data, error } = await supabase.from(table).insert(payload).select().single()
      if (error) throw error
      return { data: data as T & { id: string }, queued: false }
    } catch (err) {
      if (!isNetworkError(err)) throw err
      // Fall through to queue
    }
  }

  const localId = `local-${crypto.randomUUID()}`
  const entry: Omit<QueueEntry, 'id'> = {
    operation: 'insert',
    table,
    payload: { ...payload },
    localId,
    createdAt: Date.now(),
  }
  const db = await getDb()
  await db.add(STORE_NAME, entry)

  return {
    data: { ...payload, id: localId } as T & { id: string },
    queued: true,
  }
}

/**
 * Try a Supabase update; on network failure, queue it.
 */
export async function safeUpdate(
  table: string,
  payload: Record<string, unknown>,
  filter: Record<string, unknown>,
): Promise<{ queued: boolean }> {
  if (navigator.onLine) {
    try {
      const query = supabase.from(table).update(payload)
      // Apply filters
      let q = query
      for (const [key, val] of Object.entries(filter)) {
        q = q.eq(key, val) as typeof q
      }
      const { error } = await q
      if (error) throw error
      return { queued: false }
    } catch (err) {
      if (!isNetworkError(err)) throw err
    }
  }

  const db = await getDb()
  // Deduplicate: remove older updates for same table+filter
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  let cursor = await store.openCursor()
  while (cursor) {
    const entry = cursor.value as QueueEntry
    if (
      entry.operation === 'update' &&
      entry.table === table &&
      JSON.stringify(entry.filter) === JSON.stringify(filter)
    ) {
      await cursor.delete()
    }
    cursor = await cursor.continue()
  }
  await tx.done

  const entry: Omit<QueueEntry, 'id'> = {
    operation: 'update',
    table,
    payload,
    filter,
    createdAt: Date.now(),
  }
  await db.add(STORE_NAME, entry)
  return { queued: true }
}

/**
 * Remove a queued insert by its localId.
 */
export async function deleteFromQueue(localId: string): Promise<boolean> {
  const db = await getDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  let cursor = await store.openCursor()
  while (cursor) {
    const entry = cursor.value as QueueEntry
    if (entry.localId === localId) {
      await cursor.delete()
      await tx.done
      return true
    }
    cursor = await cursor.continue()
  }
  await tx.done
  return false
}

/**
 * Drain the offline queue oldest-first. Returns the number of successfully synced entries.
 */
export async function syncQueue(): Promise<number> {
  const db = await getDb()
  const all = (await db.getAll(STORE_NAME)) as QueueEntry[]
  if (all.length === 0) return 0

  // Sort oldest first
  all.sort((a, b) => a.createdAt - b.createdAt)

  let synced = 0
  for (const entry of all) {
    try {
      if (entry.operation === 'insert') {
        const { error } = await supabase.from(entry.table).insert(entry.payload)
        if (error) throw error
      } else {
        let query = supabase.from(entry.table).update(entry.payload)
        for (const [key, val] of Object.entries(entry.filter ?? {})) {
          query = query.eq(key, val) as typeof query
        }
        const { error } = await query
        if (error) throw error
      }
      await db.delete(STORE_NAME, entry.id)
      synced++
    } catch {
      // Stop on first failure — likely still offline
      break
    }
  }
  return synced
}

/**
 * Return count of pending entries.
 */
export async function getPendingCount(): Promise<number> {
  const db = await getDb()
  return db.count(STORE_NAME)
}
