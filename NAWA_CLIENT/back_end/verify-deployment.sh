#!/bin/bash
# Deployment Verification Script for cPanel
# Run this in your cPanel terminal to verify all files are uploaded correctly

echo "🔍 Verifying Backend Deployment..."
echo "Current directory: $(pwd)"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

echo "📁 Checking critical files..."

# Check main files
if [ -f "index.js" ]; then
    echo "✅ index.js found"
else
    echo "❌ index.js MISSING"
fi

if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json MISSING"
fi

if [ -f ".env" ]; then
    echo "✅ .env found"
else
    echo "❌ .env MISSING"
fi

# Check config directory
if [ -d "config" ]; then
    echo "✅ config directory found"
    if [ -f "config/database.js" ]; then
        echo "✅ config/database.js found"
    else
        echo "❌ config/database.js MISSING"
    fi
    if [ -f "config/init-db.js" ]; then
        echo "✅ config/init-db.js found"
    else
        echo "❌ config/init-db.js MISSING"
    fi
else
    echo "❌ config directory MISSING"
fi

# Check models directory
if [ -d "models" ]; then
    echo "✅ models directory found"
else
    echo "❌ models directory MISSING"
fi

# Check routes directory
if [ -d "routes" ]; then
    echo "✅ routes directory found"
else
    echo "❌ routes directory MISSING"
fi

# Check controllers directory
if [ -d "controllers" ]; then
    echo "✅ controllers directory found"
else
    echo "❌ controllers directory MISSING"
fi

echo ""
echo "📦 Checking node_modules..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules found"
else
    echo "❌ node_modules MISSING - Run: npm install"
fi

echo ""
echo "🔧 Testing basic Node.js syntax..."
node -c index.js && echo "✅ index.js syntax OK" || echo "❌ index.js syntax ERROR"

echo ""
echo "📋 File structure:"
ls -la

echo ""
echo "🚀 If all critical files are present, run:"
echo "npm install"
echo "npm run setup"
echo "npm start"
