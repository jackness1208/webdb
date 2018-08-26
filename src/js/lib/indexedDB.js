const DB_NAME = 'yylDB';
const DB_STORE_NAME = 'yylDBStore';

const ixDB = {
  source: null,
  init() {
    return new Promise((next, reject) => {
      const res = window.indexedDB.open(DB_NAME, 1);
      res.onsuccess = (e) => {
        const db = e.target.result;
        next(db);
      };
      res.onerror = (er) => {
        reject(er);
      };
      res.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
          db.createObjectStore(DB_STORE_NAME, { keyPath: 'name' });
          // store.createIndex('name', 'name', { unique: true });
        }
      };
    });
  },
  clear() {
    window.indexedDB.deleteDatabase(DB_NAME);
  },
  setItem(name, data) {
    const runner = (next, reject) => {
      ixDB.init().then((db) => {
        const transaction = db.transaction(DB_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(DB_STORE_NAME);
        const res = store.get(name);
        res.onsuccess = (e) => {
          if (e.target.result === undefined) {
            store.add({ name, value: data }).onsuccess = () => {
              next();
            };
          } else {
            store.put({ name, value: data }).onsuccess = () => {
              next();
            };
          }
        };
        res.onerror = (er) => {
          reject(er);
        };
      });
    };

    return new Promise(runner);
  },
  getItem(name) {
    const runner = (next, reject) => {
      ixDB.init().then((db) => {
        const sCtrl = db.transaction(DB_STORE_NAME, 'readwrite');
        const store = sCtrl.objectStore(DB_STORE_NAME);
        const res = store.get(name);
        res.onsuccess = (e) => {
          if (e.target.result === undefined) {
            next();
          } else {
            next(e.target.result.value);
          }
        };
        res.onerror = (er) => {
          reject(er);
        };
      });
    };

    return new Promise(runner);
  }
};

module.exports = ixDB;
