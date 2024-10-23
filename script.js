const fileInput = document.getElementById('file-input');
const startWorkerBtn = document.getElementById('start-worker-btn');
const outputP = document.getElementById('output-p');
const outputList = document.getElementById('output-list');


startWorkerBtn.addEventListener('click', () => {
    if (!window.worker) {
        const start = performance.now();
        const worker = new Worker('worker.js');

        worker.onmessage = (event) => {
            const type = event.data.type;
            if (type === 'done') {
                const time = getTimestamp();
                outputList.textContent = time + ': Processed ' + event.data.fileCnt + ' files';
            }
        }

        // Get the file from the input
        const files = fileInput.files;

        worker.postMessage({
            type: 'files',
            files
        })

        // for (let i = 0; i < files.length; i++) {
        //     const file = files[i];
        //
        //     worker.postMessage({
        //         type: 'file',
        //         file,
        //     });
        // }
    } else {
        outputP.textContent = 'Web workers are not supported by this browser'
    }
});


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
