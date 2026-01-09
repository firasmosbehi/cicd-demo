import mongoose, { Document, Schema } from 'mongoose';

export interface IProductVariant {
  sku: string;
  name: string;
  price: number;
  stock: number;
  attributes?: Record<string, string>; // Color, Size, etc.
}

export interface IProductReview {
  userId: string;
  rating: number;
  comment?: string;
  helpfulVotes: number;
  createdAt: Date;
}

export interface IProduct extends Document {
  productId: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  variants: IProductVariant[];
  images: string[]; // URLs to images
  tags: string[];
  specifications?: Record<string, string>;
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  inventoryTracking: boolean;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  reviews: IProductReview[];
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const ProductVariantSchema = new Schema({
  sku: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  attributes: {
    type: Map,
    of: String
  }
});

const ProductReviewSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String,
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

const ProductSchema: Schema = new Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  subcategory: {
    type: String,
    index: true
  },
  brand: {
    type: String,
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  comparePrice: {
    type: Number,
    min: 0
  },
  cost: {
    type: Number,
    min: 0
  },
  variants: {
    type: [ProductVariantSchema],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    index: true,
    default: []
  },
  specifications: {
    type: Map,
    of: String
  },
  seoTitle: String,
  seoDescription: String,
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  inventoryTracking: {
    type: Boolean,
    default: true
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  reviews: {
    type: [ProductReviewSchema],
    default: []
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });

// Pre-save hook to generate product ID and slug
ProductSchema.pre<IProduct>('save', function(next) {
  if (!this.productId) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.productId = `PROD-${timestamp}-${random}`;
  }
  
  if (!this.slug) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  next();
});

// Calculate average rating before saving
ProductSchema.pre<IProduct>('save', function(next) {
  if (this.isModified('reviews')) {
    if (this.reviews.length > 0) {
      const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
      this.averageRating = totalRating / this.reviews.length;
      this.totalReviews = this.reviews.length;
    } else {
      this.averageRating = 0;
      this.totalReviews = 0;
    }
  }
  next();
});

export default mongoose.model<IProduct>('Product', ProductSchema);