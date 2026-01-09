import express from 'express';
import { OrderController } from '../controllers/OrderController';

const router = express.Router();
const orderController = new OrderController();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'order-service',
    timestamp: new Date().toISOString()
  });
});

// Order management routes
router.get('/', orderController.getAllOrders.bind(orderController));
router.get('/:id', orderController.getOrderById.bind(orderController));
router.post('/', orderController.createOrder.bind(orderController));
router.put('/:id/status', orderController.updateOrderStatus.bind(orderController));
router.put('/:id/payment-status', orderController.updatePaymentStatus.bind(orderController));
router.delete('/:id', orderController.cancelOrder.bind(orderController));

// User-specific routes
router.get('/user/:userId', orderController.getUserOrders.bind(orderController));

// Statistics
router.get('/stats/summary', orderController.getOrderStats.bind(orderController));

export default router;