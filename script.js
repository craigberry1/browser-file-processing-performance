const startWorkerBtn = document.getElementById('start-worker-btn');
const outputP = document.getElementById('output-p');

startWorkerBtn.addEventListener('click', () => {
    if (!window.worker) {
        const worker = new Worker('worker.js');

        worker.onmessage = (event) => {
            outputP.textContent = event.data;
        }

        worker.postMessage('Hello');

    } else {
        outputP.textContent = 'Web workers are not supported by this browser'
    }
});
