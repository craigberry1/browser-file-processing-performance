const fileInput = document.getElementById('file-input');
const startWorkerBtn = document.getElementById('start-worker-btn');
const outputP = document.getElementById('output-p');
const outputList = document.getElementById('output-list');

startWorkerBtn.addEventListener('click', () => {
    if (!window.worker) {
        const worker = new Worker('worker.js');
        // Get the file from the input
        const files = fileInput.files;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            worker.onmessage = (event) => {
                const time = getTimestamp();
                const responseMsg = document.createElement("li");
                responseMsg.textContent = time + ': ' + event.data;
                outputList.prepend(responseMsg);
            }

            worker.postMessage(file);
        }
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
