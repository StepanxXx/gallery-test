'use strict';

const DB_NAME = 'gallery-cache';
const DB_VERSION = 1;
const IMAGE_ASSET_STORE = 'image-assets';
const CACHE_TTL = 24 * 60 * 60 * 1000;

let databasePromise;

function openDatabase() {
  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(IMAGE_ASSET_STORE)) {
        database.createObjectStore(IMAGE_ASSET_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return databasePromise;
}

async function withStore(storeName, mode, callback) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    let result;

    transaction.oncomplete = () => {
      resolve(result);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };

    transaction.onabort = () => {
      reject(transaction.error);
    };

    result = callback(store);
  });
}

function isExpired(timestamp) {
  return Date.now() - timestamp > CACHE_TTL;
}

async function getRecord(storeName, key) {
  const record = await withStore(storeName, 'readonly', store => {
    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  });

  if (!record) {
    return null;
  }

  if (isExpired(record.timestamp)) {
    await deleteRecord(storeName, key);
    return null;
  }

  return record;
}

async function putRecord(storeName, key, value) {
  await withStore(storeName, 'readwrite', store => {
    store.put({
      key,
      timestamp: Date.now(),
      value,
    });
  });
}

async function deleteRecord(storeName, key) {
  await withStore(storeName, 'readwrite', store => {
    store.delete(key);
  });
}

async function getCachedImageBlob(key) {
  try {
    const record = await getRecord(IMAGE_ASSET_STORE, key);
    return record?.value ?? null;
  } catch (error) {
    console.warn('Unable to read cached image asset:', error);
    return null;
  }
}

async function setCachedImageBlob(key, value) {
  try {
    await putRecord(IMAGE_ASSET_STORE, key, value);
  } catch (error) {
    console.warn('Unable to cache image asset:', error);
  }
}

export {
  getCachedImageBlob,
  setCachedImageBlob,
};
