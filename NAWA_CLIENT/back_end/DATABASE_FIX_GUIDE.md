# 500 Error Fix Guide for cPanel Deployment

The 500 errors you're seeing are database-related issues. Here's how to fix them:

## 🚨 Current Issues:
- Calendar API returning 500 errors
- Notice creation API returning 500 errors  
- Events fetching API returning 500 errors

## 🔧 Root Cause:
These are typically caused by:
1. Database tables not existing
2. Database connection issues
3. Missing database initialization

## ✅ How to Fix:

### Step 1: Test Database Connection Locally
```bash
cd c:\Users\Acer\nawabook\NAWA_CLIENT\back_end
npm run test-db
```

This will test your database connection and show you exactly what's missing.

### Step 2: Deploy to cPanel
1. **Upload Backend Files:**
   - Upload all backend files to your `nawatara` folder in cPanel
   - Make sure the `.env` file is uploaded with the correct database credentials

2. **Upload Frontend Files:**
   - Upload the contents of `front_end/dist/` to your `public_html` folder

### Step 3: Database Setup in cPanel
1. **Access cPanel MySQL:**
   - Go to cPanel → MySQL Databases
   - Verify your database `nawatara_db` exists
   - Verify the user `nawatara_db` has full permissions

2. **Initialize Database Tables:**
   - In cPanel, go to Node.js Apps
   - Select your app
   - Go to the terminal/shell
   - Run: `npm run setup`
   - This will create all necessary tables

### Step 4: Restart Node.js App
1. In cPanel → Node.js Apps
2. Click "Restart" on your application
3. Check the logs for any errors

## 🔍 Debugging Steps:

### If 500 errors persist:

1. **Check cPanel Error Logs:**
   - cPanel → Error Logs
   - Look for recent errors

2. **Check Node.js App Logs:**
   - cPanel → Node.js Apps → Your App → Logs

3. **Verify Database Tables:**
   - cPanel → phpMyAdmin
   - Check if these tables exist:
     - Admins
     - Teachers
     - Students
     - Notices
     - TeacherNotices
     - Routines
     - StudentFees
     - LeaveRequests

4. **Test Individual Endpoints:**
   - Try accessing: `https://nawataraenglishschool.com/api/calendar`
   - Try accessing: `https://nawataraenglishschool.com/api/notices/admin`

## 📋 Database Tables Required:
```sql
-- Main tables that should exist:
- Admins (for admin users)
- Teachers (for teacher users)  
- Students (for student users)
- Notices (for school notices)
- TeacherNotices (for teacher-specific notices)
- TeacherPayrolls (for teacher payments)
- Routines (for class schedules)
- StudentFees (for student fee records)
- LeaveRequests (for teacher leave requests)
- ClassFees (for fee structures)
```

## 🔐 Environment Variables Required:
Make sure your backend `.env` file in cPanel has:
```env
NODE_ENV=production
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=nawatara_db
MYSQL_PASSWORD=Nawatara1234#
MYSQL_DATABASE=nawatara_db
JWT_SECRET=NawaSchl2025_SuperSecure_JWT_Key_MinLength32Chars!
ADMIN_JWT_SECRET=NawaAdmin2025_SecureKey_ForAdminAuth_32CharsMin!
TEACHER_JWT_SECRET=NawaTeacher2025_SecureKey_ForTeacherAuth_32Min!
SECRET_KEY=NawaGeneral2025_SecureKey_ForGeneralAuth_32CharsMin!
FRONTEND_URL=https://nawataraenglishschool.com
CORS_ORIGIN=https://nawataraenglishschool.com
```

## 🚀 After Fixing:
Once the database is properly set up, you should be able to:
- ✅ Login successfully (already working)
- ✅ Create notices without 500 errors
- ✅ View calendar events without 500 errors
- ✅ Access all admin/teacher/student features

## 💡 Pro Tips:
1. Always check cPanel logs when getting 500 errors
2. Database initialization should only be run once
3. If tables already exist, the setup script will skip creating them
4. Make sure your database user has ALL PRIVILEGES on the database

## 🆘 If Still Having Issues:
Run the database test locally first: `npm run test-db`
This will show you exactly what's working and what's not working.
