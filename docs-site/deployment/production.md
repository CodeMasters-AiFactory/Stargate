# Production Checklist

Complete checklist before deploying Stargate Portal to production.

## Pre-Deployment

### Environment

- [ ] Set `NODE_ENV=production`
- [ ] Configure production `DATABASE_URL`
- [ ] Set secure `SESSION_SECRET` (64+ chars)
- [ ] Set secure `ENCRYPTION_KEY` (32 chars)
- [ ] Add all required API keys
- [ ] Configure `FRONTEND_URL` correctly
- [ ] Set `ALLOWED_ORIGINS` for CORS

### Security

- [ ] HTTPS enabled (SSL certificate)
- [ ] Secure headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] JWT secrets rotated
- [ ] Input validation in place
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled

### Database

- [ ] Production database created
- [ ] Migrations applied
- [ ] Backups configured (daily minimum)
- [ ] Connection pooling enabled
- [ ] SSL connection required
- [ ] Indexes optimized
- [ ] Test data removed

## Deployment

### Build

- [ ] `npm run build` succeeds without errors
- [ ] TypeScript compiles cleanly
- [ ] No linting errors
- [ ] Tests pass (`npm run test`)
- [ ] Bundle size acceptable

### Configuration

- [ ] `web.config` or equivalent configured
- [ ] Process manager setup (PM2, systemd)
- [ ] Logging configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Health check endpoint responding

### Assets

- [ ] Static assets optimized
- [ ] Images compressed (WebP)
- [ ] CSS/JS minified
- [ ] Gzip compression enabled
- [ ] Cache headers configured
- [ ] CDN configured (optional)

## Post-Deployment

### Verification

- [ ] Application loads correctly
- [ ] All pages accessible
- [ ] User authentication works
- [ ] AI features functioning
- [ ] Image generation working
- [ ] Forms submit correctly
- [ ] Mobile responsive
- [ ] No console errors

### Monitoring

- [ ] Uptime monitoring active
- [ ] Error alerting configured
- [ ] Performance monitoring
- [ ] Log aggregation
- [ ] Database monitoring
- [ ] API usage tracking

### Performance

- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTFB < 600ms
- [ ] Load test passed

## Security Hardening

### Headers

```javascript
// Recommended security headers
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}));
```

### Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
});

app.use('/api/', limiter);
```

### Input Validation

```javascript
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  template: z.string().optional(),
});
```

## Backup Strategy

### Database Backups

- Daily automated backups
- 30-day retention minimum
- Test restores monthly
- Off-site backup copy

### File Backups

- User uploads backed up
- Generated websites stored
- Configuration versioned

## Incident Response

### Monitoring Alerts

1. Server down → PagerDuty/Slack
2. Error rate spike → Team notification
3. High CPU/Memory → Auto-scale trigger
4. Database issues → DBA alert

### Rollback Procedure

```bash
# Quick rollback to previous version
git revert HEAD
npm run build
npm run deploy
```

## Maintenance

### Regular Tasks

- [ ] Weekly: Review error logs
- [ ] Weekly: Check security updates
- [ ] Monthly: Dependency updates
- [ ] Monthly: Performance review
- [ ] Quarterly: Security audit
- [ ] Quarterly: Load testing

### Update Process

1. Test updates in staging
2. Create backup
3. Deploy during low-traffic window
4. Monitor closely post-deploy
5. Have rollback ready

## Support

### Documentation

- User guides updated
- API docs current
- Deployment docs maintained
- Troubleshooting guide

### Contacts

- Technical lead: [email]
- DevOps: [email]
- Security: [email]
- On-call: [phone/Slack]
