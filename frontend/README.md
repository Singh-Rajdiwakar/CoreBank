# NexPay Bank Frontend
A futuristic, next-generation digital banking web application frontend.

## Tech Stack
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The application will run on `http://localhost:3000` with proxy to `http://localhost:8080`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── assets/          # Images, fonts, static resources
├── components/      # Reusable components
│   ├── common/      # Alert, Button, Card, Input, Badge, Modal, etc.
│   ├── layout/      # Sidebar, Navbar, DashboardLayout, ProtectedRoute
│   └── charts/      # BarChart, LineChart, PieChart wrappers
├── context/         # React Context (Auth, Notifications)
├── hooks/           # Custom hooks (useAuth, useApi, useDebounce)
├── pages/           # Page components
│   ├── Home/
│   ├── Login/
│   ├── admin/
│   ├── manager/
│   ├── employee/
│   ├── auditor/
│   └── customer/
├── services/        # API integration
│   ├── api.js       # Axios instance with interceptors
│   └── endpoints/   # Organized API endpoints
├── utils/           # Utility functions (formatting, UUID, etc.)
├── App.jsx          # Main app component with routing
└── index.css        # Global styles
```

## Features

### 1. Home/Landing Page
- Animated hero section with typewriter effect
- Stats counters
- Feature showcase
- Security highlights
- Testimonial carousel
- Responsive footer

### 2. Login Page
- Split-screen layout
- Animated form fields
- Quick login credentials for demo
- Animated background

### 3. Dashboards
- **Admin Dashboard**: System metrics, branch management, employee management, reports
- **Manager Dashboard**: Pending transfer approvals
- **Employee Dashboard**: Customer management, fraud cases
- **Auditor Dashboard**: Audit logs with date range filters
- **Customer Dashboard**: Accounts, transfers, cards, deposits, loans, disputes, profile

### 4. Components
- **Glassmorphism Cards**: Semi-transparent cards with blur effect
- **Animated Buttons**: Hover and tap animations
- **Neon Glows**: Electric blue/cyan neon effects
- **Loading States**: Skeleton loaders with shimmer effect
- **Form Inputs**: Floating labels, glowing borders on focus
- **Charts**: Bar, line, and pie charts with dark theme
- **Modals**: Smooth animations with backdrop blur
- **Badges**: Color-coded status indicators
- **Notifications**: Toast messages with animations

### 5. Features
- **Protected Routes**: Role-based access control
- **API Integration**: Structured endpoint organization
- **Error Handling**: Toast notifications for all errors
- **Loading States**: Skeleton loaders for data-fetching
- **Currency Formatting**: Indian rupee format (₹1,23,456.78)
- **Date Formatting**: DD MMM YYYY format
- **Session Management**: Automatic token refresh and logout
- **Responsive Design**: Mobile-first approach

## API Configuration

The frontend is configured to proxy API calls to `http://localhost:8080/api`

Base URL: `http://localhost:8080`

### Authentication
All requests include `Authorization: Bearer {token}` header automatically.

### Token Refresh
On 401 responses, the app automatically attempts to refresh the token using the refresh endpoint.

## Styling

### Theme Colors
- Dark: `#020817`, `#0a0f1e`
- Neon Blue: `#0ea5e9`
- Neon Cyan: `#06b6d4`
- Gold: `#f59e0b`

### Fonts
- **Orbitron**: Headings (futuristic)
- **Sora**: Body text (clean, modern)

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=NexPay Bank
```

## Browser Support

Chrome, Firefox, Safari, Edge (latest versions)

## Performance Optimizations

- Code splitting with React Router
- Lazy loading for images
- Skeleton loaders for better perceived performance
- Optimized animations with Framer Motion
- Memoized components for expensive computations

## Contributing

1. Follow the project structure
2. Use camelCase for variables and functions
3. Use PascalCase for React components
4. Implement proper error handling
5. Add loading states for async operations

## License

Proprietary - NexPay Bank
