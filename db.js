
const db = new Dexie("upload-manager-performance");

db.version(1).stores({
    file: '++id'
});
