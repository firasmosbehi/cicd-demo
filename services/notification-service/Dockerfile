FROM python:3.11-slim

WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy pyproject.toml and poetry.lock (if exists)
COPY pyproject.toml ./
COPY poetry.lock* ./ 

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

# Copy application code
COPY src/ ./src/

# Expose port
EXPOSE 3002

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "3002"]