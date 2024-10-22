self.onmessage = (event) => {
    console.log('Worker received:', event.data);

    self.postMessage('Hello back from the worker');
}