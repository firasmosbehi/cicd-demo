# CI/CD Pipeline Frontend Client

A React-based frontend application that provides a unified dashboard for managing all microservices in the CI/CD pipeline ecosystem.

## Features

- **User Management**: Registration, login, and profile management
- **Dashboard**: Overview of system metrics and recent activity
- **Service Integration**: Seamless integration with all backend microservices
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live data synchronization
- **Authentication**: JWT-based secure authentication

## Tech Stack

- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **UI Components**: Custom Tailwind CSS
- **HTTP Client**: Axios with interceptors
- **Forms**: Formik with Yup validation
- **Notifications**: React Toastify

## Prerequisites

- Node.js 16+
- npm or yarn
- Backend microservices running

## Installation

```bash
cd frontend
npm install
```

## Environment Configuration

Create a `.env` file in the frontend directory:

```bash
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_ORDER_SERVICE_URL=http://localhost:3002
REACT_APP_PRODUCT_SERVICE_URL=http://localhost:3003
REACT_APP_NOTIFICATION_SERVICE_URL=http://localhost:3002
REACT_APP_ANALYTICS_SERVICE_URL=http://localhost:3003
```

## Development

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── users/
│   │   └── analytics/
│   ├── services/
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── orderService.ts
│   │   ├── productService.ts
│   │   └── analyticsService.ts
│   ├── store/
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── userSlice.ts
│   │   │   ├── orderSlice.ts
│   │   │   ├── productSlice.ts
│   │   │   └── analyticsSlice.ts
│   │   └── index.ts
│   ├── styles/
│   │   └── index.css
│   ├── utils/
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── tsconfig.json
```

## API Integration

The frontend connects to the following microservices:

### User Service (Port 3001)
- Authentication endpoints
- User profile management
- User administration

### Order Service (Port 3002)
- Order creation and management
- Order status tracking
- Payment processing

### Product Service (Port 3003)
- Product catalog browsing
- Inventory management
- Product search and filtering

### Notification Service (Port 3002)
- Notification preferences
- Alert management
- Communication settings

### Analytics Service (Port 3003)
- Dashboard metrics
- Real-time analytics
- Performance monitoring

## Authentication Flow

1. User submits login credentials
2. Frontend calls User Service authentication endpoint
3. JWT token and refresh token received
4. Tokens stored in localStorage
5. Axios interceptors automatically include auth header
6. Token refresh handled automatically on 401 responses

## State Management

Redux Toolkit is used for global state management with slices for:
- Authentication state
- User data
- Order information
- Product catalog
- Analytics data

## Styling

Tailwind CSS provides utility-first styling with custom components for:
- Responsive layouts
- Consistent design system
- Interactive elements
- Loading states

## Testing

Jest and React Testing Library are configured for:
- Component unit tests
- Integration tests
- Redux store testing
- API service mocking

## Deployment

The frontend can be deployed to:
- Static hosting (Netlify, Vercel)
- Docker containers
- Traditional web servers
- CDN distribution

Build command: `npm run build`
Output directory: `build/`

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

MIT License