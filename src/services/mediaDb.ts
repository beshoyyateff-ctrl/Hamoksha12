/**
 * Persistent IndexedDB Media Storage Service
 * Stores uploaded video/image Blobs safely beyond localStorage's ~5MB limit
 * so uploaded videos & high-res photos remain available across page reloads.
 */

const DB_NAME = 'hamoksha_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

// Cache resolved ObjectURLs in memory during active session
const objectUrlCache = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB غير مدعوم في هذا المتصفح'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('تعذر فتح قاعدة بيانات الوسائط'));
  });
}

export const IDB_PREFIX = 'idb://';

export function isIdbUri(uri?: string): boolean {
  return Boolean(uri && uri.startsWith(IDB_PREFIX));
}

export interface StoredMediaRecord {
  id: string;
  blob: Blob;
  mimeType: string;
  name?: string;
  createdAt: number;
}

export const MediaDB = {
  /**
   * Saves a File or Blob to IndexedDB and returns a permanent `idb://...` reference URI
   */
  async saveBlob(blob: Blob, name?: string): Promise<string> {
    const id = `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const db = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: StoredMediaRecord = {
        id,
        blob,
        mimeType: blob.type || 'application/octet-stream',
        name,
        createdAt: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error('فشل حفظ الملف في قاعدة البيانات'));
    });

    const objectUrl = URL.createObjectURL(blob);
    objectUrlCache.set(id, objectUrl);

    return `${IDB_PREFIX}${id}`;
  },

  /**
   * Retrieves a usable URL for an `idb://` reference URI (or passes normal URLs straight through)
   */
  async resolveUri(uri?: string): Promise<string> {
    if (!uri) return '';
    if (!isIdbUri(uri)) return uri;

    const id = uri.slice(IDB_PREFIX.length);
    const cached = objectUrlCache.get(id);
    if (cached) return cached;

    try {
      const db = await openDatabase();
      const record = await new Promise<StoredMediaRecord | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result as StoredMediaRecord | undefined);
        req.onerror = () => reject(req.error);
      });

      if (!record || !record.blob) return '';
      const objectUrl = URL.createObjectURL(record.blob);
      objectUrlCache.set(id, objectUrl);
      return objectUrl;
    } catch (err) {
      console.error('MediaDB.resolveUri error:', err);
      return '';
    }
  },

  /**
   * Deletes a media entry from IndexedDB
   */
  async deleteUri(uri?: string): Promise<void> {
    if (!uri || !isIdbUri(uri)) return;
    const id = uri.slice(IDB_PREFIX.length);

    const cached = objectUrlCache.get(id);
    if (cached) {
      URL.revokeObjectURL(cached);
      objectUrlCache.delete(id);
    }

    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error('MediaDB.deleteUri error:', err);
    }
  },
};
