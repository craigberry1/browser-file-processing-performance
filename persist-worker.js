let data = [];

self.onmessage = function persistAcceptEvent(event) {
    if (event.data.type === 'clear') {
        data = [];
    } else if (event.data) {
        data.push(event.data)
    }
}