# Notification Service Documentation

## Overview
The Notification Service is a Python-based microservice that handles multi-channel notification delivery including email, SMS, push notifications, and Slack messaging. Built with FastAPI and Redis, it provides asynchronous notification processing with reliable delivery guarantees.

## Architecture
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Message Queue**: Redis
- **Async Support**: Native async/await
- **Port**: 3002

## API Endpoints

### Notification Sending
```
POST /notifications
GET /notifications/{notification_id}
```

### Health Check
```
GET /health
```

## Supported Notification Types

### Email Notifications
- HTML and plain text support
- Template-based content
- Attachment support
- SMTP provider integration

### SMS Notifications
- Twilio integration
- Message templating
- Delivery receipts
- International support

### Push Notifications
- Firebase Cloud Messaging (FCM)
- Apple Push Notification Service (APNs)
- Device token management
- Rich notification content

### Slack Notifications
- Webhook integration
- Channel targeting
- Message formatting
- Bot user support

## Data Models

### Notification Model
```python
class Notification(BaseModel):
    user_id: str
    recipient: str  # email, phone, device_token, or webhook_url
    message: str
    type: str  # email, sms, push, slack
    priority: str = "normal"  # low, normal, high
    subject: str = None  # For email
    title: str = None    # For push notifications
    html_body: str = None  # For email
    data: Dict = None    # For push notifications
    username: str = None # For Slack
```

## Core Features

### Asynchronous Processing
- Background task processing
- Redis-based job queuing
- Retry mechanisms with exponential backoff
- Dead letter queue for failed notifications

### Provider Management
Multiple notification providers with automatic fallback:
- **Email**: SMTP, SendGrid, Mailgun
- **SMS**: Twilio, AWS SNS, Nexmo
- **Push**: FCM, APNs, OneSignal
- **Slack**: Incoming webhooks, Bot tokens

### Delivery Guarantees
- At-least-once delivery semantics
- Delivery status tracking
- Retry policies per notification type
- Failure notification and alerting

### Rate Limiting
- Provider-specific rate limits
- Burst protection
- Throttling based on priority
- Fair queuing algorithms

## Configuration

### Environment Variables
```bash
PORT=3002
REDIS_HOST=localhost
REDIS_PORT=6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
FCM_SERVER_KEY=your-fcm-key
SLACK_WEBHOOK_URL=your-webhook-url
```

### Provider Configuration
```python
# Email providers
EMAIL_PROVIDER = "smtp"  # smtp, sendgrid, mailgun
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

# SMS providers
SMS_PROVIDER = "twilio"  # twilio, aws_sns, nexmo
TWILIO_ACCOUNT_SID = "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
TWILIO_AUTH_TOKEN = "your_auth_token"

# Push notification providers
PUSH_PROVIDER = "fcm"  # fcm, apns, onesignal
FCM_SERVER_KEY = "your_server_key"
```

## Development Commands
```bash
# Install dependencies with Poetry
poetry install

# Start development server
poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 3002

# Run tests
poetry run pytest tests/

# Run specific test file
poetry run pytest tests/test_notifications.py

# Run linting
poetry run flake8 src/ tests/

# Run formatting
poetry run black src/ tests/

# Run type checking
poetry run mypy src/
```

## Docker Support
```dockerfile
FROM python:3.11-alpine
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 3002
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "3002"]
```

## Integration Points
- **User Service**: User preferences and contact information
- **Order Service**: Order confirmation and status updates
- **Product Service**: Price drop alerts and new product notifications
- **Analytics Service**: Event-driven notifications

## Testing Strategy
- Unit tests for notification processing logic
- Integration tests for provider integrations
- Mock provider testing for development
- Load testing for high-volume scenarios
- End-to-end notification flow testing

## Monitoring and Observability
- Health check endpoint at `/health`
- Notification delivery metrics
- Provider performance tracking
- Queue depth monitoring
- Error rate and failure analysis

## Error Handling
- Graceful degradation for failed providers
- Automatic fallback to alternative providers
- Retry mechanisms with configurable policies
- Dead letter queue for persistent failures
- Alerting for critical notification failures

## Scalability Considerations
- Horizontal scaling support
- Redis cluster configuration
- Provider connection pooling
- Load balancing across instances
- Circuit breaker patterns for external services

## Deployment Best Practices
- Blue-green deployment strategy
- Health check probe configuration
- Resource limit definitions
- Log aggregation setup
- Metric collection and alerting