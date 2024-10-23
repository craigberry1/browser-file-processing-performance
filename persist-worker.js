data = [];

self.onmessage = function persistAcceptEvent(event) {
    if (event.data) {
        self.postMessage('persist-received');
        data.push(event.data)
    }
}