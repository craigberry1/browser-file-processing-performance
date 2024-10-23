
self.onmessage = (event) => {
    console.log('Worker received:', event.data);

    if (event.data) {
        self.postMessage('Received file reference');
        parseFile(event.data);
    }
}

function parseFile(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        self.postMessage('Sending file');
        self.postMessage(arrayBuffer);
    }

    self.postMessage('Reading file');
    reader.readAsArrayBuffer(file);
}