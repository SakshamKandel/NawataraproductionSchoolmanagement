import fetch from 'node-fetch';

const baseURL = 'http://localhost:8000';

async function testAdminAPI() {
    console.log('🧪 Testing Admin API Endpoints...\n');

    try {
        // Test 1: Check if admin endpoint is accessible
        console.log('1. Testing admin list endpoint...');
        const response = await fetch(`${baseURL}/api/admins`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const admins = await response.json();
            console.log('✅ Admin endpoint accessible');
            console.log(`   Found ${admins.length} admin accounts:`);
            admins.forEach(admin => {
                console.log(`   - ${admin.email} (${admin.role})`);
            });
        } else {
            console.log('❌ Admin endpoint not accessible:', response.status);
        }

        // Test 2: Check health endpoint
        console.log('\n2. Testing health endpoint...');
        const healthResponse = await fetch(`${baseURL}/health`);
        if (healthResponse.ok) {
            console.log('✅ Server health check passed');
        } else {
            console.log('❌ Server health check failed');
        }

        console.log('\n🎉 API testing complete!');
        console.log('\n📋 Next steps:');
        console.log('   1. Open http://localhost:5180 in browser');
        console.log('   2. Login as admin@nawataraenglishschool.com');
        console.log('   3. Navigate to Manage Admins page');
        console.log('   4. Verify premium UI with gold banner and special styling');
        console.log('   5. Login as developer@nawataraenglishschool.com to test developer experience');

    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

testAdminAPI();
