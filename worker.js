const persistWorker = new Worker('persist-worker.js')

let fileCnt = 1;

self.onmessage = function workerAcceptMessage(event) {
    const type = event.data.type;
    switch (type) {
        case 'file':
            parseFile(event.data.file);
            break;
        case 'files':
            parseFiles(event.data.files);
            break;
        default:
            break;
    }
}


function parseFile(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        persistWorker.postMessage(arrayBuffer)
        self.postMessage({
            type: 'done',
            fileCnt,
        });
        fileCnt++;
    }
    reader.readAsArrayBuffer(file);
}

function parseFiles(files) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        parseFile(file);
    }
}
