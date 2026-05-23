const DB_NAME = "giophim-offline";
const DB_VERSION = 4;
const STORE_MOVIES = "movies";
const STORE_SEGMENTS = "segments";
const STORE_KEYS = "keys";
const STORE_POSTERS = "posters";

export interface OfflineMovieRecord {
  episodeId: number;
  movieId: number;
  movieSlug: string;
  movieTitle: string;
  episodeTitle?: string;
  episodeNumber?: number;
  posterUrl?: string;
  quality: string;
  durationSeconds: number;
  segmentUrls: string[];
  downloadedAt: string;
  expiresAt: string;
  sizeBytes: number;
}

export interface OfflineSegmentRecord {
  url: string;
  data: ArrayBuffer;
}

export interface OfflineKeyRecord {
  id: string;
  episodeId: number;
  quality: string;
  keyData: ArrayBuffer;
}

export interface OfflinePosterRecord {
  episodeId: number;
  contentType: string;
  data: ArrayBuffer;
}

function normalizeQuality(quality?: string): string {
  const q = String(quality || "720p")
    .trim()
    .toUpperCase();

  if (q === "4K" || q === "2160P" || q === "UHD") return "4K";
  if (q === "1080P" || q === "FHD" || q === "FULL_HD") return "1080p";

  return "720p";
}

function keyId(episodeId: number, quality?: string): string {
  return `${episodeId}:${normalizeQuality(quality)}`;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      const oldVersion = e.oldVersion;

      if (!db.objectStoreNames.contains(STORE_MOVIES)) {
        db.createObjectStore(STORE_MOVIES, { keyPath: "episodeId" });
      }

      if (!db.objectStoreNames.contains(STORE_SEGMENTS)) {
        db.createObjectStore(STORE_SEGMENTS, { keyPath: "url" });
      }

      if (oldVersion < 4) {
        if (db.objectStoreNames.contains(STORE_KEYS)) {
          db.deleteObjectStore(STORE_KEYS);
        }
        db.createObjectStore(STORE_KEYS, { keyPath: "id" });
      } else if (!db.objectStoreNames.contains(STORE_KEYS)) {
        db.createObjectStore(STORE_KEYS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORE_POSTERS)) {
        db.createObjectStore(STORE_POSTERS, { keyPath: "episodeId" });
      }

      if (!db.objectStoreNames.contains("pending-history")) {
        db.createObjectStore("pending-history", { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet<T>(db: IDBDatabase, store: string, key: IDBValidKey): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db: IDBDatabase, store: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const req = tx.objectStore(store).put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function idbDelete(db: IDBDatabase, store: string, key: IDBValidKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const req = tx.objectStore(store).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function idbGetAll<T>(db: IDBDatabase, store: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

export const offlineStorage = {
  async saveMovie(record: OfflineMovieRecord): Promise<void> {
    const db = await openDB();
    await idbPut(db, STORE_MOVIES, record);
  },

  async getMovie(episodeId: number): Promise<OfflineMovieRecord | undefined> {
    const db = await openDB();
    return idbGet<OfflineMovieRecord>(db, STORE_MOVIES, episodeId);
  },

  async listMovies(): Promise<OfflineMovieRecord[]> {
    const db = await openDB();
    return idbGetAll<OfflineMovieRecord>(db, STORE_MOVIES);
  },

  async deleteMovie(episodeId: number): Promise<void> {
    const db = await openDB();
    const record = await idbGet<OfflineMovieRecord>(db, STORE_MOVIES, episodeId);
    if (record) {
      for (const url of record.segmentUrls) {
        await idbDelete(db, STORE_SEGMENTS, url).catch(() => {});
      }
    }
    await idbDelete(db, STORE_MOVIES, episodeId);
    await idbDelete(db, STORE_KEYS, keyId(episodeId, "720p")).catch(() => {});
    await idbDelete(db, STORE_KEYS, keyId(episodeId, "1080p")).catch(() => {});
    await idbDelete(db, STORE_KEYS, keyId(episodeId, "4K")).catch(() => {});
    await idbDelete(db, STORE_KEYS, episodeId).catch(() => {});
    await idbDelete(db, STORE_POSTERS, episodeId).catch(() => {});
  },

  async saveSegment(url: string, data: ArrayBuffer): Promise<void> {
    const db = await openDB();
    await idbPut(db, STORE_SEGMENTS, { url, data });
  },

  async getSegment(url: string): Promise<ArrayBuffer | undefined> {
    const db = await openDB();
    const rec = await idbGet<OfflineSegmentRecord>(db, STORE_SEGMENTS, url);
    return rec?.data;
  },

  async saveKey(episodeId: number, quality: string, keyData: ArrayBuffer): Promise<void> {
    const db = await openDB();
    const normalizedQuality = normalizeQuality(quality);

    await idbPut(db, STORE_KEYS, {
      id: keyId(episodeId, normalizedQuality),
      episodeId,
      quality: normalizedQuality,
      keyData,
    });
  },

  async getKey(episodeId: number, quality?: string): Promise<OfflineKeyRecord | undefined> {
    const db = await openDB();

    const rec = await idbGet<OfflineKeyRecord>(db, STORE_KEYS, keyId(episodeId, quality));
    if (rec) return rec;

    return idbGet<OfflineKeyRecord>(db, STORE_KEYS, episodeId).catch(() => undefined);
  },

  async savePoster(episodeId: number, contentType: string, data: ArrayBuffer): Promise<void> {
    const db = await openDB();
    await idbPut(db, STORE_POSTERS, { episodeId, contentType, data });
  },

  async getPoster(episodeId: number): Promise<OfflinePosterRecord | undefined> {
    const db = await openDB();
    return idbGet<OfflinePosterRecord>(db, STORE_POSTERS, episodeId);
  },

  async isDownloaded(episodeId: number): Promise<boolean> {
    const db = await openDB();
    const rec = await idbGet<OfflineMovieRecord>(db, STORE_MOVIES, episodeId);
    if (!rec) return false;
    if (new Date(rec.expiresAt) < new Date()) {
      await this.deleteMovie(episodeId);
      return false;
    }
    return true;
  },

  async getTotalSize(): Promise<number> {
    const db = await openDB();
    const movies = await idbGetAll<OfflineMovieRecord>(db, STORE_MOVIES);
    return movies.reduce((sum, m) => sum + (m.sizeBytes || 0), 0);
  },
};
