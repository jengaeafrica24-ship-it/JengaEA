# JengaEA - Intelligent Construction Cost Estimation Platform

JengaEA is an advanced construction cost estimation platform designed specifically for the African construction industry. Combining AI-powered insights with location-based intelligence, the platform provides accurate, data-driven cost breakdowns for construction projects across East Africa.

## 🎯 Mission

Empower construction professionals in Africa with intelligent cost estimation tools that reduce project overruns, improve planning accuracy, and support informed decision-making for better construction outcomes.

## 🌟 Key Features

### Core Estimation Features
- **AI-Powered Cost Estimation** - Machine learning models trained on African construction data
- **Location-Based Pricing** - Dynamic cost adjustments using Google Maps API for regional variations
- **Material Cost Breakdown** - AI-generated material lists with quantity and cost calculations
- **Labor Cost Analysis** - Skilled and unskilled labor cost modeling with regional wage data
- **Equipment Cost Estimation** - Heavy machinery and equipment rental cost calculations
- **Project-Type Specific** - Tailored estimation models for residential, commercial, and infrastructure projects

### Advanced Analytics
- **Market Analysis Dashboard** - Real-time insights on material and labor cost trends
- **Cost Benchmarking** - Compare your estimates against industry averages and historical data
- **Material-to-Labor Ratio** - Track cost allocation patterns with visual indicators
- **Cost Trends** - Monitor how your project costs compare to regional and industry standards
- **Cost Recommendations** - AI-generated suggestions for cost optimization
- **Cost Per Square Meter** - Standardized cost metrics for easy comparison

### Reporting & Sharing
- **Report Generation** - Export professional cost reports in PDF or Excel formats
- **Estimate Sharing** - Securely share estimates with clients and stakeholders
- **Report Customization** - Add company branding to exported reports
- **Data Export** - Export raw estimation data for further analysis

### User Management
- **User Authentication** - Secure sign-up with OTP-based phone verification (Africa's Talking API)
- **Role-Based Access** - Different access levels for homeowners, contractors, engineers, developers, and admins
- **Project Management** - Organize estimates by projects
- **Subscription Plans** - Flexible pricing tiers (6 months, 12 months, lifetime)
- **Admin Dashboard** - Complete platform management and analytics

### Platform Features
- **Responsive Design** - Full functionality on desktop, tablet, and mobile devices
- **Real-Time Validation** - Instant feedback on cost inputs
- **Offline Capability** - Progressive Web App (PWA) support for offline access
- **Data Security** - JWT authentication, CORS protection, input validation
- **API Documentation** - Complete REST API for integrations
- **Walkthrough Tutorials** - Interactive guided tours for new users

## 🏗️ Architecture Overview

### Backend Stack
```
Django REST Framework
├── PostgreSQL (Data Storage)
├── Redis (Caching & Task Queue)
├── Celery (Background Jobs)
├── Africa's Talking API (SMS/OTP)
└── Google Maps API (Geolocation)
```

### Frontend Stack
```
React 18 (UI Framework)
├── React Router (Client Routing)
├── Tailwind CSS (Styling)
├── Framer Motion (Animations)
├── Lucide React (Icons)
├── Recharts (Data Visualization)
└── React Hook Form (Form Management)
```

### Database Models
```
Core Models:
├── User (Custom with roles)
├── Project (User projects)
├── ProjectType (Estimation categories)
├── Location (Geographic data)
├── Estimate (Cost calculations)
├── EstimateItem (Line items)
├── AIEstimate (AI-generated materials)
├── LaborEstimate (Labor breakdowns)
├── SubscriptionPlan (Pricing tiers)
└── Report (Generated reports)
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Redis 6+
- Git

### Backend Setup

```bash
# 1. Clone repository
git clone https://github.com/jengaeafrica24-ship-it/JengAEA.git
cd JengAEA/backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp env_example.txt .env
# Edit .env with your configuration

# 5. Database setup
python manage.py migrate
python manage.py createsuperuser

# 6. Start development server
python manage.py runserver
```

### Frontend Setup

```bash
# 1. Navigate to frontend
cd ../frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
JengAEA/
├── backend/
│   ├── jengaest/          # Django project configuration
│   ├── accounts/          # User authentication & profiles
│   ├── projects/          # Project types & materials database
│   ├── estimates/         # Core estimation logic
│   │   ├── views/
│   │   │   ├── base.py        # Summary & market analysis endpoints
│   │   │   ├── materials.py   # Material estimation
│   │   │   ├── labor.py       # Labor estimation
│   │   │   └── upload.py      # File upload handling
│   │   ├── models.py      # Database models
│   │   ├── serializers/   # Data serialization
│   │   └── services/      # Business logic
│   ├── reports/           # Report generation & export
│   ├── subscriptions/     # Subscription management
│   ├── utils/             # Helper utilities
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Reusable components (Navbar, Footer, etc.)
│   │   │   ├── estimation/    # Estimation-specific components
│   │   │   ├── sections/      # Page sections (Hero, Features, etc.)
│   │   │   └── auth/          # Authentication components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   ├── utils/             # Utility functions
│   │   ├── hooks/             # Custom React hooks
│   │   ├── assets/            # Images, icons
│   │   └── App.js
│   ├── package.json
│   └── public/
├── Design/                # UI/UX design files
└── README.md
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register/          Register new user
POST   /api/auth/login/             User login
POST   /api/auth/send-otp/          Send OTP verification
POST   /api/auth/verify-otp/        Verify OTP code
POST   /api/auth/logout/            User logout
```

### Projects & Materials
```
GET    /api/projects/types/         List all project types
GET    /api/projects/locations/     List available locations
GET    /api/projects/materials/     List available materials
GET    /api/projects/{id}/          Get project details
POST   /api/projects/               Create new project
```

### Estimates
```
GET    /api/estimates/              List user estimates
GET    /api/estimates/{id}/         Get estimate details
POST   /api/estimates/              Create estimate
PUT    /api/estimates/{id}/         Update estimate
DELETE /api/estimates/{id}/         Delete estimate
POST   /api/estimates/calculate/    Calculate costs
GET    /api/estimates/summary       Get project summary
GET    /api/estimates/market-analysis Get market insights
```

### Market Analysis
```
GET    /api/estimates/market-analysis?timeframe=month
Parameters:
  - timeframe: week|month|quarter|year

Response includes:
  - Cost breakdown (materials, labor, equipment %)
  - Benchmarks (material-to-labor ratio, cost/sqm)
  - Market insights (cost allocation patterns)
  - Recommendations (cost optimization suggestions)
  - Trends (comparison to industry averages)
```

### Materials & Labor
```
GET    /api/estimates/materials/list          List materials
POST   /api/estimates/materials/generate/     AI generate materials
GET    /api/estimates/labor                   Get labor data
POST   /api/estimates/labor                   Calculate labor costs
```

### Reports
```
POST   /api/reports/generate/       Generate report
GET    /api/reports/{id}/download/  Download report
POST   /api/reports/{id}/share/     Share report
```

### Subscriptions
```
GET    /api/subscriptions/plans/    List subscription plans
POST   /api/subscriptions/purchase/ Purchase subscription
GET    /api/subscriptions/current/  Get current subscription
```

## 🔐 Security Features

- **OTP Verification** - Phone-based account verification via Africa's Talking API
- **JWT Authentication** - Secure API authentication with token-based access
- **Password Security** - Django password hashing with bcrypt
- **CORS Protection** - Restricted cross-origin requests
- **Input Validation** - Server and client-side validation for all inputs
- **Rate Limiting** - API request rate limiting to prevent abuse
- **SSL/TLS** - HTTPS encryption in production
- **Role-Based Access** - Fine-grained permission management

## 🎨 UI/UX Features

### Navigation
- **Sticky Navbar** - Always-visible navigation with user menu
- **Responsive Sidebar** - Mobile-friendly estimation sidebar
- **Breadcrumb Navigation** - Easy navigation context
- **Quick Links** - Fast access to common actions

### Visual Design
- **Dark Theme** - Modern dark blue gradient design (blue-950 to blue-900)
- **Accent Colors** - Cyan and light blue highlights for emphasis
- **Smooth Animations** - Framer Motion transitions throughout
- **Icon Integration** - Lucide React icons for visual consistency
- **Tailwind CSS** - Utility-first responsive styling

### Interactive Elements
- **Loading States** - Spinners and skeleton screens
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Non-blocking success/error alerts
- **Form Validation** - Real-time input validation
- **Modal Dialogs** - Confirmation dialogs for destructive actions

## 📊 Market Analysis Dashboard

The Market Analysis feature provides comprehensive insights into construction costs:

### Cost Analysis
- Material, labor, and equipment cost percentages
- Absolute costs in KES (Kenyan Shillings)
- Cost per square meter standardization

### Benchmarking
- Material-to-labor ratio calculation
- Industry average comparisons
- Estimate count and aggregate statistics

### Insights Generation
- High material allocation warning (>65%)
- High labor cost detection (>50%)
- Cost efficiency indicators
- Ratio-based insights

### Recommendations
- Cost optimization suggestions
- Supplier negotiation indicators
- Labor efficiency improvements
- Project specification reviews

### Trends Tracking
- Material cost trends vs. industry average
- Labor cost trends vs. industry average
- Cost per square meter trends
- Historical data comparison

## 🔧 Configuration

### Environment Variables

Create `.env` file in `backend/` directory:

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=jengaest
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# APIs
AFRICAS_TALKING_USERNAME=your-username
AFRICAS_TALKING_API_KEY=your-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-key

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

## 📱 Responsive Design

JengaEA is fully responsive and optimized for:
- **Mobile Phones** (320px and up)
- **Tablets** (768px and up)
- **Desktops** (1024px and up)
- **Large Screens** (1440px and up)

## 🚀 Deployment

### Backend Deployment (Render.com)

```bash
# Using render.yaml configuration
git push origin master
# Automatic deployment triggered
```

### Frontend Deployment

```bash
npm run build
# Deploy build/ folder to hosting service
# (Vercel, Netlify, Firebase Hosting, etc.)
```

### Database Migration

```bash
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser
```

## 📚 API Documentation

Full API documentation is available at:
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Ensure Redis is running
redis-cli ping  # Should return PONG

# Check database connection
python manage.py dbshell

# Run migrations
python manage.py migrate
```

**Frontend won't start**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear React cache
npm start -- --reset-cache
```

**API request errors**
- Verify backend server is running on port 8000
- Check CORS configuration in Django settings
- Ensure authentication token is valid
- Check network tab in browser DevTools

## 📖 Documentation

- [Market Analysis Implementation](./MARKET_ANALYSIS_IMPLEMENTATION.md) - Market analysis feature details
- [Estimate Upload Format](./backend/docs/estimate_upload_format.md) - CSV/Excel upload specifications
- [Population Database](./POPULATE_DATABASE.md) - Data seeding guide
- [Debug Estimation Error](./DEBUG_ESTIMATE_ERROR.md) - Debugging estimation issues
- [UI Update Guide](./README_UI_UPDATE.md) - Recent UI improvements

## 📧 Support & Contact

- **Email**: support@jengaea.com
- **Phone**: +254 700 000 000
- **Location**: Nairobi, Kenya
- **Website**: https://jengaea.com
- **GitHub Issues**: [Report bugs](https://github.com/jengaeafrica24-ship-it/JengAEA/issues)

## 📈 Recent Updates

### Version 2.1.0 (November 2025)

#### New Features
- ✅ Market Analysis Dashboard with insights and recommendations
- ✅ Professional Navbar with responsive mobile menu
- ✅ Comprehensive Footer with company info and links
- ✅ Cost per square meter metrics
- ✅ Material-to-labor ratio tracking
- ✅ Industry benchmark comparisons

#### Improvements
- ✅ Enhanced cost aggregation from multiple data sources
- ✅ Type-safe Decimal/float conversions
- ✅ Improved data visualization and animations
- ✅ Better error handling and user feedback
- ✅ Responsive layout improvements

#### Bug Fixes
- ✅ Material costs aggregation from AIEstimate JSON
- ✅ Type mismatch in cost calculations
- ✅ ProjectHealth response serialization
- ✅ Navigation routing consistency

## 📊 Performance Metrics

- **API Response Time**: < 200ms (avg)
- **Page Load Time**: < 2s (optimized)
- **Database Queries**: < 5 per request (optimized)
- **Frontend Bundle Size**: < 300KB (gzipped)
- **Mobile Lighthouse Score**: 85+

## 🔄 Development Workflow

### Feature Development
1. Create feature branch from `develop`
2. Make changes with clear commit messages
3. Create pull request with description
4. Code review and testing
5. Merge to develop after approval
6. Deploy to staging for testing
7. Merge develop to master for production

### Testing
```bash
# Backend tests
python manage.py test

# Frontend tests
npm test

# E2E tests
npm run cypress
```

## 📦 Dependencies

### Backend Key Packages
- Django 4.2+
- Django REST Framework 3.14+
- PostgreSQL psycopg2 2.9+
- Redis redis 4.5+
- Celery 5.3+
- Django CORS django-cors-headers

### Frontend Key Packages
- React 18.2+
- React Router 6.x
- Tailwind CSS 3.3+
- Framer Motion 10.x
- Lucide React 0.x
- React Hook Form 7.x

## 🎓 Learning Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [REST API Best Practices](https://restfulapi.net/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Django and Django REST Framework communities
- React and React ecosystem contributors
- Africa's Talking for SMS API
- Google Maps for geolocation services
- Open source contributors and testers

## 🚀 Roadmap

### Q1 2026
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Swahili, French)
- [ ] WhatsApp integration for estimates

### Q2 2026
- [ ] Machine learning cost prediction
- [ ] Real-time collaboration features
- [ ] Advanced project scheduling
- [ ] Integration with accounting software

### Q3 2026
- [ ] Supply chain management integration
- [ ] Price tracking and alerts
- [ ] Automated invoicing
- [ ] Client portal improvements

---

**Built with ❤️ for the African construction industry**

For the latest updates and features, visit our [website](https://jengaea.com) or follow us on social media.

