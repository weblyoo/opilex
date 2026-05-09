// Debug script to check OTP sending status
// Run this with: node check-otp-sending.js

const fetch = require('node-fetch');

const apiKey = "AIzaSyCAGO0w4DOmPcNcvZ742kwePFdMyZTfx-c";
const phoneNumber = "+919462973337"; // Test phone number

async function checkOTPSending() {
  console.log('🔍 Checking OTP sending status...\n');
  console.log('Phone Number:', phoneNumber);
  console.log('API Key:', apiKey.substring(0, 20) + '...\n');

  try {
    console.log('📤 Sending request to Firebase Identity Toolkit API...');
    
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
        }),
      }
    );

    const data = await response.json();
    
    console.log('\n📥 Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ SUCCESS: OTP request accepted!');
      console.log('Session Info:', data.sessionInfo?.substring(0, 50) + '...');
      console.log('\n⚠️  Note: On mobile, you may still get reCAPTCHA errors.');
      console.log('Make sure SHA fingerprints are added to Firebase Console.');
    } else {
      console.log('\n❌ ERROR: OTP request failed');
      console.log('Error Code:', data.error?.code);
      console.log('Error Message:', data.error?.message);
      
      if (data.error?.code === 400) {
        console.log('\n💡 Possible causes:');
        console.log('1. Phone auth not enabled in Firebase Console');
        console.log('2. Missing reCAPTCHA token (required for REST API)');
        console.log('3. Invalid API key or project configuration');
      }
      
      if (data.error?.message?.includes('CAPTCHA') || data.error?.message?.includes('recaptcha')) {
        console.log('\n💡 CAPTCHA Error Detected:');
        console.log('This means Firebase requires app verification.');
        console.log('For mobile apps, you need to:');
        console.log('1. Add SHA-1 and SHA-256 fingerprints to Firebase Console');
        console.log('2. Or use a Cloud Function backend to handle phone auth');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Network Error:', error.message);
  }
}

checkOTPSending();

