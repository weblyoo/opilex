#!/bin/bash

# Sandbox API Test Script
# Ready-to-run cURL commands for testing Sandbox KYC API
# 
# Usage:
#   chmod +x test_sandbox_api.sh
#   ./test_sandbox_api.sh

# =============================================================================
# CONFIGURATION - Update these with your API credentials
# =============================================================================

# ⚠️ IMPORTANT: Test credentials MUST use test environment URL
# Production credentials MUST use production environment URL
# Verify the correct environment URL with Sandbox documentation or support
BASE_URL="https://api.sandbox.co.in"  # ⚠️ Verify this is correct for test environment
API_KEY="key_test_8d548e4b104b454bbcefe09d1fbbb4a7"
API_SECRET="secret_test_007adeaa9a304513a1e7a9de7ee475dc"
API_VERSION="2.0"

# Test Aadhaar number (replace with actual test number if available)
AADHAAR_NUMBER="123456789012"

# =============================================================================
# COLORS FOR OUTPUT
# =============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# =============================================================================
# STEP 1: AUTHENTICATE
# =============================================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 1: Authenticating with Sandbox API${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

AUTH_RESPONSE=$(curl -s -X POST "${BASE_URL}/authenticate" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -H "x-api-secret: ${API_SECRET}")

echo "Response:"
echo "$AUTH_RESPONSE" | jq '.' 2>/dev/null || echo "$AUTH_RESPONSE"
echo ""

# Extract access token
ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.access_token' 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
  echo -e "${RED}❌ Authentication failed!${NC}"
  echo "Please check your API credentials."
  exit 1
fi

echo -e "${GREEN}✅ Authentication successful!${NC}"
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo ""

# =============================================================================
# STEP 2: GENERATE AADHAAR OTP
# =============================================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 2: Generating Aadhaar OTP${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

read -p "Enter 12-digit Aadhaar number (or press Enter to use default): " USER_AADHAAR
if [ -n "$USER_AADHAAR" ]; then
  AADHAAR_NUMBER="$USER_AADHAAR
fi

OTP_RESPONSE=$(curl -s -X POST "${BASE_URL}/kyc/aadhaar/offline/otp" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -H "x-api-secret: ${API_SECRET}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "x-api-version: ${API_VERSION}" \
  -d "{
    \"aadhaar_number\": \"${AADHAAR_NUMBER}\",
    \"consent\": true
  }")

echo "Response:"
echo "$OTP_RESPONSE" | jq '.' 2>/dev/null || echo "$OTP_RESPONSE"
echo ""

# Extract request_id
REQUEST_ID=$(echo "$OTP_RESPONSE" | jq -r '.request_id' 2>/dev/null)

if [ -z "$REQUEST_ID" ] || [ "$REQUEST_ID" == "null" ]; then
  echo -e "${RED}❌ OTP generation failed!${NC}"
  exit 1
fi

echo -e "${GREEN}✅ OTP generated successfully!${NC}"
echo "Request ID: $REQUEST_ID"
echo ""

# =============================================================================
# STEP 3: VERIFY AADHAAR OTP
# =============================================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 3: Verifying Aadhaar OTP${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

read -p "Enter 6-digit OTP received on mobile: " OTP

VERIFY_RESPONSE=$(curl -s -X POST "${BASE_URL}/kyc/aadhaar/offline/verify" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -H "x-api-secret: ${API_SECRET}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "x-api-version: ${API_VERSION}" \
  -d "{
    \"request_id\": \"${REQUEST_ID}\",
    \"otp\": \"${OTP}\"
  }")

echo "Response:"
echo "$VERIFY_RESPONSE" | jq '.' 2>/dev/null || echo "$VERIFY_RESPONSE"
echo ""

# Check if verification was successful
VERIFIED=$(echo "$VERIFY_RESPONSE" | jq -r '.verified' 2>/dev/null)

if [ "$VERIFIED" == "true" ]; then
  echo -e "${GREEN}✅ Aadhaar verification successful!${NC}"
  echo ""
  echo "Aadhaar Data:"
  echo "$VERIFY_RESPONSE" | jq '.aadhaar_data' 2>/dev/null || echo "Data not available"
else
  echo -e "${RED}❌ Aadhaar verification failed!${NC}"
  ERROR_MSG=$(echo "$VERIFY_RESPONSE" | jq -r '.message // .error' 2>/dev/null)
  if [ -n "$ERROR_MSG" ]; then
    echo "Error: $ERROR_MSG"
  fi
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Complete${NC}"
echo -e "${BLUE}========================================${NC}"

