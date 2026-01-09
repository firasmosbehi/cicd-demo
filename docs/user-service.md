# User Service Documentation

## Overview
The User Service is a TypeScript-based microservice responsible for user management and authentication within the CI/CD pipeline ecosystem. Built with Express.js and MongoDB, it provides secure user registration, authentication, and profile management capabilities.

## Architecture
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT with refresh tokens
- **Password Security**: bcrypt hashing
- **Port**: 3001

## API Endpoints

### Authentication Routes
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
```

### User Management Routes
```
GET /api/users
GET /api/users/:id
PUT /api/users/:id
DELETE /api/users/:id
GET /api/profile
```

### Health Check
```
GET /health
```

## Data Models

### User Model
```typescript
interface User {
  _id: string;
  username: string;
  email: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

## Authentication Flow

### Registration
1. Client sends registration request with user details
2. Password is hashed using bcrypt
3. User is saved to MongoDB
4. Success response returned

### Login
1. Credentials validated against database
2. JWT access token and refresh token generated
3. Tokens returned to client
4. Refresh token stored securely

### Token Refresh
1. Valid refresh token required
2. New access token generated
3. Extended session lifetime

## Security Features
- Password hashing with bcrypt (12 rounds)
- JWT token-based authentication
- Token expiration and refresh mechanism
- CORS protection
- Input validation and sanitization
- Rate limiting on auth endpoints

## Environment Variables
```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/userdb
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
NODE_ENV=development|production
```

## Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration
```

## Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## Testing
Unit tests cover:
- User controller logic
- Authentication flows
- Input validation
- Error handling

Integration tests verify:
- Database operations
- API endpoint responses
- Authentication workflows

## Monitoring
- Health check endpoint at `/health`
- Request logging
- Error tracking
- Performance metrics collection

## Deployment Considerations
- MongoDB connection pooling
- Environment-specific configuration
- SSL/TLS termination
- Load balancing setup
- Backup and recovery procedures