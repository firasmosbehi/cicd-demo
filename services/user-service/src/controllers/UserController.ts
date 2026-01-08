import { Request, Response } from 'express';
import User, { IUser } from '../models/User';

export class UserController {
  // Get all users
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.find({}, { password: 0 }); // Exclude password
      res.status(200).json(users);
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
      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new user
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      const user = new User({ username, email, password });
      await user.save();
      
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.status(201).json(userResponse);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update user
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const updates = req.body;
      delete updates.password; // Don't allow password updates through this endpoint
      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.status(200).json(userResponse);
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
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}