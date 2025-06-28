// Simple script to help users clear authentication
console.log(`
🔧 JWT Secret Update - Authentication Reset Required

The JWT secret has been updated for security. You need to clear your authentication and log in again.

📋 Steps to fix the "invalid signature" error:

1. CLEAR BROWSER DATA:
   - Open browser Developer Tools (F12)
   - Go to Application tab (Chrome) or Storage tab (Firefox)
   - Under "Cookies" section, delete all cookies for:
     * http://localhost:5173
     * http://localhost:8000
   - Also clear Local Storage and Session Storage

2. ALTERNATIVE - Clear cookies via browser settings:
   - Go to browser settings → Privacy & Security → Clear browsing data
   - Select "Cookies and other site data"
   - Choose "All time" and clear

3. LOG IN AGAIN:
   - Go to http://localhost:5173/login-form
   - Enter your admin credentials
   - This will create a new token with the correct JWT secret

4. TEST:
   - Navigate to the routine tab
   - The getTeachers endpoint should now work correctly

🔐 This is a one-time fix needed after updating JWT secrets.
`);
