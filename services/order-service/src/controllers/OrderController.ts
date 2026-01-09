import { Request, Response } from 'express';
import Order, { IOrder, IOrderItem } from '../models/Order';

export class OrderController {
  // Get all orders with filtering and pagination
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};

      // Filter by user
      if (req.query.userId) {
        filter.userId = req.query.userId;
      }

      // Filter by status
      if (req.query.status) {
        filter.status = req.query.status;
      }

      // Filter by date range
      if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate) {
          filter.createdAt.$gte = new Date(req.query.startDate as string);
        }
        if (req.query.endDate) {
          filter.createdAt.$lte = new Date(req.query.endDate as string);
        }
      }

      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments(filter);

      res.status(200).json({
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get order by ID
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      // In production, check if user is authorized to view this order
      // if (req.user?.userId !== order.userId) {
      //   res.status(403).json({ error: 'Not authorized to view this order' });
      //   return;
      // }

      res.status(200).json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new order
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { userId, items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;

      // Validate required fields
      if (!userId || !items || !shippingAddress || !paymentMethod) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Validate items array
      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'Items array is required and cannot be empty' });
        return;
      }

      // Validate each item
      for (const item of items) {
        if (!item.productId || !item.productName || !item.quantity || !item.price) {
          res.status(400).json({ error: 'Each item must have productId, productName, quantity, and price' });
          return;
        }
        item.subtotal = item.quantity * item.price;
      }

      // Calculate total amount
      const totalAmount = items.reduce((total: number, item: IOrderItem) => total + item.subtotal, 0);

      const order = new Order({
        userId,
        items,
        totalAmount,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentMethod,
        notes
      });

      await order.save();

      res.status(201).json({
        message: 'Order created successfully',
        order
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update order status
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const order = await Order.findById(req.params.id);
      
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      // Status transition validation
      const statusTransitions: Record<string, string[]> = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': ['delivered', 'cancelled'],
        'delivered': ['refunded'],
        'cancelled': [],
        'refunded': []
      };

      if (!statusTransitions[order.status].includes(status)) {
        res.status(400).json({ 
          error: `Cannot transition from ${order.status} to ${status}`,
          allowedTransitions: statusTransitions[order.status]
        });
        return;
      }

      // Update timestamps for specific status changes
      const timestampUpdates: any = {};
      if (status === 'confirmed') timestampUpdates.confirmedAt = new Date();
      if (status === 'shipped') timestampUpdates.shippedAt = new Date();
      if (status === 'delivered') timestampUpdates.deliveredAt = new Date();
      if (status === 'cancelled') timestampUpdates.cancelledAt = new Date();

      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { status, ...timestampUpdates },
        { new: true }
      );

      res.status(200).json({
        message: 'Order status updated successfully',
        order: updatedOrder
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update payment status
  async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { paymentStatus } = req.body;
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

      if (!validPaymentStatuses.includes(paymentStatus)) {
        res.status(400).json({ error: 'Invalid payment status' });
        return;
      }

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { paymentStatus },
        { new: true }
      );

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.status(200).json({
        message: 'Payment status updated successfully',
        order
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Cancel order
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      // Only allow cancellation of pending or confirmed orders
      if (!['pending', 'confirmed'].includes(order.status)) {
        res.status(400).json({ 
          error: 'Order cannot be cancelled',
          currentStatus: order.status,
          allowedStatuses: ['pending', 'confirmed']
        });
        return;
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { 
          status: 'cancelled',
          cancelledAt: new Date()
        },
        { new: true }
      );

      res.status(200).json({
        message: 'Order cancelled successfully',
        order: updatedOrder
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get user's orders
  async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments({ userId });

      res.status(200).json({
        orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get order statistics
  async getOrderStats(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const matchCondition = {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      };

      const stats = await Order.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            averageOrderValue: { $avg: '$totalAmount' },
            statusBreakdown: {
              $push: '$status'
            }
          }
        }
      ]);

      // Count status breakdown
      const statusCounts: Record<string, number> = {};
      if (stats[0]?.statusBreakdown) {
        stats[0].statusBreakdown.forEach((status: string) => {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
      }

      res.status(200).json({
        stats: {
          totalOrders: stats[0]?.totalOrders || 0,
          totalRevenue: stats[0]?.totalRevenue || 0,
          averageOrderValue: stats[0]?.averageOrderValue || 0,
          statusBreakdown: statusCounts
        },
        period: {
          startDate,
          endDate
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}