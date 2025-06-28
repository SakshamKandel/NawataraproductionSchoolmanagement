# 🚨 CRITICAL DEPLOYMENT FIX GUIDE

## The Problem:
Your backend is missing the `config/database.js` file in cPanel, causing the app to crash.

## ✅ IMMEDIATE FIX STEPS:

### Step 1: Verify All Backend Files Are Uploaded
In cPanel File Manager, navigate to your app directory (`/home/nawatara/nawatara/`) and ensure these files/folders exist:

#### CRITICAL FILES THAT MUST BE PRESENT:
```
📁 /home/nawatara/nawatara/
├── index.js                    (MAIN APP FILE)
├── package.json               (DEPENDENCIES)
├── .env                       (ENVIRONMENT VARIABLES)
├── 📁 config/
│   ├── database.js           ⚠️ THIS FILE IS MISSING!
│   ├── init-db.js
│   ├── create-admin.js
│   └── create-teacher.js
├── 📁 models/
│   ├── Admin.js
│   ├── Teacher.js
│   ├── Student.js
│   ├── Notice.js
│   └── ... (all model files)
├── 📁 routes/
│   ├── login_logout/
│   ├── admin_accessible_routes/
│   └── ... (all route files)
├── 📁 controllers/
│   ├── admin/
│   ├── login/
│   ├── logout/
│   └── ... (all controller files)
├── 📁 middleware/
│   ├── auth.js
│   └── verifyToken.js
└── 📁 tokens/
    └── token_verify.js
```

### Step 2: Upload Missing Files
If any files are missing, you need to upload them from your local backend folder:
- **Source**: `c:\Users\Acer\nawabook\NAWA_CLIENT\back_end\`
- **Destination**: `/home/nawatara/nawatara/` (or your app directory)

### Step 3: Specifically Fix the database.js Issue
1. In cPanel File Manager, go to your app directory
2. Check if `config/` folder exists
3. If missing, create the `config/` folder
4. Upload `database.js` from your local `back_end/config/` folder

### Step 4: Install Dependencies
In cPanel Terminal (Node.js Apps → Your App → Terminal):
```bash
npm install
```

### Step 5: Initialize Database
```bash
npm run setup
```

### Step 6: Restart Application
In cPanel Node.js Apps, click "Restart" on your application.

## 🔧 ALTERNATIVE: Re-upload Everything

If you're unsure which files are missing:

1. **Backup current .env file** (download it first)
2. **Delete all files** in your app directory
3. **Upload ALL files** from `c:\Users\Acer\nawabook\NAWA_CLIENT\back_end\`
4. **Restore your .env file**
5. **Run npm install**
6. **Run npm run setup**
7. **Restart the app**

## 📋 Verification Commands

Run these in cPanel Terminal to verify everything is uploaded:

```bash
# Check if database.js exists
ls -la config/database.js

# Check if all critical files exist
ls -la index.js package.json .env

# Check directory structure
ls -la

# Test basic syntax
node -c index.js
```

## 🚨 Common Upload Issues:

### Issue 1: Incomplete Upload
- **Problem**: Not all files uploaded due to connection issues
- **Fix**: Upload in smaller batches or use ZIP upload

### Issue 2: File Permissions
- **Problem**: Files uploaded but not readable
- **Fix**: Set file permissions to 644 for files, 755 for directories

### Issue 3: Path Issues
- **Problem**: Files uploaded to wrong directory
- **Fix**: Ensure you're in the correct app directory (usually `/home/username/appname/`)

## ✅ SUCCESS INDICATORS:

After fixing, you should see:
- No "Cannot find module" errors
- App starts successfully
- Database connection works
- All API endpoints respond

## 🆘 If Still Having Issues:

1. **Double-check file structure** against the list above
2. **Re-upload the entire backend** (safest option)
3. **Check cPanel error logs** for other missing files
4. **Verify Node.js version compatibility** (should be v16+ recommended)

---

**The missing `config/database.js` file is causing your app to crash. Upload this file and restart your app to fix the issue.**
