import express from 'express';
import { ProductController } from '../controllers/ProductController';

const router = express.Router();
const productController = new ProductController();

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'product-service',
    timestamp: new Date().toISOString()
  });
});

// Product catalog routes
router.get('/', productController.getAllProducts.bind(productController));
router.get('/search', productController.searchProducts.bind(productController));
router.get('/featured', productController.getFeaturedProducts.bind(productController));
router.get('/categories', productController.getCategories.bind(productController));
router.get('/brands', productController.getBrands.bind(productController));
router.get('/category/:category', productController.getProductsByCategory.bind(productController));
router.get('/:id', productController.getProduct.bind(productController));

// Product management routes (would be protected in production)
router.post('/', productController.createProduct.bind(productController));
router.put('/:id', productController.updateProduct.bind(productController));
router.delete('/:id', productController.deleteProduct.bind(productController));

// Reviews
router.post('/:id/reviews', productController.addReview.bind(productController));

export default router;