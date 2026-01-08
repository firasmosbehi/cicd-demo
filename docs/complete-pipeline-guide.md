# Comprehensive CI/CD Pipeline Documentation

## Overview

This repository demonstrates a complete CI/CD pipeline for a polyglot microservices architecture featuring automated testing, security scanning, containerization, and progressive deployment strategies.

## Architecture

### Services

1. **User Service** (Node.js/TypeScript) - User management and authentication
2. **Order Service** (Node.js) - Order processing and management  
3. **Product Service** (Node.js) - Product catalog and inventory
4. **Notification Service** (Python/FastAPI) - Email, SMS, and push notifications
5. **Analytics Service** (Go/Gin) - Event tracking and analytics

### Technologies Used

- **Languages**: TypeScript, Python, Go
- **Frameworks**: Express.js, FastAPI, Gin
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, AlertManager
- **Security**: Snyk, CodeQL, Trivy

## Pipeline Stages

### 1. Code Quality
- ESLint for TypeScript/JavaScript
- Type checking with TypeScript compiler
- Language-specific linting for Python and Go

### 2. Security Scanning
- **SAST**: CodeQL analysis for all languages
- **Dependency Scanning**: Snyk (Node.js), Safety (Python), Gosec (Go)
- **Container Scanning**: Trivy for Docker image vulnerabilities

### 3. Automated Testing
- **Unit Tests**: Jest (Node.js), Pytest (Python), Go test
- **Integration Tests**: Database integration with MongoDB
- **End-to-End Tests**: API contract testing

### 4. Container Building
- Multi-stage Docker builds for optimization
- Registry integration (Docker Hub)
- Image tagging and versioning

### 5. Progressive Deployment
- **Canary Deployments**: Gradual rollout to staging
- **Blue-Green Deployments**: Zero-downtime production releases
- Health checks and automated rollbacks

### 6. Monitoring & Observability
- Prometheus metrics collection
- Custom alert rules for service health
- Automated rollback on failure detection

## GitHub Actions Workflows

### Main Pipeline (`cicd-pipeline.yml`)
Triggers on push to `main` and `develop` branches, and pull requests to `main`.

**Jobs:**
- `code-quality`: Linting and type checking
- `security-sast`: Static application security testing
- `unit-tests`: Cross-version testing matrix
- `integration-tests`: Database-dependent tests
- `build-and-push`: Container image building and registry push
- `security-dast`: Dynamic application security testing
- `canary-deployment`: Staging deployment with health checks
- `production-deployment`: Blue-green production rollout

### Security Scanning (`security-scanning.yml`)
Weekly scheduled security scans plus manual trigger option.

**Jobs:**
- `sast-scanning`: CodeQL analysis for all languages
- `dependency-scanning`: Language-specific dependency checks
- `container-security`: Docker image vulnerability scanning

## Progressive Deployment Strategies

### Canary Deployment
Deploy new version to small percentage of traffic:
```yaml
# k8s/canary-deployment.yaml
spec:
  replicas: 1  # Start with 1 replica
  selector:
    matchLabels:
      version: canary
```

### Blue-Green Deployment
Maintain two identical production environments:
- **Blue**: Current stable version
- **Green**: New version (inactive until testing complete)
- Switch traffic using service selectors

## Monitoring and Rollback

### Health Checks
Automated health verification script (`scripts/health-check.sh`):
- Deployment readiness probes
- Service endpoint availability
- Custom metrics thresholds
- Automatic rollback on failure

### Alert Rules
Prometheus alerts for:
- Service downtime
- High error rates (>5%)
- Latency thresholds (>2 seconds)
- Resource utilization (>80%)

## Security Features

### SAST Tools
- **CodeQL**: GitHub's semantic code analysis
- **Language-specific**: ESLint, PyLint, Go vet

### Dependency Scanning
- **Node.js**: Snyk vulnerability database
- **Python**: Safety package checker
- **Go**: Gosec security scanner

### Container Security
- **Trivy**: Image vulnerability scanning
- Base image security updates
- Multi-stage build security

## Usage Instructions

### Local Development Setup

1. **Clone repository:**
```bash
git clone <repository-url>
cd cicd-pipeline
```

2. **Install dependencies:**
```bash
# Root dependencies
npm install

# Individual services
cd services/user-service && npm install
cd services/notification-service && pip install -r requirements.txt
cd services/analytics-service && go mod tidy
```

3. **Start services locally:**
```bash
# User service
cd services/user-service && npm run dev

# Notification service  
cd services/notification-service && python src/main.py

# Analytics service
cd services/analytics-service && go run cmd/main.go
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Language-specific testing
cd services/notification-service && python -m pytest tests/
cd services/analytics-service && go test ./...
```

### Building and Deploying

1. **Build Docker images:**
```bash
docker build -t user-service:latest services/user-service/
docker build -t notification-service:latest services/notification-service/
docker build -t analytics-service:latest services/analytics-service/
```

2. **Deploy to Kubernetes:**
```bash
kubectl apply -f k8s/canary-deployment.yaml
kubectl apply -f k8s/production-deployment.yaml
```

### Monitoring Setup

1. **Start Prometheus:**
```bash
docker run -p 9090:9090 -v $(pwd)/configs/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
```

2. **View metrics:**
- Prometheus UI: `http://localhost:9090`
- Service metrics endpoints: `/metrics` on each service

## Configuration

### Environment Variables

**Required for services:**
- `MONGODB_URI`: MongoDB connection string
- `REDIS_HOST`: Redis server hostname
- `REDIS_PORT`: Redis server port
- `PORT`: Service port (3001, 3002, 3003)

**GitHub Actions secrets:**
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password  
- `SNYK_TOKEN`: Snyk API token

### Customization

1. **Modify deployment strategies** in `k8s/` directory
2. **Adjust alert thresholds** in `configs/alert.rules`
3. **Update security policies** in `configs/security-config.json`
4. **Customize test matrices** in `.github/workflows/`

## Best Practices Demonstrated

✅ Polyglot microservices architecture
✅ Multi-stage CI/CD pipeline
✅ Security-first development
✅ Automated testing pyramid
✅ Progressive deployment patterns
✅ Comprehensive monitoring
✅ Automated rollback mechanisms
✅ Infrastructure as Code
✅ Observability and logging

## Troubleshooting

### Common Issues

1. **Build failures**: Check Dockerfile compatibility and base images
2. **Test failures**: Verify service dependencies and environment setup
3. **Deployment issues**: Check Kubernetes RBAC and resource quotas
4. **Security scan failures**: Review dependency versions and CVE databases

### Debugging Steps

1. Enable debug logging in GitHub Actions
2. Use `kubectl describe` for deployment issues
3. Check Prometheus targets for monitoring problems
4. Review security scan reports for vulnerabilities

## Future Enhancements

- [ ] Add service mesh (Istio/Linkerd)
- [ ] Implement distributed tracing (Jaeger)
- [ ] Add chaos engineering experiments
- [ ] Integrate with infrastructure provisioning (Terraform)
- [ ] Add API gateway and rate limiting
- [ ] Implement feature flags and toggles