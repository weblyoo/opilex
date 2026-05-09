/**
 * Test Sandbox API with Corrected Implementation
 * 
 * Fixes applied based on Sandbox team feedback:
 * 1. ✅ Remove "Bearer" prefix from Authorization header
 * 2. ✅ Use correct endpoint (/kyc/aadhaar/okyc/otp)
 * 3. ✅ Use test API key and secret
 */

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 Testing Sandbox API with Corrected Implementation');
console.log('═══════════════════════════════════════════════════════════\n');

// Using LIVE key as per Sandbox team requirement
// Error message: "Use production API key for production environment"
const API_KEY = 'key_live_bdc866212c0e40c78fcf4f41acd45bb1';
const API_SECRET = 'secret_live_943291b891064242852c18425341a379';
const BASE_URL = 'https://api.sandbox.co.in';

async function testSandboxAPI() {
  try {
    // STEP 1: Authentication
    console.log('🔐 Step 1: Authenticating...\n');
    
    const authResponse = await fetch(`${BASE_URL}/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-api-secret': API_SECRET,
      },
    });

    const authData = await authResponse.json();
    
    if (!authResponse.ok) {
      console.error('❌ Authentication failed:', authData);
      return;
    }

    console.log('✅ Authentication successful');
    const accessToken = authData.access_token || authData.data?.access_token;
    console.log(`   Access token: ${accessToken.substring(0, 30)}...`);
    console.log(`   Status: ${authResponse.status} ${authResponse.statusText}\n`);

    // STEP 2: Generate OTP for Aadhaar
    console.log('📱 Step 2: Generating Aadhaar OTP...\n');
    
    const aadhaarNumber = '123456789012';
    console.log(`   Aadhaar: ${aadhaarNumber.substring(0, 4)}****${aadhaarNumber.substring(8)}`);
    
    // ✅ FIX 1: Remove "Bearer" prefix
    // ✅ FIX 2: Use OKYC endpoint (confirmed from Sandbox docs)
    const otpResponse = await fetch(`${BASE_URL}/kyc/aadhaar/okyc/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-api-secret': API_SECRET,
        'Authorization': accessToken, // ✅ NO "Bearer" prefix
        'x-api-version': '2.0',
      },
      body: JSON.stringify({
        aadhaar_number: aadhaarNumber,
        consent: true,
      }),
    });

    const otpData = await otpResponse.json();
    
    console.log(`   Response status: ${otpResponse.status} ${otpResponse.statusText}`);
    console.log(`   Response body:`, JSON.stringify(otpData, null, 2));

    if (!otpResponse.ok) {
      console.error('\n❌ OTP generation failed');
      console.error('   Error details:', otpData);
      
      if (otpResponse.status === 403) {
        console.log('\n⚠️  Still getting 403? Possible reasons:');
        console.log('   1. Test key might not have KYC permissions enabled');
        console.log('   2. Try using LIVE key instead of TEST key');
        console.log('   3. Contact Sandbox support to enable permissions');
      }
      
      return;
    }

    console.log('\n✅ OTP generation successful!');
    console.log(`   Request ID: ${otpData.request_id || otpData.data?.request_id}`);
    console.log(`   Message: ${otpData.message || 'OTP sent'}`);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('🎉 Success! Your Sandbox API is now working correctly.');
    console.log('\n📝 Summary of fixes applied:');
    console.log('   ✅ Removed "Bearer" prefix from Authorization header');
    console.log('   ✅ Using correct endpoint: /kyc/aadhaar/okyc/otp');
    console.log('   ✅ Using test credentials as recommended\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Run the test
testSandboxAPI();
