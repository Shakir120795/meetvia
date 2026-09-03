#!/bin/bash

# Meetvia Development Environment Setup Script

echo "🚀 Setting up Meetvia development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create .env files if they don't exist
echo "📝 Setting up environment variables..."

if [ ! -f backend/.env ]; then
    echo "Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your actual values before running the services."
fi

if [ ! -f frontend/.env.local ]; then
    echo "Creating frontend/.env.local..."
    cat > frontend/.env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NODE_ENV=development
EOL
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Start services
echo "🐳 Starting Docker services..."
docker-compose up --build -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
cd backend && npx prisma migrate dev --name init && cd ..

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd backend && npx prisma generate && cd ..

# Seed database
echo "🌱 Seeding database with default data..."
cd backend && npm run seed && cd ..

echo "✅ Development environment setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Update backend/.env with your actual database credentials"
echo "2. Run 'docker-compose up' to start all services"
echo "3. Frontend will be available at http://localhost:3000"
echo "4. Backend API will be available at http://localhost:5000"
echo "5. PostgreSQL will be available at localhost:5432"
echo "6. Redis will be available at localhost:6379"