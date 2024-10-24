// html elements
const hardwareConcurrency = document.getElementById('hardware-concurrency-p');
hardwareConcurrency.textContent += window.navigator.hardwareConcurrency

const parseWorkerCntInput = document.getElementById('parse-worker-cnt-input')
parseWorkerCntInput.value = window.navigator.hardwareConcurrency / 2
const persistWorkerCntInput = document.getElementById('persist-worker-cnt-input')
persistWorkerCntInput.value = window.navigator.hardwareConcurrency / 2

const fileInput = document.getElementById('file-input');
const startWorkerBtn = document.getElementById('start-worker-btn');
const resetWorkerBtn = document.getElementById('reset-worker-btn');
const outputP = document.getElementById('output-p');
const outputList = document.getElementById('output-list');

const workersList = document.getElementById('workers-list');

// worker
// const persistWorker = new Worker('persist-worker.js');
// persistWorker.onmessage = event => {
//     if (event.data.type === 'committed') {
//         processedFileCnt++;
//         if (processedFileCnt === totalFileCnt) {
//             const time = Math.round(performance.now() - startTime);
//             const logItem = document.createElement("li");
//             logItem.textContent = totalFileCnt + ' files, ' + time + 'ms, ' + workerCntInput.value + ' workers';
//             outputList.prepend(logItem);
//         }
//     }
// }

// state
let parseWorkerPool = [];
let persistWorkerPool = [];
let totalFileCnt = 0;
let processedFileCnt = 0;
let startTime = 0;

startWorkerBtn.addEventListener('click', () => {
    const parseWorkerCnt = parseWorkerCntInput.value;
    const persistWorkerCnt = persistWorkerCntInput.value;
    const files = fileInput.files;

    reset(parseWorkerCnt, persistWorkerCnt, files.length);

    startTime = performance.now();

    processFiles(files, parseWorkerCnt);
});

resetWorkerBtn.addEventListener('click', () => {
    const parseWorkerCnt = parseWorkerCntInput.value;
    const persistWorkerCnt = persistWorkerCntInput.value;
    const files = fileInput.files;

    resetWorkerPools(parseWorkerCnt, persistWorkerCnt, files.length)
})

function processFiles(files, parseWorkerCnt) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const workerIdx = i % parseWorkerCnt;

        parseWorkerPool[workerIdx].postMessage({
            type: 'file',
            file,
        });
    }
}

function createParseWorkerPool(workerCnt, persistWorkerPool) {
    const workers = [];
    for (let i = 0; i < workerCnt; i++) {
        const persister = persistWorkerPool[i % persistWorkerPool.length]
        const worker = createParseWorker(persister, workerCnt);
        workers.push(worker);
    }
    return workers;
}

function createParseWorker(persistWorker, workerCnt) {
    const parseWorker = new Worker('parse-worker.js');
    parseWorker.onmessage = function parserOnMessage(event) {
        if (event.data.type === 'array-buffer') {
            persistWorker.postMessage(event.data.arrayBuffer);
        } else if (event.data.type === 'committed') {
            processedFileCnt++;
        }
        handleJobFinished(workerCnt);
    };
    return parseWorker;
}

function handleJobFinished() {
    if (processedFileCnt === totalFileCnt) {
        const time = Math.round(performance.now() - startTime);
        const logItem = document.createElement("li");
        logItem.textContent = totalFileCnt + ' files, ' + time + 'ms, ' + parseWorkerCntInput.value + ' workers';
        outputList.prepend(logItem);
    }
}


function createPersistWorkerPool(workerCnt) {
    const workers = [];
    for (let i = 0; i < workerCnt; i++) {
        const worker = createPersistWorker();
        workers.push(worker);
    }
    return workers;
}

function createPersistWorker() {
    const persistWorker = new Worker('persist-worker.js');
    persistWorker.onmessage = event => {
        if (event.data.type === 'committed') {
            processedFileCnt++;
            handleJobFinished()
        }
    }
    return persistWorker;
}

// CLEANUP
function reset(parseWorkerCnt, persistWorkerCnt, total) {
    resetDb();
    resetWorkerPools(parseWorkerCnt, persistWorkerCnt);
    resetState(total);
}

function resetDb() {
    window.indexedDB.databases().then((r) => {
        for (let i = 0; i < r.length; i++) window.indexedDB.deleteDatabase(r[i].name);
    });
}

function resetWorkerPools(parseWorkerCnt, persistWorkerCnt) {
    persistWorkerPool.forEach(worker => worker.terminate());
    persistWorkerPool = createPersistWorkerPool(persistWorkerCnt);

    parseWorkerPool.forEach(worker => worker.terminate());
    parseWorkerPool = createParseWorkerPool(parseWorkerCnt, persistWorkerPool);

    function listWorkers(workers, prefix) {
        workers.forEach((worker, index) => {
            const li = document.createElement('li');
            li.textContent = `${prefix}-worker-${index + 1}`;
            workersList.appendChild(li);
        });
    }

    workersList.innerHTML = ''; // Clear the list
    listWorkers(persistWorkerPool, 'persist');
    listWorkers(parseWorkerPool, 'parse');
}

function resetState(total) {
    totalFileCnt = total;
    processedFileCnt = 0;
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
