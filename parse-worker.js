
// // worker
// const persistWorker = new Worker('persist-worker.js');
// persistWorker.onmessage = event => {
//     if (event.data.type === 'committed') {
//         self.postMessage({
//             type: 'committed',
//         })
//         // processedFileCnt++;
//         // if (processedFileCnt === totalFileCnt) {
//         //     const time = Math.round(performance.now() - startTime);
//         //     const logItem = document.createElement("li");
//         //     logItem.textContent = totalFileCnt + ' files, ' + time + 'ms, ' + workerCntInput.value + ' workers';
//         //     outputList.prepend(logItem);
//         // }
//     }
// }

self.onmessage = function workerAcceptMessage(event) {
    const type = event.data.type;
    switch (type) {
        case 'file':
            parseFile(event.data.file);
            break;
        case 'files':
            parseFiles(event.data.files);
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

const defaultHandler = (arrayBuffer) => {
    self.postMessage({
        type: 'array-buffer',
        arrayBuffer,
    });
}

function parseFile(file, handler = defaultHandler) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        handler(arrayBuffer);
    }
    reader.readAsArrayBuffer(file);
}

function parseFiles(files) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        parseFile(file);
    }
}
