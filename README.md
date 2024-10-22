# Performance Testing POC

## Troubleshooting

### Workers
Web workers cannot be run from `file://` protocol for security reasons (access to file system). To mitigate this we can serve this directory via a simple http server.

Python will come pre-installed with one.

```bash
python -m http.server
```

Then the POC can be accessed via http://localhost:8000/index.html