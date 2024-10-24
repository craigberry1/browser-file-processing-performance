importScripts('https://unpkg.com/dexie/dist/dexie.js')

const db = new Dexie("upload-manager-performance");

db.version(1).stores({
    file: '++id'
});

self.onmessage = function workerAcceptMessage(event) {
    const type = event.data.type;
    switch (type) {
        case 'file':
            parseFile(event.data.file, event.data.persist);
            break;
        case 'files':
            parseFiles(event.data.files, event.data.persist);
            break;
        // case 'persist':
        //     parseFile(event.data.file, (arrayBuffer) => {
        //         persistWorker.postMessage(arrayBuffer);
        //     });
        //     break
        default:
            break;
    }
}

const defaultHandler = async (persist, arrayBuffer) => {
    if (persist) {
        await db.file.add(arrayBuffer);
        self.postMessage({ type: 'committed' });
    } else {
        self.postMessage({
            type: 'array-buffer',
            arrayBuffer,
        });
    }
}

function parseFile(file, persist, handler = defaultHandler) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        handler(persist, arrayBuffer);
    }
    reader.readAsArrayBuffer(file);
}

function parseFiles(files, persist) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        parseFile(file, persist);
    }
}
