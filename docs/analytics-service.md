# Analytics Service Documentation

## Overview
The Analytics Service is a Go-based microservice that provides real-time analytics and event tracking capabilities. Built with Gin framework, MongoDB, and Redis, it offers comprehensive data collection, processing, and visualization features for monitoring application performance and user behavior.

## Architecture
- **Language**: Go 1.21+
- **Framework**: Gin
- **Primary Database**: MongoDB
- **Cache Layer**: Redis
- **Metrics**: Prometheus
- **Port**: 3003

## API Endpoints

### Event Tracking
```
POST /api/v1/analytics/events
POST /api/v1/analytics/pageview
POST /api/v1/analytics/conversion
```

### Analytics Queries
```
GET /api/v1/analytics/stats/daily
GET /api/v1/analytics/sessions
GET /api/v1/analytics/realtime
```

### Funnel Analysis
```
POST /api/v1/analytics/funnels
GET /api/v1/analytics/funnels/:id/analyze
```

### Legacy Endpoints
```
GET /api/v1/analytics/stats/:userId
GET /api/v1/analytics/dashboard
```

### System Endpoints
```
GET /health
GET /metrics
```

## Data Models

### Event Model
```go
type Event struct {
    UserID    string                 `json:"userId" bson:"userId"`
    EventType string                 `json:"eventType" bson:"eventType"`
    Data      map[string]interface{} `json:"data" bson:"data"`
    Timestamp time.Time              `json:"timestamp" bson:"timestamp"`
}
```

### Session Model
```go
type Session struct {
    SessionID   string    `json:"sessionId" bson:"sessionId"`
    UserID      string    `json:"userId" bson:"userId"`
    StartTime   time.Time `json:"startTime" bson:"startTime"`
    EndTime     time.Time `json:"endTime" bson:"endTime"`
    PageViews   int       `json:"pageViews" bson:"pageViews"`
    Events      []Event   `json:"events" bson:"events"`
}
```

## Core Features

### Real-time Event Processing
- High-throughput event ingestion
- Stream processing capabilities
- Event normalization and validation
- Duplicate detection and filtering

### Data Storage Strategy
- **Hot Data**: Redis for real-time analytics
- **Cold Data**: MongoDB for historical analysis
- **Time-series**: Aggregated metrics storage
- **Archival**: Long-term data retention policies

### Analytics Capabilities
- **User Behavior**: Page views, clicks, conversions
- **Performance Metrics**: Response times, error rates
- **Business Metrics**: Revenue, conversion rates, retention
- **Technical Metrics**: System health, resource utilization

### Funnel Analysis
- Multi-step conversion tracking
- Drop-off point identification
- Conversion rate optimization
- A/B testing support

## Prometheus Metrics

### Custom Metrics
```go
analytics_requests_total          // Total analytics requests
analytics_request_duration_seconds // Request latency histogram
user_sessions_active              // Active user sessions
events_processed_total            // Total events processed
```

### Standard Metrics
- HTTP request duration
- Request count by status code
- Memory and CPU usage
- Goroutine count

## Configuration

### Environment Variables
```bash
PORT=3003
MONGODB_URI=mongodb://localhost:27017
REDIS_ADDR=localhost:6379
PROMETHEUS_ENABLED=true
LOG_LEVEL=info
MAX_SESSION_DURATION=30m
EVENT_RETENTION_DAYS=90
```

### Configuration Structure
```go
type Config struct {
    Port               string        `env:"PORT" envDefault:"3003"`
    MongoURI           string        `env:"MONGODB_URI" envDefault:"mongodb://localhost:27017"`
    RedisAddr          string        `env:"REDIS_ADDR" envDefault:"localhost:6379"`
    PrometheusEnabled  bool          `env:"PROMETHEUS_ENABLED" envDefault:"true"`
    LogLevel           string        `env:"LOG_LEVEL" envDefault:"info"`
    MaxSessionDuration time.Duration `env:"MAX_SESSION_DURATION" envDefault:"30m"`
    EventRetentionDays int           `env:"EVENT_RETENTION_DAYS" envDefault:"90"`
}
```

## Development Commands
```bash
# Build the service
go build -o analytics-service cmd/main.go

# Run development server
go run cmd/main.go

# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Generate documentation
godoc -http=:6060
```

## Docker Support
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o analytics-service cmd/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/analytics-service .
EXPOSE 3003
CMD ["./analytics-service"]
```

## Integration Points
- **User Service**: User demographics and segmentation
- **Order Service**: Purchase behavior and conversion tracking
- **Product Service**: Product interaction and preference analysis
- **Notification Service**: Campaign effectiveness measurement

## Testing Strategy
- Unit tests for business logic
- Integration tests for database operations
- Performance tests for high-load scenarios
- Chaos engineering for resilience testing
- Contract tests for API compatibility

## Monitoring and Observability
- Prometheus metrics endpoint at `/metrics`
- Health check endpoint at `/health`
- Structured logging with JSON format
- Distributed tracing support
- Alerting rules for critical metrics

## Performance Optimization
- Connection pooling for databases
- Efficient caching strategies
- Batch processing for high-volume events
- Memory-efficient data structures
- Garbage collection tuning

## Scalability Considerations
- Horizontal scaling support
- Load balancing configuration
- Database sharding strategies
- Redis cluster setup
- Message queue integration for async processing

## Deployment Best Practices
- Rolling update deployment strategy
- Health check probe configuration
- Resource limit definitions
- Log aggregation and monitoring setup
- Backup and disaster recovery procedures

## Data Privacy and Compliance
- GDPR-compliant data handling
- Data anonymization capabilities
- User consent tracking
- Data retention policies
- Audit logging for compliance