import { Request, Response } from 'express';
import User, { IUser } from '../models/User';

export class UserController {
  // Get all users (admin only in production)
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};
      
      // Only active users by default
      if (req.query.includeInactive !== 'true') {
        filter.isActive = true;
      }

      // Search by username or email
      if (req.query.search) {
        filter.$or = [
          { username: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
          { firstName: { $regex: req.query.search, $options: 'i' } },
          { lastName: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const users = await User.find(filter, { password: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(filter);

      res.status(200).json({
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.params.id, { password: 0 });
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check if user is authorized to view this user
      if (req.user?.userId !== user._id.toString() && req.user?.userId !== req.params.id) {
        // In production, add role-based authorization here
        // For now, anyone can view any user (demo purposes)
      }

      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get current authenticated user
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await User.findById(req.user.userId, { password: 0 });
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new user (admin endpoint)
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, firstName, lastName, phone, isActive } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      const user = new User({ 
        username, 
        email, 
        password,
        firstName,
        lastName,
        phone,
        isActive: isActive !== undefined ? isActive : true
      });
      
      await user.save();
      
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.status(201).json({
        message: 'User created successfully',
        user: userResponse
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update user
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const updates = { ...req.body };
      
      // Prevent password updates through this endpoint
      delete updates.password;
      
      // Check if trying to update email or username that already exists
      if (updates.email || updates.username) {
        const existingUser = await User.findOne({
          $or: [
            { email: updates.email },
            { username: updates.username }
          ],
          _id: { $ne: userId }
        });
        
        if (existingUser) {
          res.status(400).json({ 
            error: 'Email or username already exists',
            field: existingUser.email === updates.email ? 'email' : 'username'
          });
          return;
        }
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updates,
        { 
          new: true, 
          runValidators: true,
          select: { password: 0 }
        }
      );
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.status(200).json({
        message: 'User updated successfully',
        user
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.status(200).json({ 
        message: 'User deleted successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Soft delete user (deactivate)
  async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true, select: { password: 0 } }
      );
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.status(200).json({
        message: 'User deactivated successfully',
        user
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Reactivate user
  async reactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: true },
        { new: true, select: { password: 0 } }
      );
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.status(200).json({
        message: 'User reactivated successfully',
        user
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}