/**
 * Test Different Request Body Formats for OKYC
 * Trying to find the correct format for /kyc/aadhaar/okyc/otp
 */

const API_KEY = 'key_live_bdc866212c0e40c78fcf4f41acd45bb1';
const API_SECRET = 'secret_live_943291b891064242852c18425341a379';
const BASE_URL = 'https://api.sandbox.co.in';

async function testOKYCFormats() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 Testing Different OKYC Request Body Formats');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Get access token first
  const authResponse = await fetch(`${BASE_URL}/authenticate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'x-api-secret': API_SECRET,
    },
  });

  const authData = await authResponse.json();
  const accessToken = authData.access_token || authData.data?.access_token;
  console.log('✅ Authenticated\n');

  const aadhaarNumber = '123456789012';

  // Try different request body formats
  const formats = [
    {
      name: 'Format 1: aadhaar_number + consent',
      body: {
        aadhaar_number: aadhaarNumber,
        consent: true,
      },
    },
    {
      name: 'Format 2: aadhaarNumber (camelCase)',
      body: {
        aadhaarNumber: aadhaarNumber,
        consent: true,
      },
    },
    {
      name: 'Format 3: id_number',
      body: {
        id_number: aadhaarNumber,
        consent: 'Y',
      },
    },
    {
      name: 'Format 4: aadhaar',
      body: {
        aadhaar: aadhaarNumber,
      },
    },
    {
      name: 'Format 5: With consent as string',
      body: {
        aadhaar_number: aadhaarNumber,
        consent: 'yes',
      },
    },
    {
      name: 'Format 6: Minimal',
      body: {
        aadhaar_number: aadhaarNumber,
      },
    },
  ];

  for (const format of formats) {
    console.log(`📝 Testing: ${format.name}`);
    console.log(`   Body:`, JSON.stringify(format.body));

    try {
      const response = await fetch(`${BASE_URL}/kyc/aadhaar/okyc/otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'x-api-secret': API_SECRET,
          'Authorization': accessToken,
          'x-api-version': '2.0',
        },
        body: JSON.stringify(format.body),
      });

      const data = await response.json();
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        console.log('   ✅ SUCCESS!');
        console.log('   Response:', JSON.stringify(data, null, 2));
        console.log('\n🎉 Found working format!\n');
        return;
      } else {
        console.log(`   ❌ Failed: ${data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('None of the formats worked. Need Sandbox documentation.');
  console.log('═══════════════════════════════════════════════════════════');
}

testOKYCFormats();
