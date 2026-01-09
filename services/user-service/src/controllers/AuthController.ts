import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export class AuthController {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly REFRESH_TOKEN_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
    this.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, firstName, lastName, phone } = req.body;

      // Validation
      if (!username || !email || !password) {
        res.status(400).json({ error: 'Username, email, and password are required' });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        res.status(409).json({ 
          error: 'User already exists',
          field: existingUser.email === email ? 'email' : 'username'
        });
        return;
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName,
        phone
      });

      await user.save();

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse,
        tokens: {
          access: accessToken,
          refresh: refreshToken
        }
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ 
        error: 'Registration failed',
        details: error.message 
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({ error: 'Account is deactivated' });
        return;
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(200).json({
        message: 'Login successful',
        user: userResponse,
        tokens: {
          access: accessToken,
          refresh: refreshToken
        }
      });

    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Login failed',
        details: error.message 
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      // Verify refresh token
      const decoded: any = jwt.verify(refreshToken, this.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        res.status(401).json({ error: 'Invalid refresh token' });
        return;
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      res.status(200).json({
        tokens: {
          access: newAccessToken,
          refresh: newRefreshToken
        }
      });

    } catch (error: any) {
      console.error('Token refresh error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  private generateAccessToken(user: IUser): string {
    const payload = { 
      userId: user._id.toString(),
      email: user.email,
      username: user.username
    };
    
    const options = { expiresIn: this.JWT_EXPIRES_IN };
    
    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  private generateRefreshToken(user: IUser): string {
    const payload = { 
      userId: user._id.toString(),
      email: user.email
    };
    
    const options = { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN };
    
    return jwt.sign(payload, this.JWT_SECRET, options);
  }
}