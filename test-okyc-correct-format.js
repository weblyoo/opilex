/**
 * Test OKYC with Correct Format from Sandbox Team
 * 
 * Correct format includes:
 * - @entity: Entity type identifier
 * - aadhaar_number: Aadhaar number
 * - consent: 'Y' or 'N' (string, not boolean)
 * - reason: Reason for KYC verification
 */

const API_KEY = 'key_live_bdc866212c0e40c78fcf4f41acd45bb1';
const API_SECRET = 'secret_live_943291b891064242852c18425341a379';
const BASE_URL = 'https://api.sandbox.co.in';

async function testOKYCCorrectFormat() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 Testing OKYC with Correct Format from Sandbox Team');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Step 1: Authenticate
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

    const accessToken = authData.access_token || authData.data?.access_token;
    console.log('✅ Authentication successful');
    console.log(`   Access token: ${accessToken.substring(0, 30)}...\n`);

    // Step 2: Generate OKYC OTP with CORRECT format
    console.log('📱 Step 2: Generating OKYC OTP (Correct Format)...\n');
    
    const aadhaarNumber = '123456789012';
    console.log(`   Aadhaar: ${aadhaarNumber.substring(0, 4)}****${aadhaarNumber.substring(8)}`);
    
    // ✅ CORRECT FORMAT from Sandbox team
    const requestBody = {
      '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.otp.request',
      aadhaar_number: aadhaarNumber,
      consent: 'Y',  // String 'Y' or 'N', not boolean
      reason: 'KYC verification for user onboarding'  // Required field
    };
    
    console.log('\n   Request Body:');
    console.log('   ' + JSON.stringify(requestBody, null, 2).split('\n').join('\n   '));
    console.log('');
    
    const otpResponse = await fetch(`${BASE_URL}/kyc/aadhaar/okyc/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-api-secret': API_SECRET,
        'Authorization': accessToken,  // No "Bearer" prefix
        'x-api-version': '2.0',
      },
      body: JSON.stringify(requestBody),
    });

    const otpData = await otpResponse.json();
    
    console.log(`   Response Status: ${otpResponse.status} ${otpResponse.statusText}`);
    console.log('   Response Body:');
    console.log('   ' + JSON.stringify(otpData, null, 2).split('\n').join('\n   '));
    console.log('');

    if (!otpResponse.ok) {
      console.error('❌ OTP generation failed');
      console.error('   Error:', otpData.message || otpData.error || 'Unknown error');
      
      if (otpResponse.status === 400) {
        console.log('\n⚠️  Still getting 400? Check:');
        console.log('   - @entity value is correct');
        console.log('   - consent is string "Y" not boolean');
        console.log('   - reason field is provided');
      }
      
      if (otpResponse.status === 403) {
        console.log('\n⚠️  Getting 403? Possible reasons:');
        console.log('   - LIVE key may not have OKYC permissions');
        console.log('   - Need to enable OKYC in Sandbox dashboard');
        console.log('   - Contact Sandbox support');
      }
      
      return;
    }

    console.log('✅ OTP Generation SUCCESS!');
    console.log(`   Request ID: ${otpData.request_id || otpData.data?.request_id || 'N/A'}`);
    console.log(`   Message: ${otpData.message || 'OTP sent successfully'}`);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎉 SUCCESS! Sandbox OKYC API is now working!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('✅ Your app can now use real Sandbox API');
    console.log('✅ Mock KYC fallback is still available if needed');
    console.log('✅ Ready for production!\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Run the test
testOKYCCorrectFormat();
