# Deployment Verification and Fix Guide

## Issue Analysis
The error indicates that `config/database.js` is missing from the deployed backend on cPanel. This is a critical file required for database connectivity.

## Critical Files That Must Be Uploaded

### Core Application Files
- `index.js` (main entry point)
- `package.json` (dependencies)
- `.env` (environment configuration)

### Configuration Files
- `config/database.js` ⚠️ **MISSING - This is causing the error**
- `config/init-db.js`
- `config/create-admin.js`
- `config/create-teacher.js`

### Model Files (ALL Required)
- `models/associations.js`
- `models/Student.js`
- `models/Teacher.js`
- `models/Admin.js`
- `models/Notice.js`
- `models/Routine.js`
- `models/ClassFee.js`
- `models/StudentFee.js`
- `models/TeacherPayroll.js`
- `models/TeacherNotice.js`
- `models/LeaveRequest.js`
- `models/AcademicYear.js`

### Controller Files (ALL Required)
- `controllers/authController.js`
- `controllers/routineController.js`
- `controllers/teacherController.js`
- `controllers/teacherPayrollController.js`
- All admin controllers in `controllers/admin/`
- All login controllers in `controllers/login/`
- All other controller subdirectories

### Route Files (ALL Required)
- All files in `routes/` directory and subdirectories

### Middleware Files
- `middleware/auth.js`
- `middleware/verifyToken.js`

### Token Files
- `tokens/token_verify.js`
- `tokens/token_roleslogin/loginToken.js`

## Immediate Fix Steps

### Step 1: Verify Critical File Exists Locally
Check if `config/database.js` exists in your local backend:
```bash
ls -la config/database.js
```

### Step 2: Upload Missing Files to cPanel
Using cPanel File Manager or FTP:

1. **Navigate to your domain's backend directory** (e.g., `/public_html/api/` or `/home/nawatara/nawatara/`)

2. **Ensure ALL directories exist**:
   - `config/`
   - `models/`
   - `controllers/` (with all subdirectories)
   - `routes/` (with all subdirectories)
   - `middleware/`
   - `tokens/` (with subdirectories)

3. **Upload the missing `config/database.js` file**

### Step 3: Verify Directory Structure on cPanel
Your backend directory should look like this:
```
/home/nawatara/nawatara/
├── index.js
├── package.json
├── .env
├── config/
│   ├── database.js          ← This was missing!
│   ├── init-db.js
│   ├── create-admin.js
│   └── create-teacher.js
├── models/
│   ├── associations.js
│   ├── Student.js
│   ├── Teacher.js
│   ├── Admin.js
│   └── [all other model files]
├── controllers/
│   ├── authController.js
│   ├── admin/
│   ├── login/
│   └── [all other controller directories]
├── routes/
│   ├── [all route files and directories]
├── middleware/
│   ├── auth.js
│   └── verifyToken.js
└── tokens/
    ├── token_verify.js
    └── token_roleslogin/
        └── loginToken.js
```

### Step 4: Install Dependencies on cPanel
After uploading files, install Node.js dependencies:

1. Access cPanel Terminal or SSH
2. Navigate to your backend directory:
   ```bash
   cd /home/nawatara/nawatara
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Step 5: Restart the Application
Restart your Node.js application through cPanel Node.js Selector or by restarting the app.

## Verification Commands

### Check if file exists on server:
```bash
ls -la /home/nawatara/nawatara/config/database.js
```

### Test database connection:
```bash
node -e "const db = require('./config/database.js'); console.log('Database config loaded successfully');"
```

### Test application startup:
```bash
npm run prod
```

## Common Deployment Issues and Solutions

### Issue: Module Not Found Errors
**Solution**: Ensure all files and directories are uploaded with correct structure

### Issue: Database Connection Fails
**Solution**: Verify `.env` file has correct database credentials

### Issue: Permission Errors
**Solution**: Set correct file permissions (usually 644 for files, 755 for directories)

### Issue: Dependencies Not Installed
**Solution**: Run `npm install` in the backend directory on the server

## File Upload Checklist

- [ ] `config/database.js` ✓
- [ ] All model files ✓
- [ ] All controller files ✓
- [ ] All route files ✓
- [ ] Middleware files ✓
- [ ] Token files ✓
- [ ] `index.js` ✓
- [ ] `package.json` ✓
- [ ] `.env` with production settings ✓

## Next Steps After Fix

1. Test the application: Visit your domain and check if it loads
2. Test API endpoints: Try logging in as admin/teacher
3. Check database connectivity: Verify data can be fetched
4. Monitor logs for any additional errors

## Prevention for Future Deployments

1. **Create a deployment script** that lists all required files
2. **Use version control** (Git) to track all files
3. **Test locally** before deploying
4. **Create backups** of working deployments
5. **Document file structure** for reference

## Emergency Contact Information

If issues persist:
1. Check cPanel error logs
2. Contact hosting provider support
3. Verify domain DNS settings
4. Check SSL certificate status

---

**Priority**: IMMEDIATE - Application is currently broken due to missing critical file.
