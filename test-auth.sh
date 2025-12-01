#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 AI Resume Builder - Full Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Backend URL
BACKEND_URL="http://localhost:5001/api"
TEST_EMAIL="testuser$(date +%s)@test.com"
TEST_PASSWORD="testpass123"
TEST_NAME="Test User"

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}─────────────────────────────────────${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}─────────────────────────────────────${NC}\n"
}

# Function to check if API is reachable
check_backend() {
    print_header "1️⃣  Checking Backend Connection"
    
    response=$(curl -s "$BACKEND_URL/health")
    if echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✅ Backend is running on $BACKEND_URL${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend is not responding${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Function to test registration
test_registration() {
    print_header "2️⃣  Testing User Registration"
    
    echo "Creating user with:"
    echo "  Email: $TEST_EMAIL"
    echo "  Name: $TEST_NAME"
    echo "  Password: $TEST_PASSWORD"
    echo ""
    
    response=$(curl -s -X POST "$BACKEND_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$TEST_NAME\",
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\"
        }")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Registration successful${NC}"
        echo "Response: $response" | head -c 200
        echo ""
        return 0
    else
        echo -e "${RED}❌ Registration failed${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Function to test login
test_login() {
    print_header "3️⃣  Testing User Login"
    
    echo "Logging in with:"
    echo "  Email: $TEST_EMAIL"
    echo "  Password: $TEST_PASSWORD"
    echo ""
    
    response=$(curl -s -X POST "$BACKEND_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\"
        }")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Login successful${NC}"
        
        # Extract token
        TOKEN=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        echo "Token obtained: ${TOKEN:0:30}..."
        
        return 0
    else
        echo -e "${RED}❌ Login failed${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Function to test demo login
test_demo_login() {
    print_header "4️⃣  Testing Demo Account Login"
    
    response=$(curl -s -X POST "$BACKEND_URL/auth/demo" \
        -H "Content-Type: application/json" \
        -d '{}')
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Demo login successful${NC}"
        echo "Response: $response" | head -c 200
        echo ""
        
        # Extract token
        TOKEN=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        echo "Token obtained: ${TOKEN:0:30}..."
        
        return 0
    else
        echo -e "${RED}❌ Demo login failed${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Function to test profile endpoint
test_profile() {
    print_header "5️⃣  Testing Profile Endpoint (Protected)"
    
    if [ -z "$TOKEN" ]; then
        echo -e "${YELLOW}⚠️  No token available (login first)${NC}"
        return 1
    fi
    
    response=$(curl -s -X GET "$BACKEND_URL/auth/profile" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Profile fetch successful${NC}"
        echo "Response: $response" | head -c 200
        echo ""
        return 0
    else
        echo -e "${RED}❌ Profile fetch failed${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Main test execution
main() {
    TOTAL=0
    PASSED=0
    FAILED=0
    
    # Test 1: Backend Connection
    check_backend
    ((TOTAL++))
    if [ $? -eq 0 ]; then ((PASSED++)); else ((FAILED++)); fi
    
    # Test 2: Registration
    test_registration
    ((TOTAL++))
    if [ $? -eq 0 ]; then ((PASSED++)); else ((FAILED++)); fi
    
    # Test 3: Login
    test_login
    ((TOTAL++))
    if [ $? -eq 0 ]; then ((PASSED++)); else ((FAILED++)); fi
    
    # Test 4: Demo Login
    test_demo_login
    ((TOTAL++))
    if [ $? -eq 0 ]; then ((PASSED++)); else ((FAILED++)); fi
    
    # Test 5: Profile
    test_profile
    ((TOTAL++))
    if [ $? -eq 0 ]; then ((PASSED++)); else ((FAILED++)); fi
    
    # Print Summary
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}📊 Test Summary${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    echo -e "Total Tests: ${TOTAL}"
    echo -e "Passed: ${GREEN}${PASSED}${NC}"
    echo -e "Failed: ${RED}${FAILED}${NC}\n"
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
        echo -e "${GREEN}The application is fully functional.${NC}"
    else
        echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
    fi
    
    echo ""
}

# Run the tests
main
