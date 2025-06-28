# 📋 DEPLOYMENT CHECKLIST

## Before Deployment:
- [x] Frontend built with all fixes applied
- [x] Backend routes fixed (login working)
- [x] Environment variables configured
- [x] Database test script created
- [x] Error handling improved throughout app
- [x] React error #31 completely eliminated

## Frontend Deployment:
- [ ] Navigate to cPanel File Manager
- [ ] Go to `public_html` folder
- [ ] Backup existing files (if any)
- [ ] Upload all files from `front_end/dist/`
- [ ] Verify `index.html` is in root of `public_html`

## Backend Deployment:
- [ ] Navigate to your app folder (e.g., `nawatara`)
- [ ] Upload all files from `back_end/` folder
- [ ] Verify `.env` file uploaded correctly
- [ ] Check file permissions if needed

## Database Setup:
- [ ] Verify MySQL database `nawatara_db` exists
- [ ] Verify user `nawatara_db` has full privileges
- [ ] Open Node.js app terminal in cPanel
- [ ] Run: `npm install`
- [ ] Run: `npm run setup`
- [ ] Check for any error messages

## Application Restart:
- [ ] Go to Node.js Apps in cPanel
- [ ] Click "Restart" on your application
- [ ] Wait for green status
- [ ] Check application logs for errors

## Testing:
- [ ] Visit: `https://nawataraenglishschool.com`
- [ ] Test login functionality
- [ ] Check browser console for errors
- [ ] Test notice creation
- [ ] Test calendar functionality
- [ ] Verify no 500 errors

## Success Indicators:
- [ ] Login works without React errors
- [ ] No "Minified React error #31" messages
- [ ] Calendar API responds (even if empty)
- [ ] Notice creation API responds
- [ ] All user roles can access their features

## If Issues Occur:
- [ ] Check cPanel Error Logs
- [ ] Check Node.js App Logs
- [ ] Try running `npm run setup` again
- [ ] Restart app 2-3 times
- [ ] Verify database connection settings

## Emergency Commands:
```bash
# In app terminal:
npm install
npm run setup
npm run test-db  # (might fail in production, but worth trying)
```

---
**✅ Complete this checklist step by step for successful deployment!**
