FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including dev dependencies for runtime ts-node
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3003

# Start the application using ts-node for development
CMD ["npx", "ts-node", "src/index.ts"]