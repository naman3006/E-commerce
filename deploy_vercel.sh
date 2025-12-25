#!/bin/bash

# Vercel Deployment Helper Script
# Usage: ./deploy_vercel.sh

echo "========================================"
echo "   🚀 VoxMarket Vercel Deployment "
echo "========================================"

# 1. Pre-flight checks
echo "🔍 Checking environment..."
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed."
    exit 1
fi

# 2. Local Build Validation (Optional but recommended)
echo "🏗️  Running local build validation..."

echo "   👉 Building Frontend..."
cd frontend
if npm run build; then
    echo "   ✅ Frontend build successful."
else
    echo "   ❌ Frontend build failed! Please fix errors before deploying."
    exit 1
fi
cd ..

echo "   👉 Building Backend (Type Check)..."
cd backend
if npm run build; then
    echo "   ✅ Backend build successful."
else
    echo "   ❌ Backend build failed! Please fix errors before deploying."
    exit 1
fi
cd ..

echo "========================================"
echo "🔐 Vercel Authentication"
echo "========================================"
echo "You will now be prompted to log in to Vercel (if not already)."
echo "Follow the instructions in the browser."
echo ""
echo "========================================"
echo "📝 INTERACTIVE SETUP GUIDE"
echo "========================================"
echo "Vercel will ask you a few questions. Please answer as follows:"
echo ""
echo "1. Set up and deploy?                 👉 y"
echo "2. Which scope?                       👉 [Select your account]"
echo "3. Link to existing project?          👉 n (Type 'n' to create a new one)"
echo "4. What’s your project’s name?        👉 voxmarket (MUST BE LOWERCASE!)"
echo "5. In which directory?                👉 ./ (Just press Enter)"
echo "6. Change settings?                   👉 n"
echo "========================================"

# 4. Deploy
echo "🚀 Initiating Vercel Deployment..."

# Run vercel and check for failure
if npx -y vercel --prod; then
    echo ""
    echo "========================================"
    echo "✅ DEPLOYMENT SUCCESSFUL"
    echo "========================================"
    echo "Your live URL is shown above 👆 (look for 'Production')"
    echo "It will look like: https://voxmarket.vercel.app"
else
    echo ""
    echo "========================================"
    echo "❌ DEPLOYMENT FAILED"
    echo "========================================"
    echo "Please check the error message above."
    echo "Common fix: Ensure Project Name is LOWERCASE (e.g., 'voxmarket')."
fi
