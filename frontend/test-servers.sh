#!/bin/bash

echo "================================"
echo "🔍 Banking System Diagnostic Test"
echo "================================"
echo ""

echo "1️⃣  Checking Frontend Server (Localhost:3002)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 -eq 200; then
    echo "   ✅ Frontend is RUNNING and RESPONDING"
else
    echo "   ❌ Frontend NOT responding on port 3002"
    echo "   Run: npm run dev --prefix D:\project\bank\frontend"
fi
echo ""

echo "2️⃣  Checking Backend API (Localhost:8080)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/swagger-ui/index.html -eq 200; then
    echo "   ✅ Backend API is RUNNING"
else
    echo "   ❌ Backend API NOT responding on port 8080"
    echo "   Backend must be running before starting frontend"
fi
echo ""

echo "3️⃣  Checking Port Availability..."
echo "   Checking port 3002..."
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ✅ Port 3002 is in use (frontend)"
else
    echo "   ❌ Port 3002 is NOT in use"
fi

echo "   Checking port 8080..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ✅ Port 8080 is in use (backend)"
else
    echo "   ❌ Port 8080 is NOT in use"
fi
echo ""

echo "4️⃣  Summary:"
echo "   Frontend: http://localhost:3002"
echo "   Backend: http://localhost:8080"
echo "   Swagger UI: http://localhost:8080/swagger-ui/index.html"
echo ""
echo "================================"
