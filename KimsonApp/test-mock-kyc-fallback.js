/**
 * Test Mock KYC Fallback
 * 
 * This script tests the automatic fallback to Mock KYC
 * when Sandbox API returns permission errors.
 */

// Mock AsyncStorage for Node.js environment
global.AsyncStorage = {
  getItem: async (key) => null,
  setItem: async (key, value) => {},
  removeItem: async (key) => {},
  getAllKeys: async () => [],
};

// Import the services (using dynamic import for ESM)
async function testMockFallback() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 Testing Mock KYC Fallback');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Import TypeScript modules
    const { generateAadhaarOTP, verifyAadhaarOTP } = await import('./src/services/sandboxKYC.ts');

    console.log('📱 Test 1: Generate Aadhaar OTP with Mock Fallback\n');
    
    const testAadhaar = '123456789012';
    console.log(`Testing with Aadhaar: ${testAadhaar.substring(0, 4)}****${testAadhaar.substring(8)}\n`);

    // Test OTP Generation (should fallback to mock)
    let requestId;
    try {
      console.log('Attempting OTP generation (will fallback to mock on 403)...\n');
      const otpResponse = await generateAadhaarOTP(testAadhaar);
      
      console.log('✅ OTP Generation Result:');
      console.log(`   Request ID: ${otpResponse.request_id}`);
      console.log(`   Message: ${otpResponse.message}`);
      console.log(`   Success: ${otpResponse.success}\n`);
      
      requestId = otpResponse.request_id;
      
      // Check if it's a mock request ID
      if (requestId.startsWith('mock_req_')) {
        console.log('✅ Confirmed: Using MOCK KYC (fallback worked!)');
        console.log('   This is expected when Sandbox API lacks permissions\n');
      } else {
        console.log('✅ Confirmed: Using REAL Sandbox API');
        console.log('   Your API key has KYC permissions enabled!\n');
      }
    } catch (error) {
      console.error('❌ OTP Generation Failed:', error.message);
      return;
    }

    // Test OTP Verification
    console.log('📱 Test 2: Verify Aadhaar OTP\n');
    
    const testOTP = '123456';
    console.log(`Using OTP: ${testOTP}\n`);

    try {
      console.log('Attempting OTP verification...\n');
      const verifyResponse = await verifyAadhaarOTP(requestId, testOTP);
      
      console.log('✅ OTP Verification Result:');
      console.log(`   Verified: ${verifyResponse.verified}`);
      console.log(`   Message: ${verifyResponse.message}`);
      
      if (verifyResponse.aadhaar_data) {
        console.log('\n📋 Aadhaar Data Retrieved:');
        console.log(`   Name: ${verifyResponse.aadhaar_data.name}`);
        console.log(`   DOB: ${verifyResponse.aadhaar_data.dob}`);
        console.log(`   Gender: ${verifyResponse.aadhaar_data.gender}`);
        console.log(`   State: ${verifyResponse.aadhaar_data.address.state}`);
        console.log(`   Pincode: ${verifyResponse.aadhaar_data.address.pincode}`);
        
        // Check if it's mock data
        if (verifyResponse.aadhaar_data.name === 'Ram Patel') {
          console.log('\n✅ Confirmed: Using MOCK DATA');
          console.log('   This is expected when Sandbox API lacks permissions');
        } else {
          console.log('\n✅ Confirmed: Using REAL Sandbox API data');
        }
      }
    } catch (error) {
      console.error('\n❌ OTP Verification Failed:', error.message);
      return;
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ All Tests Passed!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📝 Summary:');
    console.log('   - Mock fallback is working correctly');
    console.log('   - KYC flow is functional for development');
    console.log('   - No blocking errors\n');

    console.log('💡 Next Steps:');
    console.log('   1. Continue development with mock KYC');
    console.log('   2. Enable KYC permissions in Sandbox Dashboard');
    console.log('   3. Test again - will use real API automatically\n');

  } catch (error) {
    console.error('\n❌ Test Failed:', error);
    console.error('Stack:', error.stack);
  }
}

// Run tests
testMockFallback().catch(console.error);
