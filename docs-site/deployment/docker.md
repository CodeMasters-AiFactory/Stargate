# Docker Deployment

Deploy Stargate Portal using Docker containers.

## Prerequisites

- Docker 20+
- Docker Compose 2+

## Quick Start

```bash
# Clone repository
git clone https://github.com/CodeMasters-AiFactory/Stargate.git
cd Stargate

# Copy environment file
cp .env.example .env

# Edit .env with your API keys

# Start containers
docker-compose up -d
```

Open [http://localhost:5000](http://localhost:5000)

## Docker Files

### Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/stargate
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - LEONARDO_AI_API_KEY=${LEONARDO_AI_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=stargate
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## Development with Docker

### docker-compose.dev.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "5000:5000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev
```

### Run Development

```bash
docker-compose -f docker-compose.dev.yml up
```

## Production Setup

### Build Image

```bash
docker build -t stargate:latest .
```

### Push to Registry

```bash
# Docker Hub
docker tag stargate:latest yourusername/stargate:latest
docker push yourusername/stargate:latest

# Azure Container Registry
az acr login --name yourregistry
docker tag stargate:latest yourregistry.azurecr.io/stargate:latest
docker push yourregistry.azurecr.io/stargate:latest
```

### Run in Production

```bash
docker run -d \
  --name stargate \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://..." \
  -e ANTHROPIC_API_KEY="..." \
  -e LEONARDO_AI_API_KEY="..." \
  -e SESSION_SECRET="..." \
  stargate:latest
```

## Health Checks

Add health check to Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1
```

## Logging

### View Logs

```bash
docker logs stargate -f
```

### Log Driver

```yaml
services:
  app:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

## Volumes

### Persistent Data

```yaml
volumes:
  postgres_data:
    driver: local
  uploads:
    driver: local
  
services:
  app:
    volumes:
      - uploads:/app/uploads
```

## Networking

### Custom Network

```yaml
networks:
  stargate-net:
    driver: bridge

services:
  app:
    networks:
      - stargate-net
  db:
    networks:
      - stargate-net
```

## Scaling

### Multiple Instances

```bash
docker-compose up -d --scale app=3
```

Add nginx load balancer:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
```
