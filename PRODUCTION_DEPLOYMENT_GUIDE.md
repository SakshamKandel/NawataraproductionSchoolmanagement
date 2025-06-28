# Production Deployment Guide for cPanel Node.js Hosting

## Pre-Deployment Checklist

### ✅ **Environment Configuration**
1. Update `.env.production` files with actual production values
2. Set strong JWT and session secrets
3. Configure production database credentials
4. Update frontend URL to actual domain

### ✅ **Security Hardening**
- All development logs removed
- Debug middleware disabled in production
- Strong environment secrets configured
- CORS properly configured for production domain

### ✅ **Performance Optimizations**
- Database connection pooling optimized
- Static file serving configured
- Production build optimizations enabled

## Deployment Steps

### **Step 1: Backend Deployment (cPanel Node.js)**

1. **Upload Backend Files**
   ```
   Upload NAWA_CLIENT/back_end/ folder to your cPanel public_html or app directory
   ```

2. **Install Dependencies**
   ```bash
   npm install --production
   ```

3. **Environment Variables**
   Set these in cPanel Node.js Environment Variables section:
   ```
   NODE_ENV=production
   PORT=8000
   FRONTEND_URL=https://yourdomain.com
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DATABASE=your_database_name
   MYSQL_USER=your_database_user
   MYSQL_PASSWORD=your_database_password
   JWT_SECRET=your_super_secure_jwt_secret
   SESSION_SECRET=your_super_secure_session_secret
   ```

4. **Database Setup**
   - Create MySQL database in cPanel
   - Run database initialization if needed:
     ```bash
     npm run setup
     ```

5. **Start Application**
   ```bash
   npm start
   ```

### **Step 2: Frontend Deployment**

**Option A: Static Build (Recommended)**
1. **Build for Production**
   ```bash
   cd NAWA_CLIENT/front_end
   npm run build:prod
   ```

2. **Upload Build Files**
   ```
   Upload contents of dist/ folder to public_html
   ```

**Option B: Node.js Frontend Server**
1. **Upload Frontend Files**
   ```
   Upload NAWA_CLIENT/front_end/ folder
   ```

2. **Install Dependencies**
   ```bash
   npm install --production
   ```

3. **Build and Start**
   ```bash
   npm run build:prod
   npm start
   ```

### **Step 3: Domain Configuration**

1. **Update Environment Variables**
   Replace `yourdomain.com` with your actual domain in:
   - Backend `FRONTEND_URL`
   - Frontend `VITE_API_URL`

2. **Configure Subdomain (if needed)**
   - Backend: subdomain.yourdomain.com:8000
   - Frontend: yourdomain.com

### **Step 4: Post-Deployment Verification**

1. **Test Backend API**
   ```
   https://yourdomain.com/api/health (if health endpoint exists)
   ```

2. **Test Frontend**
   ```
   https://yourdomain.com
   ```

3. **Test Authentication**
   - Login functionality
   - Admin panel access
   - API calls working

4. **Test Database Connection**
   - Data loading correctly
   - CRUD operations working

## Troubleshooting

### **Common Issues**

1. **CORS Errors**
   - Verify FRONTEND_URL matches actual domain
   - Check CORS configuration in backend

2. **Database Connection**
   - Verify database credentials
   - Check MySQL service is running
   - Ensure database exists

3. **API Calls Failing**
   - Check VITE_API_URL points to correct backend
   - Verify backend is running on correct port

4. **Static Files Not Loading**
   - Check file permissions (755 for directories, 644 for files)
   - Verify .htaccess configuration if needed

### **Performance Monitoring**

1. **Check Logs**
   ```bash
   # Backend logs
   tail -f logs/app.log

   # cPanel Error Logs
   Check cPanel Error Logs section
   ```

2. **Monitor Resource Usage**
   - Check cPanel resource usage
   - Monitor database performance
   - Check memory and CPU usage

### **Backup Strategy**

1. **Database Backup**
   ```bash
   # Set up automated database backups in cPanel
   mysqldump -u username -p database_name > backup.sql
   ```

2. **File Backup**
   ```bash
   # Regular backup of application files
   tar -czf backup_$(date +%Y%m%d).tar.gz app_directory/
   ```

## Security Considerations

### **SSL/HTTPS**
- Enable SSL certificate in cPanel
- Force HTTPS redirects
- Update all URLs to use HTTPS

### **Database Security**
- Use strong database passwords
- Limit database user permissions
- Regular security updates

### **Application Security**
- Regular dependency updates
- Monitor for security vulnerabilities
- Implement rate limiting if needed

## Maintenance

### **Regular Updates**
1. **Dependencies**
   ```bash
   npm audit
   npm update
   ```

2. **Security Patches**
   - Monitor for security advisories
   - Apply patches promptly

3. **Performance Optimization**
   - Monitor database performance
   - Optimize queries as needed
   - Clean up old data periodically

---

## Quick Reference

### **Production URLs**
- Frontend: https://yourdomain.com
- Backend API: https://yourdomain.com/api
- Admin Panel: https://yourdomain.com/admin

### **Important Files**
- Backend Config: `/back_end/.env`
- Frontend Build: `/front_end/dist/`
- Database Config: `/back_end/config/database.js`

## Final Production Readiness Verification ✅

Before deployment, verify these items are completed:

### **Files Removed for Production**
- [x] All test files (test-*.js, test-*.mjs)
- [x] Development check utilities (check-*.mjs)
- [x] Outdated deployment documentation
- [x] Environment example files
- [x] Root directory development utilities
- [x] Unnecessary package.json files

### **Production Configuration Verified**
- [x] Backend using environment variables for all sensitive data
- [x] Frontend API URLs dynamic (not hardcoded localhost)
- [x] CORS configured for production domain only
- [x] Database connection pool optimized
- [x] Development logs and debug middleware disabled
- [x] Strong secrets configured for JWT and sessions

### **Ready for cPanel Node.js Hosting**
Your NAWA_CLIENT project is now fully optimized and ready for production deployment! 🚀

### **Support**
For technical issues, check:
1. cPanel Error Logs
2. Application logs
3. Browser console for frontend issues
4. Network tab for API call issues
