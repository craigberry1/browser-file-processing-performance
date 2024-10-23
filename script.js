// html elements
const workerCntInput = document.getElementById('worker-cnt-input')
workerCntInput.value = window.navigator.hardwareConcurrency
const fileInput = document.getElementById('file-input');
const startWorkerBtn = document.getElementById('start-worker-btn');
const outputP = document.getElementById('output-p');
const outputList = document.getElementById('output-list');

// state
const persistWorker = new Worker('persist-worker.js');
let parserWorkerPool = [];
let totalFileCnt = 0;
let processedFileCnt = 0;
let startTime = 0;

startWorkerBtn.addEventListener('click', () => {
    persistWorker.postMessage({type:'clear'});
    startTime = performance.now();

    const workerCnt = workerCntInput.value;
    parserWorkerPool.forEach(worker => worker.terminate());
    parserWorkerPool = createWorkerPool(workerCnt, persistWorker);

    // Get the file from the input
    const files = fileInput.files;

    // reset count
    totalFileCnt = files.length;
    processedFileCnt = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const workerIdx = i % workerCnt;

        parserWorkerPool[workerIdx].postMessage({
            type: 'file',
            file,
        });
    }
});


function createWorkerPool(workerCnt, persistWorker) {
    const workers = [];
    for (let i = 0; i < workerCnt; i++) {
        const worker = new Worker('worker.js');
        worker.onmessage = function parserOnMessage(event) {
            if (event.data.type === 'array-buffer') {
                processedFileCnt++;
                persistWorker.postMessage(event.data.arrayBuffer);
            }
            if (processedFileCnt === totalFileCnt) {
                const time = performance.now() - startTime;
                const logItem = document.createElement("li");
                logItem.textContent = totalFileCnt + ' files, ' + time + 'ms, ' + workerCnt + ' workers';
                outputList.prepend(logItem);
            }
        };
        workers.push(worker);
    }
    return workers;
}


// UTILS
function formatDate(date) {
    // Pad with leading zero if needed
    const pad = (num) => String(num).padStart(2, '0');

    const month = pad(date.getMonth() + 1); // Months are 0-indexed
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0'); // Always 3 digits

    return `${month}/${day} ${hours}:${minutes}:${seconds}:${milliseconds}`;
}

function getTimestamp() {
    return formatDate(new Date());
}
