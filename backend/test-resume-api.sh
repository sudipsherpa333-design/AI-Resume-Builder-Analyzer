#!/bin/bash

echo "🧪 TESTING RESUME API"
echo "===================="

echo ""
echo "1️⃣ Testing /api/resumes/test endpoint:"
curl -s http://localhost:5001/api/resumes/test | jq . 2>/dev/null || curl -s http://localhost:5001/api/resumes/test

echo ""
echo "2️⃣ Creating a new resume:"
RESPONSE=$(curl -s -X POST http://localhost:5001/api/resumes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWQyYzQwZjEwYzU0MjAwMWU5YjQ1NmIiLCJlbWFpbCI6InN1ZGlwLnNoZXJwYUBnbWFpbC5jb20iLCJuYW1lIjoiU3VkaXAgU2hlcnBhIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3Mzc0MjkwNTAsImV4cCI6MTczNzUxNTQ1MH0.8lPZHfL6_nzwE6bEQrtYlGIszNprm2fQbA0Zq24T_BA" \
  -d '{
    "title": "Test Resume Creation",
    "sections": {
      "personal": {
        "name": "Sudip Sherpa",
        "email": "sudip.sherpa@gmail.com"
      }
    }
  }')

echo "Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

echo ""
echo "3️⃣ Getting all resumes:"
GET_RESPONSE=$(curl -s -X GET http://localhost:5001/api/resumes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWQyYzQwZjEwYzU0MjAwMWU5YjQ1NmIiLCJlbWFpbCI6InN1ZGlwLnNoZXJwYUBnbWFpbC5jb20iLCJuYW1lIjoiU3VkaXAgU2hlcnBhIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3Mzc0MjkwNTAsImV4cCI6MTczNzUxNTQ1MH0.8lPZHfL6_nzwE6bEQrtYlGIszNprm2fQbA0Zq24T_BA")

echo "Response:"
echo "$GET_RESPONSE" | jq . 2>/dev/null || echo "$GET_RESPONSE"

echo ""
echo "✅ Tests completed!"
