/**
 * Complete file verification script for backend deployment
 * Run this to check all critical files exist with correct names
 */
import fs from 'fs';
import path from 'path';

const requiredFiles = [
  // Core files
  'index.js',
  'package.json',
  '.env',
  
  // Config files
  'config/database.js',
  'config/init-db.js',
  
  // Controllers
  'controllers/noticeFetch/notice_fetch_controller.js',
  'controllers/admin/notice_controller.js',
  'controllers/login/login_before_roll_assign_controller.js',
  'controllers/logout/logout_controller.js',
  'controllers/authController.js',
  
  // Models
  'models/Admin.js',
  'models/Teacher.js',
  'models/Student.js',
  'models/Notice.js',
  'models/TeacherNotice.js',
  'models/TeacherPayroll.js',
  'models/Routine.js',
  'models/StudentFee.js',
  'models/LeaveRequest.js',
  'models/ClassFee.js',
  
  // Routes
  'routes/notice/GetNotice.js',
  'routes/login_logout/LoginRoute.js',
  'routes/login_logout/LogoutRoute.js',
  'routes/calendar.js',
  
  // Middleware
  'middleware/auth.js'
];

console.log('🔍 Verifying backend deployment files...\n');

let allFilesExist = true;
let missingFiles = [];

for (const file of requiredFiles) {
  const filePath = path.join(process.cwd(), file);
  
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ MISSING: ${file}`);
    allFilesExist = false;
    missingFiles.push(file);
  }
}

console.log('\n📊 Verification Results:');
console.log(`Total files checked: ${requiredFiles.length}`);
console.log(`Missing files: ${missingFiles.length}`);

if (allFilesExist) {
  console.log('\n🎉 All critical files present! Ready for deployment.');
} else {
  console.log('\n❌ Missing files found. Upload these files before deployment:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
}

// Check for common typos in filenames
console.log('\n🔍 Checking for filename issues...');
const controllersDir = 'controllers/noticeFetch';
try {
  const files = fs.readdirSync(controllersDir);
  console.log(`Files in ${controllersDir}:`);
  files.forEach(file => {
    if (file.includes('controller1') || file.includes('_1')) {
      console.log(`⚠️  SUSPICIOUS: ${file} (might be causing import errors)`);
    } else {
      console.log(`   ${file}`);
    }
  });
} catch (error) {
  console.log(`❌ Cannot read ${controllersDir}: ${error.message}`);
}

// Check GetNotice.js imports
console.log('\n🔍 Checking GetNotice.js imports...');
try {
  const getNoticeContent = fs.readFileSync('routes/notice/GetNotice.js', 'utf8');
  const importLines = getNoticeContent.split('\n').filter(line => line.includes('import'));
  importLines.forEach(line => {
    if (line.includes('controller1')) {
      console.log(`❌ FOUND TYPO: ${line.trim()}`);
    } else {
      console.log(`✅ ${line.trim()}`);
    }
  });
} catch (error) {
  console.log(`❌ Cannot read GetNotice.js: ${error.message}`);
}

console.log('\n📝 Next Steps:');
if (!allFilesExist) {
  console.log('1. Upload missing files to cPanel');
}
console.log('2. Ensure no files with "controller1" or "_1" exist');
console.log('3. Verify all import statements are correct');
console.log('4. Run npm install in cPanel');
console.log('5. Restart Node.js app');
