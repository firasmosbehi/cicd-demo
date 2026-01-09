import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserController } from './controllers/UserController';
import { AuthController } from './controllers/AuthController';
import { authenticateToken } from './middleware/auth';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize controllers
const userController = new UserController();
const authController = new AuthController();

// Public routes
app.post('/api/auth/register', authController.register.bind(authController));
app.post('/api/auth/login', authController.login.bind(authController));
app.post('/api/auth/refresh', authController.refreshToken.bind(authController));

// Protected routes
app.use('/api/users', authenticateToken);
app.get('/api/users', userController.getAllUsers.bind(userController));
app.get('/api/users/:id', userController.getUserById.bind(userController));
app.put('/api/users/:id', userController.updateUser.bind(userController));
app.delete('/api/users/:id', userController.deleteUser.bind(userController));

// Profile route
app.get('/api/profile', authenticateToken, userController.getCurrentUser.bind(userController));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`User service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

export default app;