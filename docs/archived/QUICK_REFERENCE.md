# ⚡ Quick Reference Card

## 🚀 Start Everything

```bash
npm install          # Install dependencies (first time)
npm run prepare      # Set up Git hooks (first time)
npm run dev          # Start server + Agent Farm
```

## 🧪 Test Everything

```bash
npm test                    # Run all tests
npm run lint                # Check code quality
npm run check               # Type check
npm run test:coverage       # Coverage report
```

## 📝 Before Committing

```bash
# Pre-commit hooks run automatically, but you can also:
npm run lint:fix            # Auto-fix linting
npm run format              # Auto-format code
npm run check               # Type check
npm test                    # Run tests
```

## 🤖 Agent Farm Commands

```bash
# Check status
GET http://localhost:5000/api/agent-farm/stats

# Start project
POST http://localhost:5000/api/agent-farm/projects
{
  "projectDescription": "Your project",
  "requirements": "Requirements here"
}

# Health check
GET http://localhost:5000/api/agent-farm/health
```

## 📊 Monitor Performance

```bash
# Check metrics
GET http://localhost:5000/api/agent-farm/stats

# Performance Monitor Agent runs automatically every 30s
# Check server logs for alerts
```

## 🐳 Docker Commands

```bash
docker-compose up -d                    # Start production
docker-compose -f docker-compose.dev.yml up    # Start dev
docker-compose logs -f                   # View logs
docker-compose down                      # Stop
```

## 📚 Documentation

```bash
npm run docs:generate    # Generate API docs
npm run docs:watch       # Auto-regenerate on changes
```

## 🔒 Security

```bash
npm audit                # Check vulnerabilities
npm audit fix            # Fix vulnerabilities
npm run deps:check       # Check outdated packages
```

## 🚨 Common Issues

### Agent Farm Not Starting

```bash
# Check logs, then:
npm install
npm run check
npm run dev
```

### Pre-commit Hooks Not Working

```bash
npm run prepare
```

### Tests Failing

```bash
npm test -- --reporter=verbose
```

---

**Need more help?** See `COMPLETE_SETUP_GUIDE.md`
