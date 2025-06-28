import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Configuration
const API_BASE_URL = 'http://localhost:8000';
const EXCEL_FILE_PATH = path.join(process.cwd(), 'clean_student_import.xlsx');

// Test credentials (using the default admin account)
const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin123'
};

async function testStudentImport() {
  try {
    console.log('🚀 Starting Student Import Test...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS, {
      withCredentials: true // This is important for cookies
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response data:', loginResponse.data);
    
    // Extract cookies from the response
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies) {
      throw new Error('No cookies received from login');
    }
    
    console.log('✅ Login successful');
    console.log('🍪 Cookies received:', cookies.length);
    
    const cookieHeader = cookies.join('; ');
    console.log('🔑 Cookie header:', cookieHeader, '\n');

    // Step 2: Test template download
    console.log('2. Testing template download...');
    try {
      const templateResponse = await axios.get(`${API_BASE_URL}/api/admin/student-data/template`, {
        headers: {
          'Cookie': cookieHeader
        },
        responseType: 'arraybuffer'
      });
      
      console.log('✅ Template download successful');
      console.log(`📄 Template size: ${templateResponse.data.length} bytes\n`);
    } catch (templateError) {
      console.log('❌ Template download failed:', templateError.response?.status, templateError.response?.statusText);
      console.log('Error details:', templateError.response?.data?.toString() || templateError.message);
    }

    // Step 3: Test student data import
    console.log('3. Testing student data import...');
    
    // Check if Excel file exists
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      throw new Error(`Excel file not found: ${EXCEL_FILE_PATH}`);
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(EXCEL_FILE_PATH));
    formData.append('grade', '1'); // Test with grade 1
    formData.append('section', 'A'); // Test with section A
    
    console.log(`📁 File: ${EXCEL_FILE_PATH}`);
    console.log(`🎓 Grade: 1, Section: A`);
    
    const importResponse = await axios.post(
      `${API_BASE_URL}/api/admin/student-data/import`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Cookie': cookieHeader
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    console.log('✅ Import request successful');
    console.log('📊 Import results:', importResponse.data);
    
    if (importResponse.data.success) {
      console.log(`🎉 Successfully imported ${importResponse.data.imported} students!`);
      if (importResponse.data.errors && importResponse.data.errors.length > 0) {
        console.log('⚠️  Some validation errors occurred:');
        importResponse.data.errors.forEach(error => console.log(`   - ${error}`));
      }
    } else {
      console.log('❌ Import failed:', importResponse.data.message);
      if (importResponse.data.errors) {
        console.log('Errors:');
        importResponse.data.errors.forEach(error => console.log(`   - ${error}`));
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Cannot connect to server. Make sure the backend is running on http://localhost:8000');
    }
  }
}

// Additional utility function to test just the file format
async function validateExcelFormat() {
  console.log('📋 Validating Excel file format...\n');
  
  try {
    const XLSX = await import('xlsx');
    
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      console.log(`❌ Excel file not found: ${EXCEL_FILE_PATH}`);
      return;
    }
    
    const workbook = XLSX.default.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.default.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Found ${jsonData.length} rows of data`);
    
    if (jsonData.length > 0) {
      console.log('📋 Column headers:', Object.keys(jsonData[0]));
      console.log('📝 Sample row:', jsonData[0]);
      
      // Check required columns
      const requiredColumns = ['Student Name'];
      const optionalColumns = ['Address', "Father's Name", "Mother's Name", "Father's Phone", "Mother's Phone"];
      
      const missingRequired = requiredColumns.filter(col => !Object.keys(jsonData[0]).includes(col));
      if (missingRequired.length > 0) {
        console.log('❌ Missing required columns:', missingRequired);
      } else {
        console.log('✅ All required columns present');
      }
    }
    
  } catch (error) {
    console.error('❌ Excel validation failed:', error.message);
  }
}

// Run the tests
console.log('='.repeat(60));
console.log('         STUDENT IMPORT FUNCTIONALITY TEST');
console.log('='.repeat(60));

// First validate the Excel file format
await validateExcelFormat();

console.log('\n' + '-'.repeat(60));

// Then test the actual import
await testStudentImport();
