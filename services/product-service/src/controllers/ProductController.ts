import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product, { IProduct } from '../models/Product';

export class ProductController {
  // Get all products with filtering and pagination
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = { isActive: true };

      // Category filter
      if (req.query.category) {
        filter.category = req.query.category;
      }

      // Subcategory filter
      if (req.query.subcategory) {
        filter.subcategory = req.query.subcategory;
      }

      // Brand filter
      if (req.query.brand) {
        filter.brand = req.query.brand;
      }

      // Price range filter
      if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) {
          filter.price.$gte = parseFloat(req.query.minPrice as string);
        }
        if (req.query.maxPrice) {
          filter.price.$lte = parseFloat(req.query.maxPrice as string);
        }
      }

      // Featured products only
      if (req.query.featured === 'true') {
        filter.isFeatured = true;
      }

      // Search query
      if (req.query.search) {
        filter.$text = { $search: req.query.search as string };
      }

      // Tags filter
      if (req.query.tags) {
        const tags = (req.query.tags as string).split(',');
        filter.tags = { $in: tags };
      }

      const sortOption = this.buildSortOption(req.query.sort as string);

      const products = await Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select('-reviews'); // Exclude reviews for list view

      const total = await Product.countDocuments(filter);

      res.status(200).json({
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get product by ID or slug
  async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const identifier = req.params.id;
      const filter = mongoose.Types.ObjectId.isValid(identifier) 
        ? { _id: identifier, isActive: true }
        : { slug: identifier, isActive: true };

      const product = await Product.findOne(filter);
      
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.status(200).json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new product
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = req.body;

      // Validate required fields
      const requiredFields = ['name', 'description', 'category', 'price'];
      for (const field of requiredFields) {
        if (!productData[field]) {
          res.status(400).json({ error: `${field} is required` });
          return;
        }
      }

      // Validate price
      if (productData.price <= 0) {
        res.status(400).json({ error: 'Price must be greater than 0' });
        return;
      }

      // Validate compare price
      if (productData.comparePrice && productData.comparePrice <= productData.price) {
        res.status(400).json({ error: 'Compare price must be greater than price' });
        return;
      }

      const product = new Product(productData);
      await product.save();

      res.status(201).json({
        message: 'Product created successfully',
        product
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update product
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const updates = req.body;
      
      // Prevent certain fields from being updated
      delete updates.productId;
      delete updates.averageRating;
      delete updates.totalReviews;
      delete updates.createdAt;

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.status(200).json({
        message: 'Product updated successfully',
        product
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete product (soft delete)
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.status(200).json({
        message: 'Product deleted successfully',
        product: {
          id: product._id,
          name: product.name
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get featured products
  async getFeaturedProducts(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const products = await Product.find({ 
        isFeatured: true, 
        isActive: true 
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-reviews');

      res.status(200).json({ products });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get products by category
  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;

      const products = await Product.find({ 
        category, 
        isActive: true 
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-reviews');

      res.status(200).json({ products });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Add product review
  async addReview(req: Request, res: Response): Promise<void> {
    try {
      const { userId, rating, comment } = req.body;
      const productId = req.params.id;

      if (!userId || !rating) {
        res.status(400).json({ error: 'userId and rating are required' });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      const product = await Product.findById(productId);
      
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      // Check if user already reviewed this product
      const existingReview = product.reviews.find(review => review.userId === userId);
      if (existingReview) {
        res.status(400).json({ error: 'User has already reviewed this product' });
        return;
      }

      product.reviews.push({
        userId,
        rating,
        comment,
        helpfulVotes: 0,
        createdAt: new Date()
      });

      await product.save();

      res.status(201).json({
        message: 'Review added successfully',
        product: {
          id: product._id,
          averageRating: product.averageRating,
          totalReviews: product.totalReviews
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get product categories
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      res.status(200).json({
        categories: categories.map(cat => ({
          name: cat._id,
          productCount: cat.count
        }))
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get product brands
  async getBrands(req: Request, res: Response): Promise<void> {
    try {
      const brands = await Product.distinct('brand', { 
        isActive: true, 
        brand: { $ne: null } 
      }).sort();

      res.status(200).json({ brands });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Search products
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q, category, brand, minPrice, maxPrice } = req.query;
      
      if (!q) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const filter: any = {
        isActive: true,
        $text: { $search: q as string }
      };

      if (category) filter.category = category;
      if (brand) filter.brand = brand;
      
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
      }

      const products = await Product.find(filter)
        .sort({ score: { $meta: 'textScore' } })
        .limit(50)
        .select('-reviews');

      res.status(200).json({ products });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Private helper method to build sort options
  private buildSortOption(sortParam?: string): any {
    switch (sortParam) {
      case 'price_asc':
        return { price: 1 };
      case 'price_desc':
        return { price: -1 };
      case 'name_asc':
        return { name: 1 };
      case 'name_desc':
        return { name: -1 };
      case 'rating':
        return { averageRating: -1 };
      case 'newest':
        return { createdAt: -1 };
      default:
        return { createdAt: -1 };
    }
  }
}