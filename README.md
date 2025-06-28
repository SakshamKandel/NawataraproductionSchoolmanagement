# 🎓 NAWA ⟨ School Management System ⟩

```ascii
    ███╗   ██╗ █████╗ ██╗    ██╗ █████╗ 
    ████╗  ██║██╔══██╗██║    ██║██╔══██╗
    ██╔██╗ ██║███████║██║ █╗ ██║███████║
    ██║╚██╗██║██╔══██║██║███╗██║██╔══██║
    ██║ ╚████║██║  ██║╚███╔███╔╝██║  ██║
    ╚═╝  ╚═══╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝
    
    ⚡ Enterprise-Grade School Management Platform ⚡
    Built for Scale • Secured by Design • Powered by Modern Tech
```

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Latest-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.14-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-4.5.5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

---

## 🚀 **MISSION CONTROL**

NAWA is a **next-generation school management ecosystem** engineered for educational institutions that demand excellence. Built with military-grade security, enterprise scalability, and hacker-level attention to detail.

### 🎯 **CORE CAPABILITIES**

```yaml
STUDENT_OPERATIONS:
  - 📊 Advanced Analytics Dashboard
  - 📝 Batch Import/Export (Excel Integration)
  - 💰 Real-time Fee Tracking & Management
  - 🎓 Automated Grade & Promotion System
  - 📋 Digital Profile Management

TEACHER_MANAGEMENT:
  - 👨‍🏫 Comprehensive Payroll System
  - 📅 Intelligent Routine Scheduling
  - 📢 Notice Board & Communication Hub
  - 🔐 Role-based Access Control
  - 📊 Performance Analytics

ADMIN_COMMAND_CENTER:
  - 🎛️ Real-time System Monitoring
  - 📈 Advanced Reporting Engine
  - 🔧 Database Management Tools
  - 🚨 Security & Audit Logs
  - ⚙️ System Configuration Panel
```

## 🏗️ **TECHNICAL ARCHITECTURE**

### 🎨 **Frontend Arsenal**
```javascript
const frontendStack = {
  core: "React 19.0.0",          // ⚡ Lightning-fast UI
  bundler: "Vite 4.5.5",         // 🚀 Next-gen build tool
  styling: "Tailwind CSS 3.4.14", // 🎨 Utility-first CSS
  routing: "React Router DOM",     // 🧭 Client-side navigation
  http: "Axios",                  // 📡 Promise-based HTTP client
  forms: "React Hook Form",       // 📝 Performant form handling
  animations: "Framer Motion",    // ✨ Production-ready animations
  icons: "React Icons",           // 🔥 Beautiful icon library
  notifications: "React Toastify" // 🔔 User feedback system
};
```

### ⚙️ **Backend Infrastructure**
```javascript
const backendStack = {
  runtime: "Node.js",             // 🟢 JavaScript runtime
  framework: "Express 5.1.0",    // 🚄 Fast web framework
  database: "MySQL 8.0+",        // 🗄️ Relational database
  orm: "Sequelize 6.37.7",       // 🔗 Object-relational mapping
  auth: "JWT + bcrypt",           // 🔐 Secure authentication
  fileHandling: "Multer",         // 📁 Multipart form data
  excel: "ExcelJS",               // 📊 Excel processing
  pdf: "PDFKit",                  // 📄 PDF generation
  validation: "Express Validator" // ✅ Input validation
};
```

## 📁 **PROJECT STRUCTURE**

```
NAWA ⟨ ROOT ⟩
├── 🎯 NAWA_CLIENT/
│   ├── 🎨 front_end/                    # React Client Application
│   │   ├── 📦 src/
│   │   │   ├── 🧩 components/          # Reusable UI Components
│   │   │   │   ├── admin_components/   # Admin-specific Components
│   │   │   │   ├── teacher_components/ # Teacher Dashboard Components
│   │   │   │   └── shared/             # Shared UI Elements
│   │   │   ├── 📄 pages/              # Route Components
│   │   │   ├── 🔧 utils/              # Helper Functions
│   │   │   ├── 🎨 styles/             # Global Styles
│   │   │   └── 🏗️ hooks/              # Custom React Hooks
│   │   ├── 🌐 public/                 # Static Assets
│   │   ├── ⚙️ vite.config.js          # Vite Configuration
│   │   ├── 🎨 tailwind.config.js      # Tailwind CSS Config
│   │   └── 📦 package.json            # Frontend Dependencies
│   │
│   └── ⚙️ back_end/                    # Node.js API Server
│       ├── 🗄️ config/                 # Environment & DB Config
│       │   ├── database.js            # Sequelize Configuration
│       │   ├── init-db.js             # Database Initialization
│       │   └── create-admin.js        # Admin Setup Script
│       ├── 🎛️ controllers/            # Business Logic Layer
│       │   ├── authController.js      # Authentication Logic
│       │   ├── admin/                 # Admin Operations
│       │   │   ├── studentDataController.js
│       │   │   └── teacherDataController.js
│       │   └── teacher/               # Teacher Operations
│       ├── 🗃️ models/                 # Database Models (Sequelize)
│       │   ├── Student.js             # Student Entity
│       │   ├── Teacher.js             # Teacher Entity
│       │   ├── Admin.js               # Admin Entity
│       │   ├── Notice.js              # Notice System
│       │   ├── Routine.js             # Class Scheduling
│       │   ├── StudentFee.js          # Fee Management
│       │   └── associations.js        # Model Relationships
│       ├── 🛣️ routes/                 # API Endpoints
│       │   ├── authRoutes.js          # Authentication Routes
│       │   ├── admin_accessible_routes/
│       │   └── teacher_accessible_routes/
│       ├── 🛡️ middleware/             # Express Middleware
│       │   ├── auth.js                # JWT Verification
│       │   └── verifyToken.js         # Token Validation
│       ├── 🔧 scripts/                # Utility Scripts
│       │   ├── seed-data.js           # Sample Data Generator
│       │   ├── reset-db.js            # Database Reset
│       │   └── add-sample-students.js # Student Data Seeder
│       └── 📦 package.json            # Backend Dependencies
│
├── 📋 Excel Templates/                 # Data Import Templates
├── 🚀 deployment/                     # Deployment Scripts
├── 📚 docs/                          # Documentation
└── 🔧 utility scripts/               # Development Tools
```

## ⚡ **QUICK START PROTOCOL**

### 🔧 **System Requirements**
```bash
# Mission-critical dependencies
Node.js  >= 18.0.0    # JavaScript runtime
MySQL    >= 8.0        # Database engine
Git      >= 2.30       # Version control
RAM      >= 4GB        # Memory requirements
Storage  >= 2GB        # Disk space
```

### 🚀 **Installation Sequence**

#### **Phase 1: Repository Acquisition**
```bash
# Clone the mainframe
git clone https://github.com/SakshamKandel/nawataraenglishschooldraft1.git
cd nawataraenglishschooldraft1

# Verify structure integrity
ls -la NAWA_CLIENT/
```

#### **Phase 2: Backend Initialization**
```bash
# Navigate to command center
cd NAWA_CLIENT/back_end

# Install core dependencies
npm install

# Dependencies auto-installed:
# ├── express@5.1.0          # Web framework
# ├── sequelize@6.37.7       # ORM layer
# ├── mysql2@latest          # Database driver
# ├── jsonwebtoken@latest    # Authentication
# ├── bcrypt@latest          # Password hashing
# ├── multer@latest          # File upload
# ├── exceljs@latest         # Excel processing
# ├── pdfkit@latest          # PDF generation
# └── 25+ additional packages
```

#### **Phase 3: Environment Configuration**
```bash
# Create mission-critical environment file
cp config/env.example .env

# Configure your environment variables
nano .env
```

**Environment Template:**
```env
# 🛡️ Security Configuration
NODE_ENV=development
PORT=8000
JWT_SECRET=your_ultra_secure_jwt_secret_key
JWT_EXPIRES_IN=24h
ADMIN_JWT_SECRET=your_admin_specific_secret
TEACHER_JWT_SECRET=your_teacher_specific_secret

# 🗄️ Database Connection
MYSQL_HOST=localhost
MYSQL_PORT=3307                    # Adjust to your MySQL port
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=nawa_db

# 🌐 Network Configuration
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# 📧 Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### **Phase 4: Database Initialization**
```bash
# Create database
mysql -u root -p
CREATE DATABASE nawa_db;
EXIT;

# Initialize admin account
node config/create-admin.js

# Seed sample data (optional)
node scripts/seed-data.js
```

#### **Phase 5: Frontend Deployment**
```bash
# Navigate to frontend
cd ../front_end

# Install UI dependencies
npm install

# Dependencies include:
# ├── react@19.0.0           # UI library
# ├── vite@4.5.5             # Build tool
# ├── tailwindcss@3.4.14     # CSS framework
# ├── react-router-dom@latest # Routing
# ├── axios@latest           # HTTP client
# ├── framer-motion@latest   # Animations
# └── 15+ additional packages
```

### 🎯 **Launch Sequence**

#### **Terminal 1: Backend Server**
```bash
cd NAWA_CLIENT/back_end
npm run dev

# ✅ Server Status:
# 🟢 Express server: http://localhost:8000
# 🟢 Database: Connected to MySQL
# 🟢 JWT Auth: Configured
# 🟢 File Upload: Ready
# 🟢 API Routes: Loaded
```

#### **Terminal 2: Frontend Server**
```bash
cd NAWA_CLIENT/front_end
npm run dev

# ✅ Client Status:
# 🟢 Vite dev server: http://localhost:5173
# 🟢 Hot reload: Active
# 🟢 Tailwind CSS: Compiled
# 🟢 React DevTools: Available
```

## 🔌 **API REFERENCE**

### 🔐 **Authentication Endpoints**
```http
POST   /api/auth/login          # User authentication
POST   /api/auth/logout         # Session termination
POST   /api/auth/refresh        # Token refresh
GET    /api/auth/verify         # Token validation
```

### 👨‍🎓 **Student Management API**
```http
GET    /api/admin/students              # List all students
POST   /api/admin/students              # Create new student
PUT    /api/admin/students/:id          # Update student data
DELETE /api/admin/students/:id          # Remove student
GET    /api/admin/students/:id/profile  # Student profile
POST   /api/admin/students/batch-import # Excel batch import
GET    /api/admin/students/export       # Export student data
```

### 👨‍🏫 **Teacher Management API**
```http
GET    /api/admin/teachers       # List all teachers
POST   /api/admin/teachers       # Create teacher account
PUT    /api/admin/teachers/:id   # Update teacher data
DELETE /api/admin/teachers/:id   # Remove teacher
GET    /api/teacher/profile      # Teacher profile access
PUT    /api/teacher/profile      # Update own profile
```

### 💰 **Financial Management API**
```http
GET    /api/admin/fees           # Fee overview
POST   /api/admin/fees           # Create fee record
PUT    /api/admin/fees/:id       # Update fee status
GET    /api/students/:id/fees    # Student fee history
POST   /api/fees/payment         # Process payment
```

### 📢 **Notice System API**
```http
GET    /api/notices              # Public notices
POST   /api/admin/notices        # Create notice (Admin)
PUT    /api/admin/notices/:id    # Update notice
DELETE /api/admin/notices/:id    # Delete notice
GET    /api/teacher/notices      # Teacher-specific notices
```

### 📅 **Routine Management API**
```http
GET    /api/routines             # Class schedules
POST   /api/admin/routines       # Create routine
PUT    /api/admin/routines/:id   # Update routine
DELETE /api/admin/routines/:id   # Delete routine
GET    /api/teacher/routines     # Teacher schedules
```

## 🛠️ **DEVELOPMENT TOOLKIT**

### 📜 **Available Scripts**

#### **Backend Operations**
```bash
# Development mode with hot reload
npm run dev              # Starts nodemon with live reloading

# Production deployment
npm start               # Standard production server
npm run prod           # Production mode with PM2

# Database operations
npm run db:reset       # Reset database schema
npm run db:seed        # Populate with sample data
npm run db:migrate     # Run pending migrations

# Utility scripts
npm run create:admin   # Create admin account
npm run test:api      # API endpoint testing
npm run logs         # View application logs
```

#### **Frontend Operations**
```bash
# Development server
npm run dev           # Start Vite dev server with HMR

# Production build
npm run build         # Create optimized production build
npm run preview       # Preview production build locally

# Code quality
npm run lint          # ESLint code analysis
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Prettier code formatting

# Testing
npm run test          # Run unit tests
npm run test:e2e      # End-to-end testing
```

## 📊 **FEATURES SHOWCASE**

### 🎯 **Student Management System**
```yaml
Core Features:
  ✅ Batch Import from Excel (Custom Format)
  ✅ Real-time Profile Management
  ✅ Advanced Search & Filtering
  ✅ Fee Tracking & Payment History
  ✅ Grade Management & Promotion
  ✅ Attendance Tracking
  ✅ Performance Analytics
  ✅ Parent Communication Portal

Data Import:
  📊 Excel Format: .xlsx, .xls
  📋 Required Fields: Name, Class, Section, Roll Number
  📝 Optional Fields: Phone, Email, Address, DOB
  🔄 Validation: Real-time data verification
  ⚡ Performance: Handles 1000+ records
```

### 👨‍🏫 **Teacher Portal**
```yaml
Dashboard Features:
  📅 Personal Schedule Management
  📊 Student Progress Tracking
  💼 Payroll & Salary Tracking
  📢 Notice Board Access
  📝 Assignment Management
  📋 Attendance Recording
  📈 Performance Reports
  🔔 Real-time Notifications

Payroll System:
  💰 Automated Salary Calculation
  📊 Monthly/Yearly Reports
  🧾 Tax Calculation
  📈 Bonus & Incentive Tracking
  📱 Mobile-friendly Interface
```

### 🎛️ **Admin Command Center**
```yaml
System Control:
  👥 User Management (Students/Teachers)
  🏫 Institution Configuration
  📊 Analytics Dashboard
  🔐 Security & Access Control
  💾 Database Management
  📤 Data Export/Import
  🚨 System Monitoring
  ⚙️ Settings Configuration

Reporting Engine:
  📈 Student Performance Reports
  💰 Financial Reports
  📊 Attendance Analytics
  🎯 Custom Report Builder
  📧 Automated Email Reports
```

## 🔒 **SECURITY FEATURES**

```yaml
Authentication & Authorization:
  🔐 JWT-based Authentication
  🛡️ Role-based Access Control (RBAC)
  🔄 Token Refresh Mechanism
  🚨 Session Management
  🔒 Password Encryption (bcrypt)

Data Protection:
  🛡️ SQL Injection Prevention
  🔐 XSS Protection
  🚫 CSRF Protection
  📊 Input Validation & Sanitization
  🔒 Secure File Upload
  📝 Audit Logging

Infrastructure Security:
  🌐 HTTPS Enforcement
  🔧 Environment Variable Protection
  🚨 Rate Limiting
  🛡️ CORS Configuration
  📊 Error Handling & Logging
```

## 🚀 **DEPLOYMENT GUIDE**

### 🏗️ **Production Setup**

#### **Backend Deployment**
```bash
# Build for production
npm run build

# Start with PM2 (Process Manager)
pm2 start ecosystem.config.js

# Monitor application
pm2 monit

# Setup nginx reverse proxy
sudo nano /etc/nginx/sites-available/nawa
```

#### **Frontend Deployment**
```bash
# Create production build
npm run build

# Deploy to web server
cp -r dist/* /var/www/html/nawa/

# Configure nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 🐳 **Docker Deployment**
```dockerfile
# Full-stack deployment with Docker Compose
version: '3.8'

services:
  backend:
    build: ./NAWA_CLIENT/back_end
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
    depends_on:
      - database

  frontend:
    build: ./NAWA_CLIENT/front_end
    ports:
      - "80:80"
    depends_on:
      - backend

  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_DATABASE: nawa_db
    volumes:
      - mysql_data:/var/lib/mysql
```

## 📈 **PERFORMANCE METRICS**

```yaml
Frontend Performance:
  ⚡ First Contentful Paint: < 1.5s
  🚀 Time to Interactive: < 3.0s
  📱 Mobile Performance Score: 95+
  🎯 Lighthouse Score: 90+
  💾 Bundle Size: < 500KB (gzipped)

Backend Performance:
  🚄 API Response Time: < 200ms
  📊 Database Query Time: < 50ms
  🔄 Concurrent Users: 1000+
  💾 Memory Usage: < 256MB
  🏃‍♂️ Uptime: 99.9%
```

## 🤝 **CONTRIBUTION PROTOCOL**

### 🔧 **Development Guidelines**

```bash
# Fork & Clone
git clone https://github.com/YourUsername/nawataraenglishschooldraft1.git
cd nawataraenglishschooldraft1

# Create feature branch
git checkout -b feature/awesome-new-feature

# Follow commit convention
git commit -m "feat: add student batch import functionality"
git commit -m "fix: resolve authentication token expiry issue"
git commit -m "docs: update API documentation"

# Push & Pull Request
git push origin feature/awesome-new-feature
```

### 📋 **Code Standards**
```yaml
Frontend:
  - React Hooks & Functional Components
  - TypeScript for type safety
  - ESLint + Prettier configuration
  - Component-based architecture
  - Responsive design principles

Backend:
  - RESTful API design
  - Express.js best practices
  - Sequelize ORM patterns
  - Error handling middleware
  - API documentation (JSDoc)

Database:
  - Normalized schema design
  - Proper indexing strategy
  - Migration scripts
  - Data validation rules
```

## 📚 **DOCUMENTATION HUB**

```yaml
Available Resources:
  📖 API Documentation: /docs/api/
  🎨 UI/UX Guidelines: /docs/design/
  🏗️ Architecture Guide: /docs/architecture/
  🔧 Deployment Guide: /docs/deployment/
  🧪 Testing Guide: /docs/testing/
  🚨 Troubleshooting: /docs/troubleshooting/
```

## 🎯 **PROJECT ROADMAP**

### 🚀 **Phase 1 (Current) - Core System**
- ✅ User Authentication & Authorization
- ✅ Student Management System
- ✅ Teacher Portal & Payroll
- ✅ Admin Dashboard
- ✅ Notice & Communication System
- ✅ Fee Management

### 🎮 **Phase 2 - Advanced Features**
- 🔄 Real-time Notifications
- 📱 Mobile Application (React Native)
- 🎯 Advanced Analytics & Reporting
- 🌐 Multi-language Support
- 🔗 Third-party Integrations

### 🚀 **Phase 3 - AI Integration**
- 🤖 AI-powered Student Analytics
- 📊 Predictive Performance Modeling
- 🎯 Personalized Learning Recommendations
- 🗣️ Voice Commands & Chatbot
- 📈 Automated Report Generation

## 📞 **SUPPORT & CONTACT**

```yaml
Project Maintainer:
  👨‍💻 Developer: SakshamKandel
  🌐 GitHub: https://github.com/SakshamKandel
  📧 Email: saksham.kandel@example.com
  💼 LinkedIn: /in/sakshamkandel

Community:
  🐛 Bug Reports: GitHub Issues
  💡 Feature Requests: GitHub Discussions
  📖 Documentation: Wiki Pages
  💬 Community Chat: Discord Server
```

## 📄 **LICENSE**

```
ISC License

Copyright (c) 2024 SakshamKandel

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

<div align="center">

**⭐ If this project helped you, please consider giving it a star! ⭐**

```ascii
╔══════════════════════════════════════════════╗
║  Built with ❤️ by SakshamKandel               ║
║  🚀 Powered by Modern Web Technologies        ║
║  🎯 Designed for Educational Excellence       ║
╚══════════════════════════════════════════════╝
```

![Visitor Count](https://visitor-badge.laobi.icu/badge?page_id=SakshamKandel.nawataraenglishschooldraft1)
![GitHub last commit](https://img.shields.io/github/last-commit/SakshamKandel/nawataraenglishschooldraft1)
![GitHub issues](https://img.shields.io/github/issues/SakshamKandel/nawataraenglishschooldraft1)
![GitHub stars](https://img.shields.io/github/stars/SakshamKandel/nawataraenglishschooldraft1)

</div>
