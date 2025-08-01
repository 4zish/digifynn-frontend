// Simple test script to verify the application is working
import http from 'http';

console.log('🧪 Testing DigiFynn Application...\n');

// Test 1: Health Check API
function testHealthAPI() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Health Check API:', response.status);
          console.log('   Response Time:', response.responseTime + 'ms');
          console.log('   Checks:', response.summary);
          resolve(true);
        } catch (error) {
          console.log('❌ Health Check API: Failed to parse response');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Health Check API: Connection failed');
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Health Check API: Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Test 2: Main Page
function testMainPage() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/',
      method: 'GET',
      headers: {
        'Accept': 'text/html'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Main Page: Loaded successfully');
          console.log('   Status Code:', res.statusCode);
          console.log('   Content Length:', data.length + ' bytes');
          console.log('   Contains "دیجی‌فاین":', data.includes('دیجی‌فاین'));
          resolve(true);
        } else {
          console.log('❌ Main Page: Failed with status', res.statusCode);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Main Page: Connection failed');
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Main Page: Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Test 3: Blog Page
function testBlogPage() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/blog',
      method: 'GET',
      headers: {
        'Accept': 'text/html'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Blog Page: Loaded successfully');
          console.log('   Status Code:', res.statusCode);
          console.log('   Content Length:', data.length + ' bytes');
          resolve(true);
        } else {
          console.log('❌ Blog Page: Failed with status', res.statusCode);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Blog Page: Connection failed');
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Blog Page: Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Test 4: Search Page
function testSearchPage() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/search',
      method: 'GET',
      headers: {
        'Accept': 'text/html'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Search Page: Loaded successfully');
          console.log('   Status Code:', res.statusCode);
          console.log('   Content Length:', data.length + ' bytes');
          resolve(true);
        } else {
          console.log('❌ Search Page: Failed with status', res.statusCode);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Search Page: Connection failed');
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Search Page: Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  const tests = [
    { name: 'Health Check API', fn: testHealthAPI },
    { name: 'Main Page', fn: testMainPage },
    { name: 'Blog Page', fn: testBlogPage },
    { name: 'Search Page', fn: testSearchPage }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n🔍 Testing ${test.name}...`);
      await test.fn();
      passed++;
    } catch (error) {
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }

  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! The application is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the application.');
  }
}

// Run the tests
runTests().catch(console.error); 