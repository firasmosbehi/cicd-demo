FROM node:18-alpine

WORKDIR /app

# Install build dependencies for native modules (keeping for other potential native deps)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install instead of npm ci due to package changes)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the application using ts-node for development
CMD ["npx", "ts-node", "src/index.ts"]