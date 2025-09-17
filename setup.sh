#!/bin/bash
echo "🚀 Setting up WhatsApp Bot with Frontend Configuration..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install client dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install client dependencies
echo "📦 Migration database"
cd backend
npm run db:migrate
cd ..

# Seed admin user
echo "🌱 Creating admin user..."
cd backend
npm run seed
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start the development servers:"
echo "   npm run dev"
echo ""
echo "2. Open your browser and go to:"
echo "   http://localhost:3000"
echo ""
echo "3. Login with admin credentials:"
echo "   Username: admin"
echo "   Password: rahasia"
echo ""
echo "   Or create a new account if you prefer!"
echo ""
echo "📚 For more information, check the README.md file"
echo ""
echo "Happy coding! 🎊"
