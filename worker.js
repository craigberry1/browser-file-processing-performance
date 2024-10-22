
function fib(count) {
    if (count <= 1) {
        return 1;
    } else {
        return fib(count - 2) + fib(count - 1);
    }
}

self.onmessage = (event) => {
    console.log('Worker received:', event.data);

    const fibCount = event.data.fibCount;

    setTimeout(() => self.postMessage('Hello from timeout'), 2000);

    const fibResult = fib(fibCount);

    self.postMessage('Hello back from the worker: ' + fibResult);
}
