#!/bin/bash

echo "🚀 Setting up Rider App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if api.js exists, if not copy from example
if [ ! -f "src/config/api.js" ]; then
    echo "🔧 Setting up API configuration..."
    cp src/config/api.example.js src/config/api.js
    echo "⚠️  IMPORTANT: Please edit src/config/api.js and add your API keys:"
    echo "   - LocationIQ API key (required for routing)"
    echo "   - Google Maps API key (optional)"
    echo ""
    echo "   Get LocationIQ API key: https://locationiq.com/"
    echo "   Get Google Maps API key: https://console.cloud.google.com/"
else
    echo "✅ API configuration already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit src/config/api.js and add your API keys"
echo "2. Run 'npm start' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Demo credentials:"
echo "   Email: captain@pilot.com"
echo "   Password: password123"
