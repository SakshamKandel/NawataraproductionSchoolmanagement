# 🔧 Backend Deployment Fix Guide

## ❌ Current Error:
```
Cannot find module '/home/nawatara/nawatara/config/database.js' imported from /home/nawatara/nawatara/index.js
```

## 🎯 Root Cause:
The `config/database.js` file and other critical backend files are missing from your cPanel deployment.

## ✅ Complete Backend File Upload Checklist:

### 📁 Critical Directories to Upload:
```
back_end/
├── .env                           ← CRITICAL: Environment variables
├── index.js                       ← CRITICAL: Main server file
├── package.json                   ← CRITICAL: Dependencies
├── config/
│   ├── database.js               ← MISSING: Database configuration
│   └── init-db.js                ← CRITICAL: Database initialization
├── controllers/
│   ├── authController.js
│   ├── login/
│   ├── logout/
│   ├── admin/
│   ├── setup/
│   └── [all controller files]
├── middleware/
│   ├── auth.js
│   └── verifyToken.js
├── models/
│   ├── Admin.js
│   ├── Teacher.js
│   ├── Student.js
│   ├── Notice.js
│   └── [all model files]
├── routes/
│   ├── login_logout/
│   ├── admin_accessible_routes/
│   └── [all route files]
└── uploads/                       ← For file uploads
```

## 🚀 Step-by-Step Fix:

### Step 1: Upload ALL Backend Files
1. **Go to cPanel → File Manager**
2. **Navigate to your app directory** (e.g., `/home/nawatara/nawatara/`)
3. **Delete existing files** (backup first if needed)
4. **Upload the ENTIRE `back_end` folder contents**
   - **Source**: `c:\Users\Acer\nawabook\NAWA_CLIENT\back_end\`
   - **Destination**: Your app directory in cPanel

### Step 2: Verify Critical Files Exist
Check that these files are present in cPanel:
- ✅ `.env` file with production settings
- ✅ `config/database.js`
- ✅ `config/init-db.js`
- ✅ `package.json`
- ✅ `index.js`

### Step 3: Install Dependencies
In cPanel terminal:
```bash
cd ~/nawatara  # or your app directory
npm install
```

### Step 4: Initialize Database
```bash
npm run setup
```

### Step 5: Start/Restart App
In cPanel → Node.js Apps → Restart

## 🔍 Verification Commands:
Run these in cPanel terminal to verify:
```bash
# Check if critical files exist
ls -la config/
ls -la models/
ls -la controllers/

# Check environment file
cat .env

# Test database connection
npm run test-db
```

## 🚨 Common Upload Issues:

### Issue 1: Missing Folders
- **Problem**: Some folders didn't upload
- **Solution**: Upload each directory individually

### Issue 2: File Permissions
- **Problem**: Files can't be read
- **Solution**: Set permissions to 644 for files, 755 for folders

### Issue 3: Environment File Missing
- **Problem**: `.env` file not uploaded
- **Solution**: Upload `.env` file separately (it's sometimes hidden)

## ✅ Success Indicators:
After proper upload, you should see:
- ✅ No "module not found" errors
- ✅ App starts without errors
- ✅ Database connections work
- ✅ API endpoints respond

## 💡 Pro Tip:
If uploading individual files is tedious:
1. Create a ZIP file of the entire `back_end` folder
2. Upload the ZIP to cPanel
3. Extract it in the correct directory
4. Move files to the app root if needed

---
**🎯 Once all files are properly uploaded, your school management system will work perfectly!**
