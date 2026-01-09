# Product Service Documentation

## Overview
The Product Service is a JavaScript-based microservice responsible for product catalog management and inventory tracking. Built with Express.js and MongoDB, it provides comprehensive product information management including categories, pricing, and stock levels.

## Architecture
- **Language**: JavaScript (Node.js)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: Helmet.js, CORS protection
- **Port**: 3003

## API Endpoints

### Product Management
```
GET /api/products
POST /api/products
GET /api/products/:id
PUT /api/products/:id
DELETE /api/products/:id
```

### Category Management
```
GET /api/categories
POST /api/categories
GET /api/categories/:id
```

### Search and Filtering
```
GET /api/products/search?q=search-term
GET /api/products/category/:categoryId
GET /api/products/in-stock
```

### Health Check
```
GET /health
```

## Data Models

### Product Model
```javascript
interface Product {
  _id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  cost: number;
  category: string;
  brand: string;
  images: string[];
  specifications: Record<string, any>;
  inventory: {
    quantity: number;
    reserved: number;
    reorderPoint: number;
    maxStock: number;
  };
  attributes: {
    color: string;
    size: string;
    weight: number;
    dimensions: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}
```

### Category Model
```javascript
interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  image: string;
  sortOrder: number;
  isActive: boolean;
}
```

## Core Features

### Product Catalog Management
- CRUD operations for products
- Bulk product import/export
- Category hierarchy management
- Product variant support
- Image management and CDN integration

### Search and Discovery
- Full-text search capabilities
- Faceted filtering by category, price, brand
- Sorting by price, popularity, date
- Autocomplete suggestions
- Related product recommendations

### Inventory Management
- Real-time stock level tracking
- Low stock alerts and notifications
- Reserved inventory for pending orders
- Reorder point configuration
- Multi-warehouse support

### Pricing and Promotions
- Dynamic pricing rules
- Discount and promotion management
- Price history tracking
- Competitive pricing analysis
- Currency conversion support

## Security Features
- Helmet.js security headers
- CORS protection
- Input validation and sanitization
- Rate limiting for API endpoints
- Authentication for admin operations

## Environment Variables
```bash
PORT=3003
MONGODB_URI=mongodb://localhost:27017/productdb
JWT_SECRET=your-jwt-secret
NODE_ENV=development|production
IMAGE_STORAGE_PATH=/var/images
CDN_BASE_URL=https://cdn.example.com
SEARCH_INDEX_NAME=products_index
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
```

## Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3003
CMD ["npm", "start"]
```

## Integration Points
- **Order Service**: Product information and inventory levels
- **User Service**: Product reviews and ratings
- **Notification Service**: Low stock alerts and promotions
- **Analytics Service**: Product performance tracking
- **Search Service**: Elasticsearch integration

## Testing Strategy
- Unit tests for business logic
- Integration tests for database operations
- API contract testing
- Performance testing for search operations
- Load testing for catalog browsing

## Monitoring and Observability
- Health check endpoint at `/health`
- Product view and search analytics
- Inventory level monitoring
- Performance metrics collection
- Error rate tracking

## Scalability Considerations
- Database indexing for search performance
- Caching layer for popular products
- CDN integration for images
- Horizontal scaling support
- Read replica configuration for queries

## Deployment Best Practices
- Zero-downtime deployment strategy
- Database migration handling
- Cache warming procedures
- Health check probe configuration
- Resource limit definitions