# Notification Service

Multi-channel notification service built with FastAPI and Poetry dependency management.

## Setup with Poetry

### Installation
```bash
# Install dependencies
poetry install

# Activate virtual environment
poetry shell
```

### Development
```bash
# Run development server
poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 3002

# Run tests
poetry run pytest

# Run linting
poetry run flake8 src/ tests/

# Run formatting
poetry run black src/ tests/

# Run type checking
poetry run mypy src/
```

### Dependency Management
```bash
# Add new dependency
poetry add package-name

# Add development dependency
poetry add --group dev package-name

# Update dependencies
poetry update

# Export requirements.txt (if needed)
poetry export -f requirements.txt --output requirements.txt
```

## Project Structure
```
notification-service/
├── pyproject.toml          # Poetry configuration
├── poetry.lock            # Locked dependencies
├── src/                   # Source code
│   └── main.py           # Application entry point
├── tests/                 # Test files
└── Dockerfile            # Container configuration
```

## API Documentation
Once running, visit `http://localhost:3002/docs` for interactive API documentation.