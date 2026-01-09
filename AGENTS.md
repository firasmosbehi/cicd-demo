# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview

This is a comprehensive CI/CD pipeline showcase featuring polyglot microservices with automated testing, security scanning, containerization, and progressive deployment strategies. The system consists of 6 microservices written in TypeScript, Python, and Go, orchestrated with Docker Compose and Kubernetes.

## Codebase Architecture

### Service Structure
```
services/
├── user-service/          # TypeScript + Express.js (Port 3001) - User management & auth
├── order-service/         # JavaScript + Express.js (Port 3002) - Order processing  
├── product-service/       # JavaScript + Express.js (Port 3003) - Product catalog
├── notification-service/  # Python + FastAPI (Port 3004) - Email/SMS notifications
├── analytics-service/     # Go + Gin (Port 3005) - Event tracking & analytics
└── frontend-client/       # React frontend (Port 3000)
```

### Infrastructure Components
- **Database**: MongoDB (localhost:27017) with separate databases per service
- **Cache**: Redis (localhost:6379) for session management and caching
- **Monitoring**: Prometheus (http://localhost:9090) with custom alert rules
- **Orchestration**: Docker Compose for local development, Kubernetes for production

### Data Flow Architecture
1. Frontend communicates with backend services via REST APIs
2. Services use MongoDB for persistence with isolated databases
3. Redis handles session storage and pub/sub messaging
4. Analytics service collects events from all services
5. Notification service processes messages from Redis queues

## Development Commands

### Local Development Setup
```bash
# Start all services in development mode
docker-compose up -d

# Start specific services
docker-compose up -d user-service mongodb
docker-compose up -d frontend-client

# View service logs
docker-compose logs -f
docker-compose logs -f user-service

# Stop services
docker-compose down
docker-compose down -v  # Remove volumes
```

### Service-Specific Development

#### TypeScript/JavaScript Services (user-service, order-service, product-service)
```bash
# Navigate to service directory
cd services/user-service

# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test
npm run test:unit
npm run test:integration

# Start production server
npm start
```

#### Python Service (notification-service)
```bash
cd services/notification-service

# Install dependencies
pip install -r requirements.txt

# Development mode
uvicorn main:app --reload --port 3002

# Run tests
pytest
pytest tests/unit
pytest tests/integration
```

#### Go Service (analytics-service)
```bash
cd services/analytics-service

# Install dependencies
go mod tidy

# Development mode
go run main.go

# Build
go build -o analytics-service

# Run tests
go test ./...
go test -v ./tests/unit
go test -v ./tests/integration
```

#### Frontend Client
```bash
cd services/frontend-client

# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing Commands
```bash
# Run all tests across all services
# (Execute in each service directory)

# Unit testing
npm test  # For Node.js services
pytest tests/unit  # For Python service
go test ./tests/unit  # For Go service

# Integration testing
npm run test:integration  # For Node.js services
pytest tests/integration  # For Python service
go test ./tests/integration  # For Go service

# End-to-end testing
# Located in tests/e2e/ directory
```

### Infrastructure Management
```bash
# Health checks
./scripts/health-check.sh

# Database initialization
# Automatically runs via docker-compose with mongo-init.js

# Monitoring
# Access Prometheus at http://localhost:9090
# Alert rules configured in configs/alert.rules
```

## Service URLs After Startup
- **Frontend**: http://localhost:3000
- **User Service**: http://localhost:3001
- **Order Service**: http://localhost:3002
- **Product Service**: http://localhost:3003
- **Notification Service**: http://localhost:3004
- **Analytics Service**: http://localhost:3005
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **Prometheus**: http://localhost:9090

## Key Configuration Files
- `docker-compose.yml`: Service definitions and networking
- `configs/prometheus.yml`: Monitoring configuration
- `configs/alert.rules`: Prometheus alert rules
- `configs/security-config.json`: Security scanning rules
- `scripts/health-check.sh`: Service health verification
- `scripts/mongo-init.js`: Database initialization

## Development Workflow
1. Make changes in respective service directories
2. Run service-specific tests
3. Test integration with other services via docker-compose
4. Verify monitoring and alerting functionality
5. Check health endpoints and metrics collection