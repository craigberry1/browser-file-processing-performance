importScripts('https://unpkg.com/dexie/dist/dexie.js')


// let data = [];
const db = new Dexie("upload-manager-performance");

db.version(1).stores({
    file: '++id'
});

self.onmessage = function persistAcceptEvent(event) {
    if (event.data.type === 'clear') {
        // data = [];
        db.file.clear();
    } else if (event.data) {
        // data.push(event.data);
        db.file.add(event.data)
        self.postMessage({ type: 'committed' });
    }
}