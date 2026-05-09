/**
 * Sandbox KYC API Test Script
 * 
 * This script tests the Sandbox API authentication and KYC endpoints
 * to diagnose the "Insufficient privilege" error.
 * 
 * Run with: node test-sandbox-kyc.js
 * 
 * Requirements: Node.js 18+ (for native fetch support)
 */

// Sandbox API Configuration
const SANDBOX_CONFIG = {
  BASE_URL: 'https://api.sandbox.co.in',
  API_KEY: 'key_test_8d548e4b104b454bbcefe09d1fbbb4a7',
  API_SECRET: 'secret_test_007adeaa9a304513a1e7a9de7ee475dc',
  AUTH_ENDPOINT: '/authenticate',
  AADHAAR_OTP_ENDPOINT: '/kyc/aadhaar/offline/otp',
  API_VERSION: '2.0',
};

// Test Aadhaar number (use a valid test Aadhaar number if available)
const TEST_AADHAAR_NUMBER = '123456789012';

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...\n');
  console.log('Request URL:', `${SANDBOX_CONFIG.BASE_URL}${SANDBOX_CONFIG.AUTH_ENDPOINT}`);
  console.log('Headers:', {
    'Content-Type': 'application/json',
    'x-api-key': SANDBOX_CONFIG.API_KEY.substring(0, 20) + '...',
    'x-api-secret': SANDBOX_CONFIG.API_SECRET.substring(0, 20) + '...',
  });
  
  try {
    const response = await fetch(
      `${SANDBOX_CONFIG.BASE_URL}${SANDBOX_CONFIG.AUTH_ENDPOINT}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SANDBOX_CONFIG.API_KEY,
          'x-api-secret': SANDBOX_CONFIG.API_SECRET,
        },
      }
    );

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse JSON response:', responseText);
      return null;
    }

    console.log('Response Status:', response.status, response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response Body:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('❌ Authentication FAILED');
      console.error('Error:', responseData);
      return null;
    }

    if (!responseData.access_token) {
      console.error('❌ No access_token in response');
      return null;
    }

    console.log('✅ Authentication SUCCESS');
    console.log('Access Token:', responseData.access_token.substring(0, 20) + '...');
    console.log('Token Expires In:', responseData.expires_in, 'seconds');
    
    return responseData.access_token;
  } catch (error) {
    console.error('❌ Authentication Error:', error.message);
    console.error('Full Error:', error);
    return null;
  }
}

async function testKYCOTP(accessToken) {
  console.log('\n📱 Testing KYC OTP Generation...\n');
  console.log('Request URL:', `${SANDBOX_CONFIG.BASE_URL}${SANDBOX_CONFIG.AADHAAR_OTP_ENDPOINT}`);
  console.log('Request Body:', {
    aadhaar_number: TEST_AADHAAR_NUMBER.substring(0, 4) + '****' + TEST_AADHAAR_NUMBER.substring(8),
    consent: true,
  });
  
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': SANDBOX_CONFIG.API_KEY,
    'x-api-secret': SANDBOX_CONFIG.API_SECRET,
    'Authorization': `Bearer ${accessToken}`,
  };
  
  if (SANDBOX_CONFIG.API_VERSION) {
    headers['x-api-version'] = SANDBOX_CONFIG.API_VERSION;
  }
  
  console.log('Headers:', {
    'Content-Type': 'application/json',
    'x-api-key': SANDBOX_CONFIG.API_KEY.substring(0, 20) + '...',
    'x-api-secret': SANDBOX_CONFIG.API_SECRET.substring(0, 20) + '...',
    'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
    'x-api-version': SANDBOX_CONFIG.API_VERSION,
  });

  try {
    const response = await fetch(
      `${SANDBOX_CONFIG.BASE_URL}${SANDBOX_CONFIG.AADHAAR_OTP_ENDPOINT}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          aadhaar_number: TEST_AADHAAR_NUMBER,
          consent: true,
        }),
      }
    );

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse JSON response:', responseText);
      return;
    }

    console.log('\nResponse Status:', response.status, response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response Body:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('\n❌ KYC OTP Generation FAILED');
      
      if (response.status === 403) {
        console.error('\n🔴 ERROR: 403 Forbidden - Insufficient Privilege');
        console.error('\n📋 This means:');
        console.error('   1. Your API key can authenticate ✓');
        console.error('   2. Your API key does NOT have KYC permissions ✗');
        console.error('   3. You need to enable KYC services in Sandbox Dashboard');
        console.error('\n📝 Next Steps:');
        console.error('   1. Log in to https://developer.sandbox.co.in/');
        console.error('   2. Go to API Keys section');
        console.error('   3. Enable KYC permissions for your API key');
        console.error('   4. Check if your subscription includes KYC services');
        console.error('   5. Wait 5-10 minutes for changes to propagate');
        console.error('\n💡 Transaction ID:', responseData.transaction_id || 'N/A');
      } else if (response.status === 401) {
        console.error('\n🔴 ERROR: 401 Unauthorized');
        console.error('Authentication token might be invalid or expired');
      } else if (response.status === 400) {
        console.error('\n🔴 ERROR: 400 Bad Request');
        console.error('Request format might be incorrect. Check:');
        console.error('   - Endpoint path');
        console.error('   - Request body format');
        console.error('   - Required headers');
      } else {
        console.error('\n🔴 ERROR: Unexpected status code');
        console.error('Response:', responseData);
      }
      return;
    }

    if (responseData.request_id) {
      console.log('\n✅ KYC OTP Generation SUCCESS');
      console.log('Request ID:', responseData.request_id);
      console.log('Message:', responseData.message);
    } else {
      console.error('\n⚠️  WARNING: Response OK but no request_id found');
      console.error('Response:', responseData);
    }
  } catch (error) {
    console.error('\n❌ KYC OTP Generation Error:', error.message);
    console.error('Full Error:', error);
  }
}

async function testWithoutVersionHeader(accessToken) {
  console.log('\n🔍 Testing KYC OTP WITHOUT x-api-version header...\n');
  
  try {
    const response = await fetch(
      `${SANDBOX_CONFIG.BASE_URL}${SANDBOX_CONFIG.AADHAAR_OTP_ENDPOINT}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SANDBOX_CONFIG.API_KEY,
          'x-api-secret': SANDBOX_CONFIG.API_SECRET,
          'Authorization': `Bearer ${accessToken}`,
          // Intentionally NOT including x-api-version
        },
        body: JSON.stringify({
          aadhaar_number: TEST_AADHAAR_NUMBER,
          consent: true,
        }),
      }
    );

    const responseData = await response.json();
    console.log('Response Status:', response.status, response.statusText);
    console.log('Response:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('✅ SUCCESS without version header!');
      console.log('💡 Consider removing x-api-version header from your code');
    } else {
      console.log('❌ Still failing without version header');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testWithOnlineKYC(accessToken) {
  console.log('\n🔍 Testing Online KYC endpoint (instead of Offline)...\n');
  console.log('Trying: /kyc/aadhaar/okyc/otp');
  
  try {
    const response = await fetch(
      `${SANDBOX_CONFIG.BASE_URL}/kyc/aadhaar/okyc/otp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SANDBOX_CONFIG.API_KEY,
          'x-api-secret': SANDBOX_CONFIG.API_SECRET,
          'Authorization': `Bearer ${accessToken}`,
          'x-api-version': '2.0',
        },
        body: JSON.stringify({
          aadhaar_number: TEST_AADHAAR_NUMBER,
          consent: true,
        }),
      }
    );

    const responseData = await response.json();
    console.log('Response Status:', response.status, response.statusText);
    console.log('Response:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('✅ SUCCESS with Online KYC endpoint!');
      console.log('💡 Your subscription might only have Online KYC access');
      console.log('💡 Update endpoint to: /kyc/aadhaar/okyc/otp');
    } else {
      console.log('❌ Online KYC endpoint also failing');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 Sandbox KYC API Test Suite');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\nConfiguration:');
  console.log('  Base URL:', SANDBOX_CONFIG.BASE_URL);
  console.log('  API Key:', SANDBOX_CONFIG.API_KEY.substring(0, 20) + '...');
  console.log('  Test Aadhaar:', TEST_AADHAAR_NUMBER.substring(0, 4) + '****' + TEST_AADHAAR_NUMBER.substring(8));

  // Step 1: Test Authentication
  const accessToken = await testAuthentication();
  
  if (!accessToken) {
    console.log('\n❌ Cannot proceed without access token. Please check your API credentials.');
    return;
  }

  // Step 2: Test KYC OTP with current configuration
  await testKYCOTP(accessToken);

  // Step 3: Test without version header (optional diagnostic)
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('🔍 Additional Diagnostic Tests');
  console.log('═══════════════════════════════════════════════════════════');
  
  await testWithoutVersionHeader(accessToken);
  await testWithOnlineKYC(accessToken);

  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('✅ Test Suite Complete');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Fatal Error:', error);
  process.exit(1);
});

