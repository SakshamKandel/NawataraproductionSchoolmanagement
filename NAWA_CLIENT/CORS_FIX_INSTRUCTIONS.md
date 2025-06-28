# CORS Fix Instructions for Production Deployment

## Issue Description
You're getting CORS errors because the frontend is trying to call `localhost:8000` instead of the production backend URL.

## ✅ **Immediate Fix Required**

### **Step 1: Set Environment Variables in cPanel**

In your cPanel Node.js app settings, add these environment variables:

```bash
NODE_ENV=production
FRONTEND_URL=https://nawataraenglishschool.com
MYSQL_HOST=localhost
MYSQL_DATABASE=your_actual_database_name
MYSQL_USER=your_actual_database_user
MYSQL_PASSWORD=your_actual_database_password
JWT_SECRET=your_strong_secret_key
SESSION_SECRET=your_strong_session_secret
```

### **Step 2: Upload Updated Files**

1. **Upload the updated backend files** (especially `index.js` with fixed CORS)
2. **Upload the updated frontend build** (from the new `dist/` folder)

### **Step 3: Restart Node.js App**

- In cPanel Node.js interface, click "Restart" to apply the new environment variables

## 🔧 **What Was Fixed**

### **Backend Changes:**
- Added `https://nawataraenglishschool.com` to CORS allowed origins
- Made CORS configuration more robust

### **Frontend Changes:**
- Updated API URL detection to use production domain when not on localhost
- Fixed environment detection logic

## 🚀 **After Deployment**

Your frontend will now:
- Use `https://nawataraenglishschool.com` for API calls (same origin)
- No more CORS errors
- Proper authentication with cookies

## 📋 **Quick Test**

After deployment, check:
1. Open browser developer tools
2. Go to Network tab
3. Verify API calls are going to `https://nawataraenglishschool.com/api/...` (not localhost)
4. No CORS errors in console

## 🔍 **Troubleshooting**

If you still see CORS errors:
1. Verify `FRONTEND_URL` environment variable is set correctly in cPanel
2. Restart the Node.js app after setting environment variables
3. Clear browser cache and try again
4. Check that API calls are going to the correct domain (not localhost)

Your school management system should now work perfectly in production! 🎉
