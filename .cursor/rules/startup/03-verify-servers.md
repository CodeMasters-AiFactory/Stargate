# Startup Rule: Verify All Servers Running

> Priority: 3 (After servers started)
> Trigger: After 02-start-servers completes

## Purpose
Verify all development servers are running and healthy.

## Verification Steps

### 1. Main Server Health Check
```bash
curl -s http://localhost:5000/api/health
# Expected: {"status":"ok"} or similar health response
```

If no /api/health endpoint exists, check:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000
# Expected: 200
```

### 2. Frontend Accessibility
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000
# Expected: 200 (HTML page)
```

### 3. Vite HMR (Development Only)
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
# Expected: 200 (if Vite running separately)
```

### 4. WebSocket Connection Test
```javascript
// Test WebSocket connectivity
const ws = new WebSocket('ws://localhost:5000');
ws.onopen = () => console.log('WebSocket connected');
ws.onerror = (e) => console.error('WebSocket error:', e);
```

### 5. Database Connection (if applicable)
```bash
npm run db:push --dry-run
# Should complete without connection errors
```

## Status Report Format

```
╔══════════════════════════════════════════════════════════════╗
║              StargatePortal Startup Status                   ║
╠══════════════════════════════════════════════════════════════╣
║ Service              │ Port  │ Status                        ║
╠══════════════════════════════════════════════════════════════╣
║ Express Server       │ 5000  │ ✅ Running                    ║
║ Vite HMR             │ 5173  │ ✅ Running                    ║
║ WebSocket            │ 5000  │ ✅ Connected                  ║
║ Database             │ 5432  │ ✅ Connected / ⚠️ Not configured ║
║ Redis                │ 6379  │ ✅ Connected / ⚠️ Not configured ║
╠══════════════════════════════════════════════════════════════╣
║ Frontend URL: http://localhost:5000                          ║
║ API URL: http://localhost:5000/api                           ║
╚══════════════════════════════════════════════════════════════╝
```

## Retry Logic

If a service fails to respond:
1. Wait 2 seconds
2. Retry up to 5 times
3. If still failing, report error with troubleshooting steps

## Troubleshooting

### Server Not Responding
```bash
# Check if process is running
ps aux | grep node
# or on Windows
tasklist | findstr node

# Check port binding
netstat -an | grep 5000
# or on Windows
netstat -an | findstr 5000
```

### Database Connection Failed
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Test connection manually
npm run db:push --dry-run
```

## Success Criteria
- [ ] Express server responds on port 5000
- [ ] Frontend loads successfully
- [ ] No critical errors in console
- [ ] WebSocket connection established

## Final Status
Report all results to developer with clear pass/fail indicators.
