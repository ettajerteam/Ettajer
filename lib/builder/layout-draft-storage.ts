/**
 * Persist unpublished layout drafts.
 * Prefer IndexedDB for capacity; keep a localStorage pointer for cross-tab events.
 */

import type { HomeLayout } from "@/lib/sections/types";
import type { PageLayoutKey } from "@/lib/page-layout";
import type { StoreThemeSettings } from "@/types/storefront";
import type { NavItem } from "@/lib/navigation";

const STORAGE_PREFIX = "ettajer:editor-layout-draft:";
const POINTER_PREFIX = "ettajer:editor-layout-draft-ptr:";
const TAB_ID_KEY = "ettajer:editor-tab-id";
const IDB_NAME = "ettajer-editor-drafts";
const IDB_STORE = "layout-drafts";
const IDB_VERSION = 1;

export type LayoutDraftBundle = {
  updatedAt: number;
  layouts: Partial<Record<PageLayoutKey, HomeLayout>>;
  theme?: StoreThemeSettings;
  navigation?: NavItem[];
  activePageKey?: string;
  tabId?: string;
};

export type SaveDraftResult = "saved" | "cleared" | "error";

function storageKey(storeId: string): string {
  return `${STORAGE_PREFIX}${storeId}`;
}

function pointerKey(storeId: string): string {
  return `${POINTER_PREFIX}${storeId}`;
}

export function getEditorTabId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = window.sessionStorage.getItem(TAB_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      window.sessionStorage.setItem(TAB_ID_KEY, id);
    }
    return id;
  } catch {
    return `tab-${Date.now().toString(36)}`;
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

async function idbGet(storeId: string): Promise<LayoutDraftBundle | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(storeId);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const value = req.result as LayoutDraftBundle | undefined;
        resolve(value && typeof value.updatedAt === "number" ? value : null);
      };
    });
  } catch {
    return null;
  }
}

async function idbSet(storeId: string, bundle: LayoutDraftBundle): Promise<boolean> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(IDB_STORE).put(bundle, storeId);
    });
    return true;
  } catch {
    return false;
  }
}

async function idbDelete(storeId: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(IDB_STORE).delete(storeId);
    });
  } catch {
    // ignore
  }
}

function writePointer(storeId: string, bundle: LayoutDraftBundle | null): void {
  try {
    if (!bundle) {
      window.localStorage.removeItem(pointerKey(storeId));
      return;
    }
    window.localStorage.setItem(
      pointerKey(storeId),
      JSON.stringify({ updatedAt: bundle.updatedAt, tabId: bundle.tabId })
    );
  } catch {
    // ignore pointer failures
  }
}

function loadFromLocalStorage(storeId: string): LayoutDraftBundle | null {
  try {
    const raw = window.localStorage.getItem(storageKey(storeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LayoutDraftBundle;
    if (!parsed || typeof parsed.updatedAt !== "number" || !parsed.layouts) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Sync load for restore dialog (legacy localStorage). Prefer loadLayoutDraftsAsync. */
export function loadLayoutDrafts(storeId: string): LayoutDraftBundle | null {
  if (typeof window === "undefined" || !storeId) return null;
  return loadFromLocalStorage(storeId);
}

export async function loadLayoutDraftsAsync(storeId: string): Promise<LayoutDraftBundle | null> {
  if (typeof window === "undefined" || !storeId) return null;
  const fromIdb = await idbGet(storeId);
  if (fromIdb) return fromIdb;
  const legacy = loadFromLocalStorage(storeId);
  if (legacy) {
    await idbSet(storeId, legacy);
    try {
      window.localStorage.removeItem(storageKey(storeId));
    } catch {
      // ignore
    }
    writePointer(storeId, legacy);
  }
  return legacy;
}

export function saveLayoutDrafts(
  storeId: string,
  layouts: Partial<Record<PageLayoutKey, HomeLayout>>,
  extras?: {
    theme?: StoreThemeSettings;
    navigation?: NavItem[];
    activePageKey?: string;
  }
): SaveDraftResult {
  if (typeof window === "undefined" || !storeId) return "error";
  try {
    if (Object.keys(layouts).length === 0 && !extras?.theme && !extras?.navigation) {
      void clearLayoutDraftsAsync(storeId);
      return "cleared";
    }
    const bundle: LayoutDraftBundle = {
      updatedAt: Date.now(),
      layouts,
      tabId: getEditorTabId(),
      ...(extras?.theme ? { theme: extras.theme } : {}),
      ...(extras?.navigation ? { navigation: extras.navigation } : {}),
      ...(extras?.activePageKey ? { activePageKey: extras.activePageKey } : {}),
    };

    void (async () => {
      const ok = await idbSet(storeId, bundle);
      if (!ok) {
        try {
          window.localStorage.setItem(storageKey(storeId), JSON.stringify(bundle));
        } catch {
          // quota
        }
      } else {
        try {
          window.localStorage.removeItem(storageKey(storeId));
        } catch {
          // ignore
        }
      }
      writePointer(storeId, bundle);
    })();

    writePointer(storeId, bundle);
    return "saved";
  } catch {
    return "error";
  }
}

export async function saveLayoutDraftsAsync(
  storeId: string,
  layouts: Partial<Record<PageLayoutKey, HomeLayout>>,
  extras?: {
    theme?: StoreThemeSettings;
    navigation?: NavItem[];
    activePageKey?: string;
  }
): Promise<SaveDraftResult> {
  if (typeof window === "undefined" || !storeId) return "error";
  try {
    if (Object.keys(layouts).length === 0 && !extras?.theme && !extras?.navigation) {
      await clearLayoutDraftsAsync(storeId);
      return "cleared";
    }
    const bundle: LayoutDraftBundle = {
      updatedAt: Date.now(),
      layouts,
      tabId: getEditorTabId(),
      ...(extras?.theme ? { theme: extras.theme } : {}),
      ...(extras?.navigation ? { navigation: extras.navigation } : {}),
      ...(extras?.activePageKey ? { activePageKey: extras.activePageKey } : {}),
    };
    const ok = await idbSet(storeId, bundle);
    if (!ok) {
      try {
        window.localStorage.setItem(storageKey(storeId), JSON.stringify(bundle));
      } catch {
        return "error";
      }
    } else {
      try {
        window.localStorage.removeItem(storageKey(storeId));
      } catch {
        // ignore
      }
    }
    writePointer(storeId, bundle);
    return "saved";
  } catch {
    return "error";
  }
}

export function clearLayoutDrafts(storeId: string): void {
  if (typeof window === "undefined" || !storeId) return;
  try {
    window.localStorage.removeItem(storageKey(storeId));
    writePointer(storeId, null);
  } catch {
    // ignore
  }
  void idbDelete(storeId);
}

export async function clearLayoutDraftsAsync(storeId: string): Promise<void> {
  clearLayoutDrafts(storeId);
  await idbDelete(storeId);
}

export function getLayoutDraftStorageKey(storeId: string): string {
  return pointerKey(storeId);
}
