import CNF from '../conf.js';

let DB = null;
let DB_NAME = 'STORE_DB';
let DB_VERSION = 1;
let STORE_NAME = 'COMMON';

let IDB = {
    INIT: async () => {
        if (DB) return DB;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                reject(new Error('Database açılamadı'));
            };

            request.onsuccess = (event) => {
                DB = event.target.result;
                resolve(DB);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    },

    SET: async (key, value) => {
        await IDB.INIT();

        const data = {
            key: key,
            value: value,
            timestamp: new Date()
        };

        return new Promise((resolve, reject) => {
            const transaction = DB.transaction([STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.put(data);

            request.onsuccess = () => resolve(true);
            request.onerror = () => {
                console.error('Veri kaydedilemedi:', request.error);
                reject(false);
            };
        });
    },

    GET: async (key) => {
        await IDB.INIT();

        return new Promise((resolve, reject) => {
            const transaction = DB.transaction([STORE_NAME], 'readonly');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.get(key);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };

            request.onerror = () => reject(request.error);
        });
    },

    REMOVE: async (key) => {
        await IDB.INIT();

        return new Promise((resolve, reject) => {
            const transaction = DB.transaction([STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    },

    CLEAR: async () => {
        await IDB.INIT();

        return new Promise((resolve, reject) => {
            const transaction = DB.transaction([STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    },

    HAS: async (key) => {
        await IDB.INIT();

        return new Promise((resolve, reject) => {
            const transaction = DB.transaction([STORE_NAME], 'readonly');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.count(key);

            request.onsuccess = () => resolve(request.result > 0);
            request.onerror = () => reject(request.error);
        });
    },

    KEYS: async () => {
        await IDB.INIT();

        return new Promise((resolve, reject) => {
            const transaction = DB.transaction([STORE_NAME], 'readonly');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.getAllKeys();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    SIZE: async () => {
        await IDB.INIT();

        return new Promise((resolve, reject) => {
            const transaction = DB.transaction([STORE_NAME], 'readonly');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    GET_STORAGE_INFO: async () => {
        const count = await IDB.SIZE();

        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                const persistent = await navigator.storage.persisted();

                return {
                    used: estimate.usage || 0,
                    estimated: estimate.quota || 0,
                    usage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100,
                    count: count,
                    persistent: persistent
                };
            } catch (e) {
                console.error('Storage estimate hatası:', e);
            }
        }

        return {
            used: 'N/A',
            estimated: 'N/A',
            usage: 'N/A',
            count: count,
            persistent: false
        };
    },

    CLOSE: () => {
        if (DB) {
            DB.close();
            DB = null;
        }
    }
};
export default IDB;


if (globalThis.NCORE) {
    if (!globalThis.NCORE.IDB) {
        globalThis.NCORE.IDB = IDB;
    }
}