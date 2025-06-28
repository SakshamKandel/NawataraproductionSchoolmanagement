# 🚀 cPanel Hosting Deployment Guide

## 📋 **Prerequisites**
- cPanel hosting account with Node.js support
- Domain name configured
- MySQL database access
- SSH access (optional but recommended)

## 🗂️ **Step 1: Prepare Your Files**

### Frontend (Already Built)
✅ Production build created in `dist/` folder

### Backend Environment File
Create `.env` file for production:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_database_name

# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# JWT Secret
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Email Configuration (if using)
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-email-password
```

## 🌐 **Step 2: Upload Files to cPanel**

### Method 1: File Manager
1. **Login to cPanel**
2. **Open File Manager**
3. **Navigate to public_html/**

### Upload Frontend:
```
public_html/
├── index.html (from dist/)
├── assets/ (from dist/assets/)
└── other files from dist/
```

### Upload Backend:
```
public_html/api/ (create this folder)
├── index.js
├── package.json
├── .env
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
└── node_modules/ (will be created)
```

### Method 2: FTP/SFTP
```bash
# Upload frontend dist/ contents to public_html/
# Upload backend to public_html/api/
```

## 🗄️ **Step 3: Database Setup**

1. **Create MySQL Database** in cPanel
2. **Import your database** or run setup scripts
3. **Update .env** with correct database credentials

### Database Import Commands:
```sql
-- If you have a backup file
SOURCE /path/to/your/backup.sql;

-- Or run your setup script
mysql -u username -p database_name < setup.sql
```

## ⚙️ **Step 4: Node.js Configuration**

### In cPanel Node.js App:
1. **Create Node.js App**
2. **App Root:** `/public_html/api`
3. **Startup File:** `index.js`
4. **Node.js Version:** Latest LTS (18+)

### Install Dependencies:
```bash
# In cPanel terminal or SSH
cd /home/username/public_html/api
npm install
```

## 🔧 **Step 5: Configure API URLs**

### Update Frontend Environment:
Your `.env.production` should point to:
```env
VITE_API_URL=https://yourdomain.com/api
```

### Update Backend CORS:
In `index.js`, update CORS origins:
```javascript
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://yourdomain.com']
  : ['http://localhost:5173'];
```

## 🚀 **Step 6: Start Application**

### Start Backend:
```bash
# In cPanel Node.js Apps
# Click "Start" or restart the app
```

### Verify Frontend:
- Visit: `https://yourdomain.com`
- Check: API calls working

## 📁 **Final Directory Structure**

```
public_html/
├── index.html (React app)
├── assets/
├── api/
│   ├── index.js
│   ├── package.json
│   ├── .env
│   └── ... (all backend files)
└── .htaccess (for React routing)
```

## 🔄 **Step 7: Configure .htaccess for React Routing**

Create `/public_html/.htaccess`:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# API routing
RewriteRule ^api/(.*)$ /api/index.js [QSA,L]
```

## 🔍 **Step 8: Testing & Troubleshooting**

### Test Endpoints:
1. **Frontend:** `https://yourdomain.com`
2. **API Health:** `https://yourdomain.com/api/health`
3. **Login:** `https://yourdomain.com/login-form`

### Common Issues:
- **CORS Errors:** Check backend CORS configuration
- **Database Connection:** Verify .env credentials
- **File Permissions:** Set appropriate permissions (755)
- **Node.js App Not Starting:** Check error logs in cPanel

## 📊 **Step 9: Domain-Specific Configuration**

Since your production URL is `https://nawataraenglishschool.com`, update:

1. **Frontend .env.production:**
```env
VITE_API_URL=https://nawataraenglishschool.com/api
```

2. **Backend CORS:**
```javascript
const corsOrigins = ['https://nawataraenglishschool.com'];
```

## 🔐 **Security Checklist**
- ✅ Strong JWT secret
- ✅ Database credentials secured
- ✅ HTTPS enabled
- ✅ CORS properly configured
- ✅ Environment files not accessible
- ✅ Node modules protected

## 📝 **Post-Deployment**
1. Test all features
2. Monitor error logs
3. Set up regular backups
4. Configure SSL certificate
5. Set up monitoring/alerts

---

**Need Help?** Check cPanel error logs and Node.js app logs for specific issues.
